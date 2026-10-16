+++
title = "MdsAI — Human-Reviewed Support Intelligence"
description = "Four years of municipal helpdesk history turned into retrieved evidence, LLM answer drafts, and routing suggestions that a support expert approves before anything reaches a customer."
date = 2026-10-15
weight = 2

[taxonomies]
tags = ["Machine Learning", "NLP", "LLM", "RAG", "Topic Modeling", "Python"]

[extra]
short_title = "MdsAI"
monogram = "AI"
card_description = "Support history turned into retrieved evidence and human-reviewed answer drafts for 60+ municipalities."
kind = "project"
status = "Deployed · Active R&D"
role = "Technical lead, AI R&D"
showcase = true
stack = ["Python", "Polars", "EmbeddingGemma", "Sentence Transformers", "UMAP + HDBSCAN", "BERTopic", "LightGBM / XGBoost", "scikit-learn", "Gemini API"]
screenshot = "images/projects/mdsai-retrieval.png"
screenshot_alt = "Recall@1 and Recall@5 for four retrieval methods on 151 real support questions with 2,000 distractor tickets."
+++

MdsAI is the AI layer of Universal Software's municipal software support desk,
which serves more than 60 municipalities. A new ticket arrives; the platform
retrieves solved tickets that look like it, drafts an answer with an LLM from
their approved solutions, and suggests where the ticket should go. A support
expert reviews, edits, accepts, or rejects every draft before it reaches a
customer.

I lead the AI and data work: corpus preparation, retrieval and model research,
evaluation, and the integration with the ticket workflow, working with support
experts on what useful behavior looks like and with software engineers on where
it lives. Since the assistant went into the workflow, median first-response
time has fallen by half.

## The problem

The helpdesk had years of useful solutions, but they were buried in event logs.
Keyword search missed tickets that described the same fault in different words,
the same problems were solved again and again, and categorization, assignment,
and deadline-risk decisions depended on who happened to pick up the ticket.

The source contained **132,497 process-log rows** for **29,118 tickets** from
2022 to 2025. One ticket could appear dozens of times as comments, status
changes, and reassignments piled up, and the fields mixed missing values,
placeholders, SQL fragments, Turkish domain vocabulary, and product-specific
error codes.

{{ figure(src="assets/yearly_volume.svg", alt="New support tickets per year, with the highest recorded volume in 2025") }}

So the first job was not prompting an LLM. It was building a knowledge source
worth retrieving from.

## Building the corpus

A Polars and Parquet pipeline standardizes identifiers and timestamps, turns
placeholder values into nulls, keeps technical tokens intact, and folds event
histories into one record per ticket.

| Corpus measure                       |   Value |
| :----------------------------------- | ------: |
| Raw process-log rows                 | 132,497 |
| Normalized analysis rows             | 130,168 |
| Unique tickets                       |  29,118 |
| Closed, resolution known             |  28,369 |
| Closed with a written solution       |  27,188 |
| Training-grade after semantic review |  15,404 |

The cleaned history also showed why the desk needed help. Median resolution
took about seven days, 28.7% of resolved tickets took longer than four weeks,
and only 20.6% were resolved within a day. Of 20,282 tickets with both a
planned and an actual closing date, 98.5% closed after the planned date, so the
planning field was not a usable estimate.

{{ figure(src="assets/resolution_dist.svg", alt="Distribution of eligible closed tickets by resolution time") }}

### Semantic filtering, with people deciding

A syntactically valid ticket is not necessarily a good example. Test records,
thank-you replies, template answers, and solutions without technical content
would all pollute retrieval and supervised training.

I embedded ticket text with `google/embeddinggemma-300m`, reduced it with UMAP,
and grouped dense regions with HDBSCAN. The clustering did not decide what was
good. It changed the size of the review: support experts and I judged coherent
groups instead of reading 29,000 tickets one by one. The first curation pass
kept **79 clusters** holding **15,404 tickets**, 52.9% of the original set.

{{ figure(src="assets/data_funnel.svg", alt="Human-reviewed data funnel from raw tickets to the training-grade corpus") }}

Those 79 groups are for quality control. They are separate from the **281
BERTopic clusters** used later to analyze support themes and trends.

## Choosing the embedding model

Retrieval, duplicate detection, clustering, and classification all sit on the
embedding layer. I compared four model families with three downstream
classifiers on 4,500 labeled tickets, measuring quality alongside memory and
encoding time.

{{ figure(src="assets/embedding_benchmark.svg", alt="Embedding benchmark balancing downstream score, memory use, and encoding time") }}

| Model              |     Memory | Encode time | Mean downstream score |
| :----------------- | ---------: | ----------: | --------------------: |
| TRModel            |    ~384 MB |         8 s |                 0.892 |
| Qwen               |   2,274 MB |        45 s |                 0.892 |
| **EmbeddingGemma** | **578 MB** |    **16 s** |             **0.914** |
| E5-Large           |   2,136 MB |        24 s |                 0.937 |

E5-Large scored highest, but EmbeddingGemma became the workhorse: within 2.3
points while using about a quarter of the memory and encoding 33% faster.

The same work exposed a taxonomy problem. The source system had 194 category
labels, including near-duplicates and classes with fewer than ten examples;
predicting them gave about 0.14 macro-F1. Support experts consolidated them
into seven operational groups, on which the model reached 0.46 macro-F1 and
0.67 accuracy. Those are different prediction tasks, so the result argues for
redesigning the taxonomy rather than showing a threefold better model.

## Measuring retrieval on real questions

Retrieval quality decides whether a draft is grounded, so I built a benchmark
from the questions users actually wrote: **151 historical questions**, each
paired with the ticket that solved it, hidden among **2,000 distractor tickets**,
plus 500 questions with no correct answer to test abstention.

{{ figure(src="/images/projects/mdsai-retrieval.png", alt="Recall@1 and Recall@5 for character n-gram, word, hybrid and dense retrieval on 151 raw support questions, scoped to the user's product") }}

| Method (raw questions)    | Recall@1, all products | Recall@1, scoped | Recall@5, scoped |
| :------------------------ | ---------------------: | ---------------: | ---------------: |
| **Character n-gram**      |                  54.3% |        **79.5%** |        **97.4%** |
| Word                      |                  41.7% |            70.9% |            92.7% |
| Hybrid (RRF)              |                  36.4% |            74.2% |            95.4% |
| Dense (MiniLM)            |                  22.5% |            55.6% |            81.5% |

Two findings changed the design. First, scoping the search to the product the
user is on matters more than the retrieval method: it lifts character n-gram
Recall@1 from 54% to 80%. Second, on raw Turkish support text full of error
codes, module names, and misspellings, character n-grams beat a general dense
model by 24 points at Recall@1. When the same questions were rewritten into
clean form, every method scored above 85% scoped Recall@1, which says most of
the difficulty is in how people write tickets, not in the solved cases.

This is an offline benchmark on historical tickets. It measures whether the
right evidence reaches the drafting step, not how good the final answers are.

## The workflow

{{ diagram(name="mdsai", alt="MdsAI flow: a new ticket is normalized, relevant solved tickets are retrieved, Gemini drafts an answer and routing is suggested, and a support expert approves, edits, or rejects it, with rejections feeding evaluation.") }}

The assistant retrieves similar solved tickets and passes their approved
solutions to Gemini as context. The draft appears in the support workflow next
to the cases it was built from, and an expert stays responsible for the answer.
The LLM speeds the expert up; it does not answer customers on its own.

| State                  | Capability                                                                                                    |
| :--------------------- | :------------------------------------------------------------------------------------------------------------ |
| **Deployed**           | Retrieval of solved cases, evidence-backed answer drafts, routing suggestions, expert approval in the workflow |
| **Measured research**  | Corpus filtering, embedding benchmark, taxonomy redesign, retrieval benchmark, 281-cluster topic analysis       |
| **Active development** | Assignee and resolution-time models, SLA-risk signals, anomaly detection, trend reporting                      |

## What I took from it

- **An LLM system is only as good as its knowledge base.** Most of the work
  went into deciding which solved cases deserve to be retrieved.
- **Review belongs in the architecture.** Support experts govern both the
  corpus and every customer-facing answer, and their rejections feed the next
  evaluation.
- **Simple retrieval can win.** On this text, product scoping and character
  n-grams beat a general-purpose dense model; the benchmark, not intuition,
  decided that.
- **A label space can be the bottleneck.** Redesigning 194 categories into
  seven gave the team a prediction task it could act on.
