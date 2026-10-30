+++
title = "Electricity Forecasting — The Turkish Grid"
description = "Zero-shot TimesFM forecasts benchmarked against EPİAŞ's official hourly demand plan."
date = 2025-03-20
updated = 2026-10-14
weight = 7

[extra]
short_title = "Electricity Forecasting"
monogram = "EF"
card_description = "Zero-shot TimesFM against the official EPİAŞ demand plan: 2.39% vs 2.92% MAPE on ordinary days, 12.67% vs 4.89% on holidays."
kind = "project"
status = "Completed"
role = "Lead AI / ML Engineer"
showcase = true
repo_url = "https://github.com/hhyurdagul/epias-demand-forecast"
stack = ["Python", "Polars", "Streamlit", "TimesFM 2.5", "PyTorch", "Parquet", "Uv"]
screenshot = "images/projects/electricity-demo.png"
screenshot_alt = "The electricity forecasting walkthrough on Eid al-Adha: actual demand, the TimesFM forecast and the EPİAŞ plan after the reader's call on which would land closer."
+++

Can a pretrained time-series foundation model, with no task-specific training,
compete with the official hourly demand plan that EPİAŞ publishes for the
Turkish grid? I built this forecasting and analysis application with Universal
Software's energy team to find out.

{{ figure(src="/images/projects/electricity-forecasting-running.png", alt="Streamlit backtest page with April 2026 metrics and overlaid actual, TimesFM, and EPİAŞ demand curves", caption="The backtest view for April 2026 at a 24-hour horizon: TimesFM (*predict*) against observed demand and the EPİAŞ plan over 720 scored hours, loaded from cached forecasts.") }}

{{ demo(name="electricity") }}

## What it does

- Pulls hourly consumption, the EPİAŞ demand plan, and meter data for all 21
  distribution companies from the EPİAŞ Transparency Platform into Parquet.
- Runs TimesFM 2.5 zero-shot with a 1,024-hour context window.
- Backtests 24-hour and 168-hour horizons from rolling forecast origins, using
  only information available at each forecast time. Results are cached, so
  repeat analysis is instant.
- Explores hourly meter multipliers by distributor, profile group, and
  meter-reading type.

{{ figure(src="assets/dashboard-distributor.png", alt="Distributor dashboard comparing hourly meter multipliers for two distribution companies across profile groups and meter-reading types", caption="The distributor dashboard: hourly meter multipliers for two distribution companies, broken down by profile group and meter-reading type.") }}

## Results and limits

Rolling backtests over **April–June 2026**, with about **1,800 scored hours per
horizon**, showed a clear trade-off:

| 24-hour MAPE | TimesFM | EPİAŞ plan |
| :--- | ---: | ---: |
| All reported hours | 3.47% | **3.13%** |
| Excluding public holidays | **2.39%** | 2.92% |
| Public holidays only | 12.67% | **4.89%** |

{{ figure(src="assets/backtest-daily-mae.png", alt="Daily mean absolute error of TimesFM and the EPİAŞ plan from April to mid-June 2026, with public holidays shaded", caption="Daily MAE across the 24-hour backtest. TimesFM's largest errors fall on public holidays, above all Eid al-Adha.") }}

On ordinary days the zero-shot model beat the official plan. On holidays the
ranking reversed sharply. That gap is explainable: TimesFM sees only demand
history, with no holiday calendar or weather, so it cannot anticipate a
national holiday, and at 168 hours the depressed demand lingers in its context
window afterwards. The next improvement is calendar awareness, not a bigger
univariate model.
