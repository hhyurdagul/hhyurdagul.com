+++
title = "Ikas — From Forecasts to Call-Center Staffing"
description = "Call-volume and handling-time forecasts turned into Erlang-based staffing requirements, alongside demand and revenue forecasting APIs."
date = 2026-10-15
weight = 5

[taxonomies]
tags = ["Time Series Forecasting", "Machine Learning", "FastAPI", "Python", "Operations Research"]

[extra]
short_title = "Ikas"
monogram = "Ik"
card_description = "Call-volume and handling-time forecasts connected to service-level targets and staffing requirements."
kind = "project"
status = "Completed"
role = "ML consultant and developer"
showcase = true
stack = ["Python", "FastAPI", "Pydantic", "Polars", "TensorFlow", "Tkinter", "Streamlit"]
+++

A call-volume forecast does not tell a manager how many agents need to be
available. Handling time matters too, as does the share of callers who should
reach an agent within a target waiting time.

For Ikas, I built forecasting tools and APIs that connect those inputs to
call-center staffing requirements. The engagement ran from September 2024 to
the end of 2025 and also covered demand and revenue forecasting, with Tkinter
and Streamlit interfaces alongside the API work.

## From two forecasts to one planning table

The call-center service loads a dated pair of models: one predicts calls per
hour, the other average handling time in seconds. Each model bundle carries
its configuration and, where needed, scalers and recent values for lagged
features.

The pipeline generates hourly calendar features, including Turkish holidays,
and supports ordinary and seasonal lookbacks. Its implemented schedule is
weekdays from 09:00 through 17:00. The two forecasts are joined on timestamp;
only matching hours go into the staffing calculation.

For each hour, the service returns the forecast call count and handling time
alongside the required agents, telephone lines, modeled service level,
utilization, queue measures, and average speed of answer. The forecast and its
operational interpretation stay in the same row.

## Staffing against a service-level target

The starting workload is **calls per hour × handling time / 3,600**, measured
in erlangs. That gives the average concurrent workload, not enough spare
capacity to meet a waiting-time target.

Erlang C estimates the probability that an arriving caller has to wait when
all agents are busy. The staffing solver increases the agent count until its
modeled fraction of calls answered within the requested time meets the
service-level target, with utilization below full capacity.

The API defaults to **85% answered within 15 seconds**; both values are
configurable. These are calculation settings, not a measured service-level
result. A separate waiting-time parameter, defaulting to 30 seconds, feeds an
abandonment estimate; it does not set the staffing target or impose a hard
maximum on waiting.

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
| `POST /erlang` | A list of call rates, handling times, and optional service-level settings | Staffing and queue estimates for each scenario |
| `POST /calculate` | Model-set ID, start and end dates, and optional service-level settings | Model metadata and timestamped forecasts with staffing estimates |

Pydantic parses the request types, constrains the service-level fraction to
0–1, and requires positive service and abandonment time thresholds. The
model-backed route rejects unknown model IDs, reversed or empty date ranges,
and starts before the model's supported start. Missing members of a model
pair return a not-found response. A period with no forecast rows returns an
empty data list.

This makes it possible to compare staffing scenarios with supplied inputs,
or request forecasts and staffing together, without duplicating the queueing
calculation in a user interface.

## Demand and revenue services

A separate FastAPI service exposes weekly revenue forecasts and product-demand
forecasts for three product lines, one endpoint each.

Each accepts `start_date` and `end_date` in ISO format and returns aligned
`date`, `predict`, and `real` arrays. Actuals are `null` where they are not yet
available, so a consumer can distinguish forecasts from observations.

The service loads saved recurrent models with their lag configuration,
recent history, and optional scaling and differencing artifacts. Forecasts
are generated recursively, transformed back to the original scale, and
clipped to non-negative values. The API has a typed response contract and a
Docker packaging path.

## Delivered scope and limits

The delivered work connected forecasting models, planning calculations,
user interfaces, and integration endpoints. It turned a predicted workload
into an explicit staffing requirement under chosen service-level settings,
rather than leaving that translation to a spreadsheet.

The staffing output is a capacity estimate, not a shift roster: it does not
schedule breaks, leave, or skill-based routing. Erlang C assumes a stable
queue with independent arrivals and a simplified handling-time distribution;
real peaks and caller behavior can differ. Its waiting and abandonment
outputs are model estimates, not observed outcomes.

The implemented call-center schedule is not a 24/7 forecast, and longer
recursive forecasts inherit uncertainty from earlier predictions. I do not
report an accuracy or cost-saving figure here: the API behavior alone does
not establish either. Client records, model artifacts, and operational data
are not published with this case study.
