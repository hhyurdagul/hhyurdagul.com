+++
title = "FloodGuard — River and Flood Forecasting"
description = "AI river-discharge forecasting for FloodGuard, Via-Su's flood early-warning platform, running in national, Istanbul and Kocaeli warning systems, with station-level backtests on high-flow hours against persistence."
date = 2024-09-21
updated = 2026-10-31
weight = 2
aliases = ["/projects/teus/"]

[extra]
short_title = "FloodGuard"
monogram = "FG"
card_description = "Hourly river-discharge forecasting running in three flood early-warning systems. Flood-peak errors stay under 10% outside small, flashy basins; on every top-1% hour the selected GRU beats persistence at 3 of 4 evaluable stations, but none passes the 10% gate yet."
kind = "project"
status = "Deployed · Active R&D"
role = "Lead Engineer"
showcase = true
repo_url = "https://github.com/hhyurdagul/Teus"
product_url = "https://www.via-su.com/tr/floodguard/"
stack = ["Python", "PyTorch", "scikit-learn", "Polars", "FastAPI"]
screenshot = "images/projects/floodguard-demo.png"
screenshot_alt = "Illustrative FloodGuard walkthrough: observed discharge at D22A114 rising to 72 m³/s, the traced seq2seq forecast, and synthetic seasonal-naive and Ridge lines."
+++

[FloodGuard](https://www.via-su.com/tr/floodguard/) is the flood forecasting
and early-warning platform of Via-Su, Universal's water company. Its AI side
forecasts hourly river discharge and evaluates models specifically on the rare
high-flow events that average scores hide. It runs in three warning systems:

- **TATUS**, the flood forecasting and early-warning system of Türkiye's
  Ministry of Agriculture and Forestry
- **İTEUS**, İSKİ's Istanbul flood early-warning system
- **Kocaeli İSU**, for the Sarıdere basin

The R&D is TÜBİTAK 1832 project 3248302 (Green Transformation in Industry, 2024-2
call). The code started as Teus, which is still the repository's name.

I lead the AI side end to end: the forecasting design, data, models,
evaluation, and serving. I worked with Via-Su's hydrology engineers and my own
engineers, five people in total.

Peak errors on flood events stay under 10% at stations like D22A114 in the
older seq2seq event runs; small, flashy basins such as D08A084 are the exception
(below). Scored on every top-1% high-flow hour, a stricter test, the
station-selected GRU beats persistence at three of the four GRU stations with
high-flow test hours (27.6% vs 44.3% high-flow MAPE at D13A074), but no station
meets the newer campaign's high-flow-hour accuracy gate yet.

{{ demo(name="floodguard") }}

{{ figure(src="assets/d22a114-flood-forecast.png", alt="Seq2seq forecast closely tracking observed discharge as station D22A114 rises from about 5 to 72 cubic meters per second", caption="Station D22A114, July 2023: a seq2seq forecast (orange), issued once before the event day and covering its 24 hours, against observed discharge (blue) as the river rose from about 5 to 72 m³/s in four hours. A selected event, not a campaign-wide score. Labels are Turkish: *Taşkın* = flood (peak hour), *Horizon 24* = the 24-hour output window, *Debi* = discharge, *Değer* = value, *Tarih* = date.") }}

## The problem

{{ figure(src="assets/d22a114-overview.png", alt="Five years of hourly discharge and rainfall at station D22A114, with a handful of flood events marked in red", caption="Five years at D22A114: discharge (dark blue), rainfall (light blue, inverted), and flood events (red). The events that matter are a tiny share of the record.") }}

Floods are rare and fast, which creates three traps:

- A model that repeats normal conditions scores well on the full series and
  still misses every flood.
- Flashy basins go from baseflow to peak within hours, so discharge history
  alone gives little warning; rainfall has to be an input.
- Ordinary MAPE explodes near zero flow. FloodGuard reports **thresholded MAPE**,
  scored only on hours above a station's discharge-quantile threshold.

## What it does

- Compares classical and neural models, from Ridge baselines to a seq2seq LSTM
  with attention and GRUs, on discharge and basin-weighted rainfall.
- Scores peak-event windows with expanding-window backtests, separately from
  ordinary flow.
- Writes every completed, persisted run's predictions, metrics, plots, fitted
  model, and manifest to an inspectable report.
- Serves checkpoints that pass loading and input-contract checks through a
  FastAPI forecast service.

Older event runs issued 24- and 72-hour forecasts with the seq2seq model: at
origin t the model reads t − 168 to t and predicts every hour from t + 1 to
t + 24, or to t + 72.

The newer campaign scores **1–12-hour leads at eight stations** against
persistence and seasonal-naive baselines on top-1% discharge hours. They are
separate experiments, not one benchmark matrix.

{{ figure(src="/images/projects/floodguard-running.png", alt="Run report for a Ridge baseline: run settings, a per-event metrics table, and RMSE and thresholded-MAPE charts", caption="A run report for a Ridge baseline: 168 hours of history, a 72-hour horizon, three event backtests. Every completed, persisted run produces one, so weak baselines stay as visible as strong models.") }}

## Results and limits

Selected events show both sides of the model. At D22A114 it matched a sharp
peak closely. At D08A084, a small and flashy basin, it caught the rise but
underestimated the magnitude and peaked an hour late:

{{ figure(src="assets/d08a084-hard-event.png", alt="Forecast at station D08A084 with an on-time rise and a peak an hour late, near 5 cubic meters per second against an observed peak near 20", caption="Station D08A084, April 2021: the rise starts on time and the forecast peaks an hour late, at about 5 m³/s against an observed peak near 20 m³/s. Labels are Turkish: *Taşkın* = flood (peak hour), *Horizon 24* = the 24-hour output window, *Değer* = value, *Tarih* = date.") }}

The per-station numbers come from the newer campaign: station-selected models,
high-flow MAPE pooled over leads of 1–12 hours. They are not results for the
older seq2seq model in the figures above. Models were selected per station on
a chronological validation period; the table scores the later test period
(50/30/20 train/validation/test split with a 24-hour embargo). Selection uses a
training-period P99 threshold; evaluation uses a threshold fitted through the
validation period. Each legal hourly origin contributes forecasts at leads
1–12, so one high-flow target hour can contribute up to 12 scored pairs; the
hour counts below are distinct target hours. That final interval has since
been reused for diagnostics, so treat these as historical scores, not a fresh
holdout.

| Station | High-flow hours (top 1%) | Selected model | Selected model MAPE | Persistence | Seasonal-naive |
| :--- | ---: | :--- | ---: | ---: | ---: |
| D13A074 | 117 | GRU | **27.6%** | 44.3% | 73.8% |
| D22A114 | 91 | GRU | **37.1%** | 50.0% | 72.8% |
| D08A084 | 77 | GRU | **68.6%** | 79.3% | 111.5% |
| D08A115 | 13 | GRU | 68.8% | **64.4%** | 90.6% |
| E13A031 | 136 | AutoARIMA | 100.0% | — | — |
| D22A082 | 6 | Persistence | 74.7% | 74.7% | — |
| D08A071 | 0 | GRU | — | — | — |
| E13A035 | 0 | N-HiTS with future rain | — | — | — |

— = not exported for this station, or no high-flow test hours to score.

No station passes the newer campaign's promotion gate: at least 24 high-flow
hours, high-flow MAPE under 10%, and valid outputs. The GRU beats persistence
at three of the four GRU stations with high-flow test hours; D08A115's
comparison rests on only 13 hours, below the gate's minimum. E13A031, the
station with the most high-flow hours, has no useful model: its selected model
produces a constant forecast. At D22A082, plain persistence was the best
candidate, and two stations had no high-flow test hours at all.

These evaluations are conditional experiments: the backtests feed in observed
future rainfall rather than archived meteorological forecasts. They evaluate
how models map rainfall to runoff when precipitation is known, not end-to-end
warning accuracy.

A high-flow hour is a statistical top-1% exceedance, not an approved civil
flood stage. At D08A084, 12 hours ahead, the model caught 27 of 77 exceedance
hours, missed 50, and raised 8 false-alarm hours.

The older seq2seq models run in production through FastAPI in TATUS, İTEUS
and Kocaeli İSU, with numerical weather forecasts as the rainfall input. The
newer per-station campaign above decides whether candidates replace them;
none passes the promotion gate yet. Its conditional backtests do not measure
live warning accuracy.

## What I took from it

- **A good selected hydrograph isn't an accuracy claim.** The D22A114 event
  looks excellent; the station table is what a warning system lives with.
- **Persistence is the baseline to beat.** At short leads, repeating the last
  value is far stronger than repeating yesterday; it beat the GRU at one station
  and was the best candidate at another.
- **Decide what exists at forecast time before scoring.** Observed rainfall
  answers a hydrological question; only issued forecasts answer the warning
  question.
- **Report every station.** The ones without enough high-flow hours, or without
  a useful model, are part of the result.
