+++
title = "Teus — River and Flood Forecasting"
description = "Hourly river-discharge forecasting for eight stations: 11% thresholded MAPE on flood peaks 24 h ahead, vs 38% seasonal-naive."
date = 2024-09-21
updated = 2026-10-19
weight = 1

[taxonomies]
tags = ["Deep Learning", "Time Series Forecasting", "Hydrology", "PyTorch", "Python"]

[extra]
short_title = "Teus"
featured_title = "Forecasting rivers. Studying the floods."
featured_label = "Flood forecasting"
featured_topic = "Deep learning & hydrology"
featured_image = "projects/teus/assets/d22a114-flood-forecast.png"
og_image = "assets/d22a114-flood-forecast.png"
kind = "project"
status = "Research & model serving"
role = "Co-lead, ML engineering"
repo_url = "https://github.com/hhyurdagul/Teus"
showcase = true
stack = ["Python", "PyTorch", "scikit-learn", "Polars", "FastAPI", "NeuralForecast"]
screenshot = "images/projects/teus-running.png"
screenshot_alt = "Teus run report for a Ridge baseline with per-event metrics and error charts."
+++

Teus forecasts hourly river discharge and evaluates every model on the rare
flood events that average scores hide. It is a ₺4.5M TÜBİTAK 1832 R&D project
that I co-lead with a hydraulic engineer; I own the data, modeling, evaluation,
and serving work. In backtests across all eight stations, its attention-based
seq2seq model forecasts flood peaks 24 hours ahead at 11% thresholded MAPE,
against 38% for a seasonal-naive baseline.

{{ figure(src="assets/d22a114-flood-forecast.png", alt="24-hour seq2seq forecast closely tracking observed discharge as station D22A114 rises from about 5 to 72 cubic metres per second", caption="Station D22A114, July 2023: a 24-hour seq2seq forecast (orange) against observed discharge (blue) as the river rose from about 5 to 72 m³/s in four hours. A selected event, forecast with 72-hour rainfall forecasts from meteorological institutions as input. Labels are Turkish: *Debi* = discharge, *Tarih* = date.") }}

## The problem

{{ figure(src="assets/d22a114-overview.png", alt="Five years of hourly discharge and rainfall at station D22A114, with a handful of flood events marked in red", caption="Five years at D22A114: discharge (dark blue), rainfall (light blue, inverted), and flood events (red). The events that matter are a tiny share of the record.") }}

Floods are a small fraction of each station's hourly record, which creates
three traps:

- A model that repeats normal conditions scores well on the full series and
  still misses every flood.
- Flashy basins go from baseflow to peak within hours, so discharge history
  alone gives little warning; rainfall has to be an input.
- Ordinary MAPE explodes near zero flow. Teus reports **thresholded MAPE**,
  scored only on hours above a station's discharge-quantile threshold.

## What it does

- Compares classical and neural models, from Ridge baselines to a seq2seq LSTM
  with attention, on discharge and basin-weighted rainfall.
- Scores peak-event windows with expanding-window backtests, separately from
  ordinary flow.
- Writes every run's predictions, metrics, plots, fitted model, and manifest to
  an inspectable report.
- Serves checkpoints that pass loading and input-contract checks through a
  FastAPI forecast service.

Experiments cover **1–72-hour horizons across eight stations**. The headline
result is at **24 hours**: 11% thresholded MAPE on flood peaks, against 38% for
seasonal-naive.

{{ figure(src="/images/projects/teus-running.png", alt="Teus run report for a Ridge baseline: run settings, a per-event metrics table, and RMSE and thresholded-MAPE charts", caption="A run report for a Ridge baseline: 168 hours of history, a 72-hour horizon, three event backtests. Every run produces one, so weak baselines stay as visible as strong models.") }}

{{ diagram(name="teus", alt="Teus pipeline: station discharge and rain gauges become hourly data with basin-weighted rainfall, threshold-selected peak-event windows, expanding-window backtests, and reproducible run artifacts; registered candidates pass checkpoint validation to become the serving champion behind the FastAPI forecast service.") }}

## Results and limits

Selected events show both sides of the model. At D22A114 it matched a sharp
peak closely. At D08A084, a small and flashy basin, it caught the timing but
not the magnitude:

{{ figure(src="assets/d08a084-hard-event.png", alt="Forecast at station D08A084 that rises at the right time but peaks near 5 cubic metres per second against an observed peak near 20", caption="Station D08A084, April 2021: the right timing, but about 5 m³/s predicted against an observed peak near 20 m³/s.") }}

Across all eight stations, in expanding-window backtests, the seq2seq model
forecast flood peaks 24 hours ahead at **11% thresholded MAPE**, against **38%**
for a seasonal-naive baseline. Rainfall input comes from 72-hour forecasts
issued by meteorological institutions, the same input a live system would have.
The selected events above show what that average hides: sharp peaks matched
closely at some stations, and flashy small basins where timing is right but
magnitude is not.

Checkpoint serving works. An operational warning system still needs domain
review and authorized use.
