+++
title = "CV"
description = "My experience as a machine learning engineer and technical lead, along with my skills and education."
aliases = ["/work/", "/about/"]

[extra]
kind = "cv"
subtitle = "Machine learning engineer and technical lead"
location = "Adana, Türkiye"
updated = "October 2026"
+++

## Profile

I'm a machine learning engineer and technical lead. I build systems that use language models, computer vision, recommendations and forecasting. My work includes preparing data, comparing models and getting them into use, with attention to how people will review and rely on the results.

## Experience

### Universal Software (Universal Yazılım)

<p class="cv-meta">Istanbul-based · Remote · Software for local government</p>

#### Technical Lead, AI R&D (hands-on) <span class="when">Jan 2024 – Present</span>

- I lead a team of five AI engineers, plan our R&D work and mentor engineers. I also write technical work packages for national and European R&D proposals.
- I built a support-ticket workflow that retrieves similar solved cases and drafts replies for experts to review. Tickets that need a different team are categorized and routed.
- I evaluate retrieval methods against real support questions. In one comparison, character n-gram search outperformed dense embeddings, so we used the simpler method.
- I fine-tune open language models with LoRA and QLoRA on Turkish support data and serve them on company GPUs with vLLM.
- I use Polars and embedding-based clustering to help support experts turn past tickets into a usable knowledge base. I also work with them to simplify routing categories and evaluate classification models.

#### AI/ML Engineer → Senior AI/ML Engineer (Jan 2023) <span class="when">Apr 2021 – Dec 2023</span>

- I built computer-vision pipelines for Enerjisa to screen field photos, flag unusable images and reduce manual annotation work.
- I developed text classifiers to route citizen complaints to the right municipal teams.
- I built predictive-maintenance models from energy-system telemetry and evaluated them on held-out data.
- I developed forecasting pipelines for municipal water demand and industrial gas and electricity consumption.

### OxyAI

<p class="cv-meta">Remote, Türkiye</p>

#### AI/ML Engineer (Part-time Contract) <span class="when">May 2021 – Jan 2023</span>

I built recommendation systems for an online art gallery and an audiobook app. The work combined text and image features, matrix factorization and onboarding for new users. Both systems remained in production for more than three years.

## Consulting

### Freelance ML Consultant (Part-time)

<p class="cv-meta">2020 – Present · Alongside employment · Remote, Türkiye</p>

I start with the decision a model needs to support: what the target means, what data will be available when a prediction is made, and whether that data is useful. I then compare approaches and deliver the results as reports, apps or APIs.

- **Inveon (2022–2026):** I built semantic product search, automated product categorization, and APIs for predicting order cancellations and returns.
- **Moka (since 2023):** I build and deploy services for merchant-churn scoring, price quoting and revenue forecasting, using FastAPI, Docker and Azure.

{{ engagements() }}

## Skills

- **Language models and agents:** retrieval-augmented generation, lexical and dense retrieval, embeddings, retrieval evaluation, LoRA/QLoRA fine-tuning, vLLM, tool-calling agents, Model Context Protocol and human review workflows
- **Machine learning:** PyTorch, scikit-learn, XGBoost/LightGBM, sentence-transformers, UMAP/HDBSCAN, computer vision (YOLO, SAM, DINOv2, OpenCV), recommendation systems and time-series forecasting
- **Engineering:** Python, Rust, SQL, Polars, FastAPI, Docker, Azure, on-premises GPU serving, MLflow, Weights & Biases, Git, CI and Nix
- **Languages:** Turkish (native), English (C1; IELTS 7.5)

## Education

### Çukurova University

<p class="cv-meta">Adana, Türkiye</p>

#### MSc in Computer Engineering <span class="when">Aug 2023 – Nov 2026 (expected)</span>

My thesis focuses on estimating object size from images without depth information or reference points.

#### BSc in Computer Engineering (English-medium) <span class="when">Sep 2016 – Aug 2021</span>
