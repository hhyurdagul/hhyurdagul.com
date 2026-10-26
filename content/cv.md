+++
title = "CV"
description = "Senior ML Engineer: applied ML and LLM systems. Experience, consulting, selected projects, skills, education and publications."
aliases = ["/work/", "/about/"]

[extra]
kind = "cv"
subtitle = "Senior ML Engineer · Applied ML & LLM Systems"
location = "Adana, Türkiye · Open to EU relocation · Visa sponsorship needed"
updated = "October 2026"
pdf = "cv/hasan-huseyin-yurdagul-cv.pdf"
+++

## Profile

Senior Machine Learning Engineer and hands-on Technical Lead with 5+ years building and deploying LLM, NLP, computer vision and recommender systems. Lead a 5-engineer AI team and build retrieval-augmented LLM systems with benchmarked retrieval, fine-tuned open models served on-premises and human review. Architected [MdsAI](@/projects/mdsai/index.md) for a municipal support desk; after rollout, median time to first written reply fell from 15.9 h to 2.4 h. Author of [Muninn](@/projects/muninn.md), an open-source Rust agent harness and MCP server.

## Experience

### Universal Software (Universal Yazılım)

<p class="cv-meta">Istanbul-based · Remote. Public-sector software vendor; its FlexCity city-management platform runs in 60+ Turkish municipalities.</p>

#### Technical Lead, AI R&D (hands-on) <span class="when">Jan 2024 – Present</span>

- Lead a 5-engineer AI team, setting the R&D roadmap and mentoring 2 engineers to senior promotion. Wrote the technical work packages for 6 national and Horizon Europe proposals, winning 3 (€1.2M to Universal) and co-leading [Teus](@/projects/teus/index.md) (river-discharge forecasting).
- Architected [MdsAI](@/projects/mdsai/index.md) for the FlexCity support desk: 68% of new tickets get a cited draft from similar solved cases; the rest are re-categorized and routed. Experts approve every reply. After rollout, median time to first written reply fell from 15.9 h to 2.4 h (2022–2025 baseline vs. 9,800 tickets in Jan–Jun 2026).
- Built an offline retrieval benchmark: 151 real user questions, each paired with the solved ticket answering it, among 2,000 distractors. With both scoped to the ticket's product, character n-gram search reached 79.5% Recall@1 vs. 55.6% for dense MiniLM embeddings, so the simpler method shipped.
- Fine-tuned 7–12B open models (Gemma, Qwen 3) with LoRA and QLoRA on Turkish support tickets. The models now run on company GPUs with vLLM; 61% of generated drafts go out with light or no edits.
- Built a Polars pipeline with embedding clustering (EmbeddingGemma, UMAP, HDBSCAN) so experts could review 79 ticket clusters instead of 29K individual tickets, producing a knowledge base of 15.4K training-grade cases.
- For ticket routing, benchmarked 4 embedding models on 4,500 labeled tickets and chose EmbeddingGemma (0.914 vs. 0.937 for E5-Large, averaged over 3 classifiers, at a quarter of its memory). With support experts, consolidated 194 category labels into 7 queues; after rollout, tickets reassigned after initial routing fell from 24% to 9%.

#### AI/ML Engineer → Senior AI/ML Engineer (Jan 2023) <span class="when">Apr 2021 – Dec 2023</span>

- Automated field-photo screening for Enerjisa (Türkiye's largest electricity distributor): YOLOv8, small classifiers and OpenCV checks screened 1.2M photos at 1,000+ images/min on one RTX A5000. Flagging 27% as unusable and pre-labeling the rest removed manual triage and cut annotation work by ~60%.
- Shipped TF-IDF and embedding-based routing of citizen complaints for client municipalities: 3,000 complaints a month at 85% routing accuracy, with same-day triage instead of 2 days.
- Developed predictive-maintenance classifiers on Enerjisa telemetry that flagged 78% of failures at least 5 days ahead at 2 false alarms per asset per month on a held-out year.
- Built LSTM forecasting pipelines for municipal water demand (İSKİ, Istanbul: 4.1% MAPE at a 7-day horizon vs. 6.3% for the utility's previous method) and industrial gas and electricity consumption.

### OxyAI

<p class="cv-meta">Remote, Türkiye</p>

#### AI/ML Engineer (Part-time Contract) <span class="when">May 2021 – Jan 2023</span>

- Designed and shipped recommenders for the online art gallery Collectors (text profiles plus CNN visual features; click-through rate rose 14% over the previous popularity list) and the audiobook app Dinlebi (120K users; matrix factorization with cold-start onboarding); both stayed in production for 3+ years.

## Consulting

### Freelance ML Consultant (Part-time)

<p class="cv-meta">2020 – Present · Alongside employment · Remote, Türkiye</p>

My work starts with the decision a model should support, then a data audit: what the target means, what information is available at prediction time, and whether the data supports the promise. From there I compare models, communicate the results, and package the useful parts as reports, apps, or APIs.

- Inveon (e-commerce platform, 2022–2026): built semantic product search (zero-result searches fell 35% across 12 stores after rollout), a production classifier auto-categorizing 20K products a month into 50+ subcategories, and order cancellation and return prediction APIs (IEEE ISAS 2025 paper).
- Moka (payment institution, İş Bankası group, since 2023): built and deployed FastAPI services on Azure with Docker (40K calls a month) for merchant-churn scoring, price quoting and revenue forecasting. Churn scores feed monthly retention campaigns; quotes take minutes instead of 2 days by hand.

{{ engagements() }}

## Selected projects

### [Muninn](@/projects/muninn.md): agent harness for a Markdown knowledge vault

Open-source Rust agent that reads, searches and edits a Markdown knowledge vault through a streaming tool-call loop, exposed as a CLI, a TUI and an MCP server. Used daily as shared memory for Claude Code and Codex, delivered in the MCP server instructions with no tool call. Pre-release, in active development.

- The agent loop is tested offline against a scripted mock model server; providers include the native Anthropic API with prompt caching and any OpenAI-compatible endpoint (vLLM, Ollama).
- Constrained by design: no shell and vault-only file access. Edits to the shared memory and rules files always go through review, stale proposals are rejected, and every change is journaled with conflict-aware undo.

<p class="cv-meta">Rust · Tokio · Ratatui · MCP (JSON-RPC) · 7-crate workspace · Nix · Apache-2.0</p>

### [Fishometry](@/projects/fishometry.md): single-image fish-length estimation (MSc thesis)

Estimates fish length from one photo with the species supplied, without depth sensors or reference objects: YOLO11 landmarks, Depth Anything V2 and SAM segmentation, then DINOv2 features with ridge regression. Reached 5.53 cm MAE vs. 8.76 cm for a species-mean baseline (37% lower) on 348 held-out outdoor photos.

<p class="cv-meta">Python · PyTorch · DINOv2 · YOLO11 · SAM · Depth Anything V2 · scikit-learn · Polars</p>

## Skills

- **LLMs & Agents:** retrieval-augmented generation (RAG), lexical/dense/hybrid retrieval, embeddings, retrieval evaluation, LoRA/QLoRA fine-tuning (Gemma, Qwen), vLLM serving, tool-calling agents, Model Context Protocol (MCP), prompt caching, human-in-the-loop review
- **ML:** PyTorch, scikit-learn, XGBoost/LightGBM, sentence-transformers, UMAP/HDBSCAN; computer vision (YOLO, SAM, DINOv2, OpenCV), recommenders, time-series forecasting (LSTM, seq2seq)
- **Engineering:** Python, Rust, SQL, Polars, FastAPI, Docker, Azure, on-premises GPU serving, MLflow, Weights & Biases, Git, CI, Nix
- **Languages:** Turkish (native), English (C1; IELTS 7.5)

## Education

### Çukurova University

<p class="cv-meta">Adana, Türkiye</p>

#### MSc in Computer Engineering <span class="when">Aug 2023 – Nov 2026 (expected)</span>

Thesis: *AI-Driven Object Size Prediction in Visual Data Without Depth Information and Reference Points*, the research behind [Fishometry](@/projects/fishometry.md).

#### BSc in Computer Engineering (English-medium) <span class="when">Sep 2016 – Aug 2021</span>

## Publications

7 peer-reviewed papers (IEEE SIU, ISAS and ISMSIT; IJMCE journal), 3 as first author. Selected:

- [Fault Prediction in Energy Systems: Telemetric Data and Machine Learning Approaches](https://doi.org/10.1109/ISAS66241.2025.11101925). IEEE ISAS, 2025; first author.
- [Development of Machine Learning-based Revenue Forecasting Models for Electronic Payment and Money Institutions](https://doi.org/10.1109/ISMSIT67332.2025.11267917). IEEE ISMSIT, 2025; co-author.
- [Forecasting Call Center Arrivals Using Machine Learning](https://doi.org/10.47495/okufbed.824870). Osmaniye Korkut Ata University Journal, 2021; co-author.
