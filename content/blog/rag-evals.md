+++
title = "Evaluating RAG pipelines beyond vibes"
description = "A practical eval harness for retrieval-augmented generation: golden datasets, faithfulness checks, and regression gates in CI."
date = 2026-08-20
updated = 2026-08-24

[taxonomies]
tags = ["LLM", "RAG", "Evaluation"]

[extra]
kind = "post"
+++

## Introduction

Every RAG demo looks magical until it meets real user queries. The difference between a demo and a system is measurement: a repeatable evaluation harness that tells you whether yesterday's change made retrieval better or worse.

## A golden dataset you can defend

Start small and human. Collect 50 to 100 real questions from support tickets, sales calls, or your own dogfooding. For each one, record the expected answer and, more importantly, which source documents *must* be cited. A golden set of 80 pairs beats a synthetic set of 10,000 every time, because it reflects the actual query distribution.

## Three checks that catch most regressions

Run every candidate change — new chunking, new embedding model, new reranker — through the same three gates:

1. **Recall@k**: is a required source document in the top-k retrieved chunks?
2. **Faithfulness**: does the generated answer stay grounded in the retrieved context? An entailment check with a second model is a pragmatic proxy.{% sidenote(id="entailment") %}I use an NLI model fine-tuned on MNLI and treat contradiction probability above 0.7 as a failure.{% end %}
3. **Refusal quality**: for questions outside the corpus, does the system say it doesn't know instead of hallucinating?

```python
results = harness.run(candidate, golden_set)
assert results.recall_at_5 >= baseline.recall_at_5 - 0.02
assert results.faithfulness >= 0.90
assert results.false_answer_rate <= 0.05
```

## Gate it in CI

The harness only matters if it blocks merges. Keep the eval fast — a sampled subset on every pull request, the full set nightly — and version the golden dataset alongside the code. When a regression slips through, add the failing query to the set. The dataset is the specification.
