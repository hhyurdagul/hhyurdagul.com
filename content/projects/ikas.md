+++
title = "Ikas — From Forecasts to Call-Center Staffing"
description = "Call-volume and handling-time forecasting with CatBoost, joined with Erlang C queue modeling to determine hourly call-center agent capacity."
date = 2026-10-15
weight = 5

[extra]
short_title = "Ikas"
monogram = "Ik"
card_description = "Hourly call-volume and handling-time forecasts (AHT error 29–49% below a last-week baseline on two test weeks) turned into Erlang C agent counts for an 85%-in-15-s target."
kind = "project"
status = "Deployed"
role = "Lead Engineer"
showcase = true
stack = ["Python", "FastAPI", "CatBoost", "TensorFlow", "Polars", "Pydantic", "Tkinter", "Streamlit"]
screenshot = "images/projects/ikas-demo.png"
screenshot_alt = "The Ikas walkthrough: a planner sets agents for one hour against an 85%-in-15-seconds target, with Erlang C service level, speed of answer and utilization computed live."
+++

A call-volume forecast does not tell a manager how many agents need to be
available. Handling time matters too, as does the share of callers who should
reach an agent within a target waiting time.

Ikas, a Turkish e-commerce platform, needed hourly agent requirements, not just
call forecasts. I built the forecasting models, Erlang C planning engine, APIs,
and Tkinter and Streamlit apps end to end; Ikas supplied the call-center data.
**On two held-out weeks, the handling-time model cut MAE 29–49% against copying
last week.** The engagement (September 2024–December 2025) also covered demand
and revenue forecasting. Everything it delivered is deployed and running.

{{ demo(name="ikas") }}

## From two forecasts to one planning table

The call-center service loads a dated pair of CatBoost models: one predicts
arrived (offered) calls per hour, the other average handling time (AHT) of
answered calls, in seconds. The call-count model uses calendar features only.
The AHT model also uses five seasonal lags, spaced nine forecast rows apart,
with its own predictions fed back recursively.

Each model bundle carries its configuration and scalers; only the AHT bundle
stores recent values for lagged features. Both models see hour, weekday, day,
month, season, year, and one date-level Turkish public-holiday flag. With the
locked `holidays` 0.83 rules, that flag excludes half-day eves; there is no
after-holiday feature. Holidays remain forecast dates, not automatic closures.
The implemented schedule is weekdays, nine timestamps from 09:00 through 17:00
inclusive. The two forecasts are joined on timestamp; only matching hours go
into the staffing calculation.

For each hour, the service returns the forecast call count and handling time
alongside the required agents, telephone lines, modeled service level,
utilization, queue measures, and average speed of answer. The forecast and its
operational interpretation stay in the same row.

## Forecast evaluation

Each test week (Monday–Friday, 09:00–17:00 inclusive, 45 hours) is forecast in one
run from Monday 09:00 by the model set dated that Monday, trained on data up to
the previous Friday: April 11 and August 15, respectively. No test-week actuals
are fed back. Against a same-hour-last-week baseline, CatBoost wins on both
targets in both weeks: widely on handling time and August volume, by only 4%
on April volume.

| Test week | Target | CatBoost MAE | Last-week baseline MAE | MAE change | MAPE: CatBoost / baseline |
| :--- | :--- | ---: | ---: | ---: | ---: |
| Apr 14–18, 2025 | Calls / hour | 5.84 | 6.11 | −4.4% | 18.4% / 19.1% |
| Apr 14–18, 2025 | Handling time (AHT) | **50.2 s** | 98.6 s | **−49.1%** | 12.2% / 24.9% |
| Aug 18–22, 2025 | Calls / hour | **5.40** | 9.18 | **−41.2%** | 18.8% / 33.8% |
| Aug 18–22, 2025 | Handling time (AHT) | **53.7 s** | 76.2 s | **−29.5%** | 12.6% / 18.9% |

MAE and MAPE average absolute and absolute percentage errors over the same 45
hours per week. Neither target has zeros in either test week.
Neither week was used for model selection or tuning. These are two short weeks,
scored from the saved model bundles, not a continuous production backtest.

## Staffing against a service-level target

The starting workload is **calls per hour × handling time / 3,600**, measured
in erlangs. That is the average number of calls in progress. Staffing exactly
that many agents leaves no spare capacity, so queues never drain.

Erlang C estimates the probability that an arriving caller has to wait when
all agents are busy. The staffing solver increases the agent count until its
modeled fraction of calls answered within the requested time meets the
service-level target, with utilization below full capacity.

The API defaults to **85% answered within 15 seconds**; both values are
configurable. These are calculation settings, not a measured service-level
result. A separate threshold (default 30 s) yields the modeled share of callers
waiting longer than that, which the API labels abandonment; it does not set the
staffing target or impose a hard maximum on waiting.

The calculation library also includes Erlang B for blocked-call probability
and extended Erlang B for immediate retries. The agent-sizing path uses
Erlang C, rather than treating blocked calls and queued calls as the same
problem.

## API contract

The call-center API separates direct scenario calculations from
model-backed planning:

| Endpoint | Input | Output |
| :--- | :--- | :--- |
| `GET /models` | No request body | Available dated model sets and their IDs |
| `POST /erlang` | A list of `calls_per_hour`, `aht_sec`, and optional service-level settings | Staffing and queue estimates for each scenario |
| `POST /calculate` | Integer `model_id`, `start_date`, `end_date`, and optional service-level settings | Model metadata and timestamped forecasts with staffing estimates |

Both POST routes accept `sla` (default 0.85), `service_time_sec` (15), and
`max_waiting_time_sec` (30). Pydantic parses request types and constrains the
service-level fraction to 0–1 and both time thresholds to positive values.
The model-backed route rejects unknown IDs, reversed or empty date ranges,
and starts before the model's supported start. A period with no forecast rows
returns an empty data list.

This makes it possible to compare staffing scenarios with supplied inputs,
or request forecasts and staffing together, without duplicating the queueing
calculation in a user interface.

## Demand and revenue services

A separate FastAPI service exposes weekly revenue forecasts and product-demand
forecasts for three product lines, one endpoint each, powered by TensorFlow
SimpleRNN models run recursively.

Each accepts `start_date` and `end_date` in ISO format and returns `date`,
`predict`, and `real` arrays of equal length. Actuals are placed by position,
not joined by date; `real` is padded with trailing `null` values after the last
available actual.

The service loads saved recurrent models with their lag configuration,
recent history, and optional scaling and differencing artifacts. Forecasts
are generated recursively, transformed back to the original scale, and
clipped to non-negative values. The API has a typed response contract and a
Docker packaging path.

## Delivered scope and limits

The delivered work connected forecasting models, planning calculations,
user interfaces, and integration endpoints. It turned a predicted workload
into an explicit staffing requirement under chosen service-level settings.

The staffing output is a net simultaneous capacity estimate, not a shift roster:
it applies no shrinkage or occupancy cap, and does not schedule breaks, leave,
or skill-based routing. Erlang C assumes a stable queue with independent arrivals
and a simplified handling-time distribution. The output labeled abandonment is
Erlang C's probability of waiting longer than the configured threshold, not an
Erlang A patience model or observed caller behavior. Point forecasts pass into
staffing with no uncertainty buffer.

The implemented call-center schedule is not a 24/7 forecast, and longer
recursive AHT forecasts inherit uncertainty from earlier predictions.
Forecasts are evaluated from each model set's dated origin; later start dates
reuse the saved AHT lag history without re-forecasting skipped hours. Client
records, model artifacts, and operational data are not published with this
case study.

## What I took from it

- **Forecast error and queue performance are different problems.** A forecast
  can look fine and still under-size the peak hour.
- **Keep the claims separate.** Forecast error, modeled staffing, and observed
  service levels each need their own evidence; the first does not prove the
  other two.
- **Copying last week is the bar.** It was close to CatBoost on April call
  volume, so a model has to earn its place target by target.
