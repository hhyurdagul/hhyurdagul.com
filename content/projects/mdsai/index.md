+++
title = "MdsAI — Human-Reviewed Support Intelligence"
description = "Four years of municipal helpdesk history turned into retrieved evidence, cited LLM answer drafts, and routing suggestions that a support expert approves before anything reaches a customer."
date = 2026-10-15
weight = 3

[extra]
short_title = "MdsAI"
monogram = "AI"
card_description = "Support history turned into human-reviewed answer drafts for a desk serving 60+ municipalities: median first reply from 15.5 h to 2.4 h."
kind = "project"
status = "Deployed · Active R&D"
role = "Lead Engineer, AI R&D"
showcase = true
stack = ["Python", "Polars", "EmbeddingGemma", "EmbeddingGemma 2", "Sentence Transformers", "UMAP + HDBSCAN", "BERTopic", "LightGBM / XGBoost", "scikit-learn", "Hybrid retrieval", "Gemma 4 12B (QLoRA)", "vLLM (FP8)"]
screenshot = "images/projects/mdsai-demo.png"
screenshot_alt = "The MdsAI walkthrough: a support ticket's cited answer draft from a fine-tuned Gemma 4 12B, with the solved cases it was built from."
card_image = "images/projects/mdsai-card.png"
card_image_alt = "Past support tickets as coloured clusters by category, with a new ticket landing in the Integration cluster."
+++

MdsAI is the AI layer of Universal Software's support desk for FlexCity, a
city-management platform used by 60+ municipalities. It routes each new
ticket, drafts a cited answer when a similar case was solved before, and
briefs an expert when none was; an expert approves every reply.

I led a team of three ML engineers and worked with the platform's backend
team. I built the corpus pipeline, the retrieval benchmark and the fine-tuning
setup myself, and set the evaluation the team shipped against.

| Result (Jan–Jun 2026 vs Jan 2022 – Jul 2025) |                |
| :------------------------------------------- | -------------: |
| Median first written reply                   | 15.5 h → 2.4 h |
| Tickets re-routed after assignment           |       24% → 9% |
| New tickets with a cited draft               |            68% |
| Drafts sent with light or no edits           |            61% |

A before/after comparison, not a controlled experiment; see [after
rollout](#after-rollout).

{{ pipeline(src="pipeline.toml") }}

{{ demo(name="mdsai") }}

## Six decisions

| Decision                     | Instead of                      | Evidence                         |
| :--------------------------- | :------------------------------ | :------------------------------- |
| Experts review 79 clusters   | Reading 29K tickets one by one  | 15,404 clean cases               |
| Redesign the labels, 96 → 7  | Modelling 96 labels harder      | 0.14 → 0.89 macro-F1             |
| Hybrid retrieval             | A general dense model (MiniLM)  | 86.4% vs 52.4% Recall@1          |
| Hold back below a 0.60 bar   | Always drafting                 | 91% held back, 94% still drafted |
| Fine-tune a 12B model        | Gemma 4 31B or Qwen3 32B as-is  | 76% preferred, 12 GB             |
| Downweight old releases      | Trusting every solved case      | Light edits 44% → 61%            |

The details behind each follow.

## The data

Four years of process logs (2022–2025) folded into one record per ticket with
a Polars pipeline that keeps error codes and module names intact.

| Corpus measure (2022–2025)         |   Value |
| :--------------------------------- | ------: |
| Raw process-log rows               | 132,497 |
| Unique tickets                     |  29,118 |
| Closed with a written solution     |  27,188 |
| Training-grade after expert review |  15,404 |

Of the 28,369 tickets closed with a known resolution time, the median took
about seven days.

{{ figure(src="assets/resolution_dist.svg", alt="Distribution of eligible closed tickets by resolution time") }}

Test records, thank-you replies and template answers would pollute retrieval,
so I clustered ticket text (EmbeddingGemma, UMAP, HDBSCAN) and support experts
and I judged 79 groups instead of 29,000 tickets. A separate BERTopic analysis
found 15 of 281 topics behind 21% of tickets, which set the rollout order.

## Routing

The embedding model was chosen on 4,500 labelled tickets, averaged over three
classifiers:

| Model              |     Memory | Encode time | Mean downstream score |
| :----------------- | ---------: | ----------: | --------------------: |
| TRModel            |    ~384 MB |         8 s |                 0.892 |
| Qwen               |   2,274 MB |        45 s |                 0.892 |
| **EmbeddingGemma** | **578 MB** |    **16 s** |             **0.914** |
| E5-Large           |   2,136 MB |        24 s |                 0.937 |

EmbeddingGemma was within 2.3 points of E5-Large at a quarter of the memory.
The bigger gain came from the labels: 96 categories, many near-duplicates,
gave 0.14 macro-F1; the seven groups experts redesigned give 0.89 macro-F1 and
93% accuracy. Different tasks, so this argues for the taxonomy, not a better
model. A calibrated decision model, Laya, is being tested against the
classifier.

## Retrieval

The benchmark uses 1,236 questions as users wrote them, each hidden with its
solving ticket among 2,000 distractors, scoped to the user's product. The
question's own ticket and near-duplicates of its answer were kept out.

| Method (raw questions)                 | Recall@1 (scoped) | Recall@5 (scoped) |
| :------------------------------------- | ----------------: | ----------------: |
| **Hybrid (n-gram + EmbeddingGemma 2)** |         **86.4%** |         **98.9%** |
| Dense (EmbeddingGemma 2)               |             84.2% |             97.6% |
| Character n-gram                       |             73.5% |             92.6% |
| Dense (MiniLM)                         |             52.4% |             79.8% |

Raw Turkish tickets are full of error codes, suffixes and misspellings.
N-grams catch those, EmbeddingGemma 2 (newer than the routing model) catches
paraphrases, and together they beat either alone.

### Holding back

400 more questions had their solving ticket and its near-duplicates removed,
so the closest cases looked related but were wrong. The bar was set where a
wrong draft happens on fewer than 1 in 10 of them:

| Similarity bar | Answerable questions drafted | Unanswerable questions held back |
| :------------- | ---------------------------: | -------------------------------: |
| 0.50           |                          98% |                              72% |
| **0.60**       |                      **94%** |                          **91%** |
| 0.70           |                          85% |                              97% |

In production 68% of tickets clear it; many live tickets are new problems.
The rest get a briefing from docs, code and past tickets instead of a guess.

## Drafting

Names, Turkish ID numbers, phone numbers and IBANs were masked (rules plus a
NER model, 1,000 records checked by hand) before fine-tuning Gemma 4 12B with
QLoRA on 12,000 ticket–solution pairs. Nothing leaves Universal's servers; the
setup passed KVKK review. Experts compared drafts blind on 1,200 held-out
tickets, same retrieved cases, all models in FP8:

|                              | Gemma 4 12B, fine-tuned | Gemma 4 31B, as-is | Qwen3 32B, as-is |
| :--------------------------- | ----------------------: | -----------------: | ---------------: |
| Preferred by experts         |                 **76%** |                14% |              10% |
| Fully supported by citations |                 **96%** |                81% |              72% |
| Latency (median)             |                 **5 s** |               27 s |             30 s |
| GPU memory (FP8)             |               **12 GB** |              31 GB |            32 GB |

It runs with vLLM on one L40S, up to 40 drafts in parallel.

## Keeping it current

Every expert decision is logged with the draft and its sources. The index grew
from 15,404 cases to 18,900 by October 2026. Cases carry their product
version, and those more than two releases old are downweighted; a rejection
for an outdated source retires the case (140 in the first half of 2026).

That rule came from a failure: early drafts cited menu paths a release had
moved. Experts caught every one, but trust dropped for two weeks until version
tagging brought the light-edit rate from 44% back to 61%.

## After rollout

- **Rollout:** 14 municipalities in August 2025, then about ten at a time
  until all were live in March 2026.
- **First reply:** median 15.5 h (23,132 tickets, January 2022 – July 2025) →
  2.4 h (9,800 tickets, January–June 2026), while monthly volume nearly
  tripled. On the 48 municipalities in both periods: 15.1 h → 2.6 h.
- **Drafts:** 61% sent with light or no edits (under 15% of characters
  changed), an estimated 6 minutes saved per drafted ticket.
- **Caveat:** before/after, not controlled; some municipalities were not yet
  live in January–March 2026.

| State                 | Capability                                                                                                       |
| :-------------------- | :--------------------------------------------------------------------------------------------------------------- |
| **Deployed**          | Routing suggestions, hybrid retrieval, cited drafts from the fine-tuned 12B, expert briefings, expert approval    |
| **Measured research** | Corpus filtering, embedding benchmark, taxonomy redesign, retrieval and abstention benchmark                     |
| **In development**    | Calibrated decision models (Laya, in testing); auto-approval for tickets matching an approved case, so they get an answer within minutes; resolution-time and SLA-risk signals |

## What I took from it

- **The knowledge base is the product.** Most of the work was deciding which
  solved cases deserve retrieval, and keeping them current.
- **Benchmark before you choose.** A general dense model finished 34 points
  behind the hybrid on real tickets.
- **A smaller model you fine-tune beats bigger ones used as-is.**
