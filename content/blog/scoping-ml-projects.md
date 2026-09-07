+++
title = "Scoping ML projects that survive production"
description = "Consulting notes: the discovery questions and pilot structure that separate ML projects that ship from ones that stall."
date = 2026-05-30

[taxonomies]
tags = ["Consulting", "MLOps", "Opinion"]

[extra]
kind = "post"
+++

## Start from the decision, not the dataset

Every scoping conversation should open with the same question: *what decision will this model change, and who owns that decision?* If nobody can name the decision-maker, there is no project yet — there is a research interest. Price those differently.

## The pilot contract

A pilot that survives contact with production has four clauses, agreed in writing before training starts:

- **Success metric with a number.** "Better churn prediction" is not a metric. "Top-decile precision above 35% on last quarter's holdout" is.
- **Baseline to beat.** Usually a heuristic the team already runs. If the model can't beat the heuristic by a margin worth operating, stop.
- **Data access with a date.** Not "we'll get you the warehouse," but credentials and a named table by Friday.
- **A ship path.** Who deploys, who monitors, who gets paged. A model without an owner is a notebook.

## The honest tradeoff

Consulting makes you faster at pattern-matching across companies and rustier at any single stack's depth. The antidote is writing: every engagement ends with the client owning a runbook they could operate without you. If they can't, you built dependence, not infrastructure.
