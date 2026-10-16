+++
title = "MLStudio — Train and Compare Models"
description = "A web app for training, validating, and reusing regression and time-series models without model-specific code."
date = 2026-07-07
updated = 2026-10-15
weight = 6

[taxonomies]
tags = ["Machine Learning", "MLOps", "Streamlit", "Time Series Forecasting", "Python", "Product Engineering"]

[extra]
short_title = "MLStudio"
monogram = "ML"
card_description = "A desktop forecasting workbench used across 30+ organizations, cutting time to a first validated model from 10 working days to 2; rebuilt in Streamlit/PyTorch."
kind = "project"
status = "Deployed"
role = "Creator and lead engineer"
repo_url = "https://github.com/hhyurdagul/MLStudio"
showcase = true
stack = ["Python", "Streamlit", "Polars", "scikit-learn", "PyTorch", "XGBoost", "CatBoost"]
screenshot = "images/projects/mlstudio-running.png"
screenshot_alt = "MLStudio regression workspace with validation metrics and a prediction chart."
+++

MLStudio lets people train, validate, and reuse regression and time-series
models through a guided interface instead of model-specific code. Its original
Tkinter workbench grew out of my consulting work and was used across **30+
organizations**, cutting time to a first validated model from **10 working
days to 2**. I later rewrote it in Streamlit/PyTorch, separating the modeling
backend from the interface and adding time-aware validation and versioned model
bundles. Both figures refer to the desktop workbench.

{{ figure(src="/images/projects/mlstudio-running.png", alt="MLStudio supervised workspace with a synthetic energy dataset, an 80/20 split, validation metrics, and predicted-versus-actual values", caption="The supervised workspace on 240 synthetic energy-use rows: a linear regression on an 80/20 split, with validation metrics and predicted-versus-actual values.") }}

## What it does

- **Supervised models:** train, validate with random, ordered, or
  cross-validation splits (optionally with grid search and feature selection),
  or test a saved model on new data. Regressors include Random Forest, Gradient
  Boosting, SVR, XGBoost, CatBoost, and voting ensembles.
- **Neural time series:** MLP, CNN, RNN, GRU, LSTM, Bi-LSTM, and ConvLSTM
  models over lag windows chosen by index or by autocorrelation.
- **Metrics:** R², MAE, RMSE, and MAPE wherever labels are available.
- **Model bundles:** export a fitted model with its preprocessing and feature
  requirements, then reuse it on new data.

## Why the rewrite

In the desktop version, interface and modeling code were one class, so every
client-specific change risked the models. The rewrite's main change is a
boundary: the modeling backend has no Streamlit dependency, and an architecture
test fails if one appears. The interface can change without moving model logic
into page code, and bundles carry preprocessing, feature requirements, and
model state, so prediction runs exactly the steps training did.

## Evaluation and limits

Ordered data uses time-aware splits and folds, and recursive forecasts feed
predictions back into the model instead of peeking at actual future values.
MAPE skips zero targets, where it is undefined.

Missing-value imputation is not implemented yet. Bundles use Python
serialization, so load only trusted files built with compatible library
versions.
