+++
title = "Electricity Forecasting — The Turkish Grid"
description = "Zero-shot TimesFM vs EPİAŞ's official hourly demand plan over 1,824 hours: TimesFM 3.47% vs plan 3.13% MAPE at 24 h; TimesFM leads on ordinary hours, fails on holidays and falls well behind at 168 h."
date = 2026-03-20
updated = 2026-10-31
weight = 4

[extra]
short_title = "Electricity Forecasting"
monogram = "EF"
card_description = "Zero-shot TimesFM vs the official EPİAŞ plan: 3.47% vs 3.13% MAPE overall at 24 h. Ahead on ordinary hours (2.57% vs 3.05%), far behind on holidays (11.79% vs 3.91%)."
kind = "project"
status = "Deployed"
role = "Lead Engineer"
showcase = true
repo_url = "https://github.com/hhyurdagul/epias-demand-forecast"
stack = ["Python", "Polars", "Streamlit", "TimesFM 2.5", "PyTorch", "Parquet", "uv"]
screenshot = "images/projects/electricity-demo.png"
screenshot_alt = "Illustrative walkthrough frame on Eid al-Adha: synthetic demand with stand-in TimesFM and EPİAŞ-plan curves, after the reader's call on which would land closer."
+++

Can a pretrained time-series foundation model, with no task-specific training,
compete with the official hourly demand plan that EPİAŞ publishes for the
Turkish grid? I built this forecasting app and explorer end to end for
Universal Software's energy team, from the EPİAŞ API pipeline to the app. It is
deployed and running. The team allocates resources using the exact TimesFM
point forecasts the app produces.

**Result:** at 24 hours the plan is ahead (TimesFM 3.47% vs plan 3.13% MAPE over
1,824 hours, April 1–June 16, 2026). TimesFM leads on ordinary hours (2.57% vs
3.05%), fails on public holidays (11.79% vs 3.91%) and beats all three naive
baselines; at 168 hours it falls well behind.

{{ figure(src="/images/projects/electricity-forecasting-running.png", alt="Streamlit backtest page with April 2026 metrics and overlaid actual, TimesFM, and EPİAŞ demand curves", caption="The backtest view for April 2026 at a 24-hour horizon, TimesFM's best month (TimesFM 1.89% vs plan 2.89% MAPE over 720 scored hours), loaded from cached forecasts. Over the full evaluation window the plan is ahead.") }}

{{ demo(name="electricity") }}

## What it does

- Pulls hourly consumption, the EPİAŞ demand plan, and profiling multipliers for all 21
  distribution companies through my own EPİAŞ Transparency Platform API client,
  which turns the JSON responses into Parquet tables and keeps the app current.
- Runs TimesFM 2.5 zero-shot with a 1,024-hour context window.
- Runs forward TimesFM forecasts from the latest consumption data on a Forecast
  page, next to the EPİAŞ plan, and scores observed hours against actual demand
  where the plan is available.
- Backtests 24-hour and 168-hour horizons from rolling forecast origins in a
  retrospective comparison. TimesFM sees demand history up to each origin; results
  are cached so repeat analysis is instant.
- Includes a separate explorer for EPİAŞ profiling multipliers across distribution
  companies, profile groups, and meter-reading types; it is not used in the forecast.

## Results and limits

Retrospective backtests from April 1 to June 16, 2026 (Istanbul time). At 24
hours the plan is more accurate overall; TimesFM is ahead on ordinary hours and
far behind on holidays:

| 24-hour MAPE | Hours | TimesFM 2.5 | EPİAŞ plan | TimesFM − plan (pp) |
| :--- | ---: | ---: | ---: | ---: |
| **All hours** | 1,824 | 3.47% | **3.13%** | +0.34 |
| Ordinary hours | 1,645 | **2.57%** | 3.05% | −0.48 |
| Public holiday hours | 179 | 11.79% | **3.91%** | +7.88 |

*Holidays: National Sovereignty and Children's Day (Apr 23), Labour Day (May 1), Commemoration of Atatürk (May 19), and Eid al-Adha (May 26 from 13:00, and May 27–30).*

Against all three naive history-only baselines on the same 1,824 hours, TimesFM
is more accurate by MAPE; against the plan it is not:

| 24-hour horizon, 1,824 hours | MAPE |
| :--- | ---: |
| Persistence (last observed hour) | 11.00% |
| Same hour last week | 7.72% |
| Same hour yesterday | 5.72% |
| TimesFM 2.5 (zero-shot) | 3.47% |
| EPİAŞ day-ahead plan | **3.13%** |

Overall MAE is TimesFM 1,244 vs plan 1,144 MWh. Between 17:00 and 21:00 (five
hours a day, 380 hours) the plan's edge widens: TimesFM 1,442 vs plan 1,085 MWh
MAE. A daily-MAE test over 76 scored days puts TimesFM 100 MWh behind the plan
(95% CI −267 to +467 MWh, p = 0.59). At 24 hours this test cannot separate their
mean absolute errors; it does not test the MAPE gap or show the forecasts are equal.

{{ figure(src="assets/backtest-daily-mae.png", alt="Daily mean absolute error of TimesFM and the EPİAŞ plan from April to mid-June 2026, with Eid al-Adha shaded", caption="Daily MAE across the 24-hour backtest. TimesFM's worst days are around Eid al-Adha, with large errors also on Apr 23, May 1, May 19, and June 1.") }}

The ordinary-hour lead is not consistent: in June alone the plan also leads on
ordinary hours (TimesFM 2.70% vs plan 2.41%). TimesFM sees only demand history,
without holiday calendars or weather, so it cannot anticipate a national holiday.

At 168 hours the plan is a reference, not a matched competitor: its figures are
successive day-ahead plans, most of which would not exist yet at a week-ahead
origin. Even so, TimesFM falls well behind from May:

| 168-hour MAPE | Hours | TimesFM 2.5 | EPİAŞ plan |
| :--- | ---: | ---: | ---: |
| Apr 1–28 | 672 | **2.59%** | 2.96% |
| May 1–28 | 648 | 8.40% | **3.40%** |
| Jun 1–14 | 336 | 8.37% | **2.38%** |
| **All** | 1,656 | 6.04% | **3.01%** |

New blocks start daily (24 h) or weekly (168 h) without overlap, and each
metric pools every lead in the block.

After Eid the low days sit in TimesFM's context window; the June 1 block
underforecasts throughout (12.18% MAPE, mean bias −4,815 MWh), consistent with
that explanation, though the mechanism is untested.

This is a retrospective comparison, not a matched operational trial. Nothing
was tuned on the evaluation period: TimesFM runs zero-shot, and the evaluation
window and context length were set before scoring. The holiday split diagnoses that run;
it is not a tuned rule.

The errors around Eid fit missing calendar information, but I haven't tested
calendar features yet. That is the next experiment, not a result.

{{ figure(src="assets/dashboard-distributor.png", alt="Distributor dashboard comparing hourly profiling multipliers for two distribution companies across profile groups and meter-reading types", caption="The distributor dashboard: hourly profiling multipliers for two distribution companies, broken down by profile group and meter-reading type.") }}

## What I took from it

- **A winning slice isn't a forecasting policy.** TimesFM led on ordinary
  hours, but not in June and not overall; the full window is the result.
- **A zero-shot model is a strong floor, not a replacement.** It beat all three
  naive baselines without training, but did not beat a plan that knows the calendar.
- **Name the metric before ranking.** The plan's 0.34-point MAPE lead over
  1,824 hours looks decisive, but a daily-MAE test over 76 days could not
  separate their mean absolute errors. That test does not establish a MAPE tie.
