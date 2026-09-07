+++
title = "Small models, boring infra: serving LLMs on a budget"
description = "Why most internal LLM workloads fit on a single GPU with quantization, caching, and batching — and when they don't."
date = 2026-07-14

[taxonomies]
tags = ["LLM", "MLOps", "Inference"]

[extra]
kind = "post"
+++

## The default is cheaper than you think

Most internal LLM workloads — classification, extraction, summarization over company data — never needed a frontier API. A 7–14B instruction-tuned model, quantized to 8 or even 4 bits, served with continuous batching, handles hundreds of requests per minute on a single GPU.

The boring stack wins: one inference server, prompt caching for repeated prefixes, and a queue with backpressure instead of autoscaling heroics.

## When it stops working

Scale breaks in predictable places. Long contexts blow up KV-cache memory long before throughput becomes the problem. Bursty traffic with strict latency SLOs needs either overprovisioning or graceful degradation — shorter max tokens, smaller draft models, cached fallbacks.

> If your p99 latency graph looks like a heartbeat, you don't have a model problem. You have a batching problem.

## Cost math worth doing

Track cost per thousand completed tasks, not per token. A smaller model with a well-built eval loop and a retry policy routinely beats a larger model on task success per dollar. Measure the task, then right-size the model.
