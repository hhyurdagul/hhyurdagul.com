+++
title = "Fishometry — Fish Length From a Photo"
description = "MSc thesis research on estimating fish length from a single photo, without a ruler, reference object, or camera calibration."
date = 2026-01-13
updated = 2026-10-14
weight = 3

[taxonomies]
tags = ["Computer Vision", "Deep Learning", "Monocular Measurement", "Image Segmentation", "PyTorch", "Python"]

[extra]
short_title = "Fishometry"
monogram = "Fi"
card_description = "Fish length from a single photo: 5.53 cm outdoor MAE, 36.9% below a species-aware baseline."
kind = "project"
status = "Thesis in progress"
role = "Researcher, MSc thesis"
repo_url = "https://github.com/hhyurdagul/fishometry"
showcase = true
stack = ["Python", "PyTorch", "YOLO11", "Segment Anything", "Depth Anything V2", "DINOv2", "XGBoost", "Polars", "Streamlit"]
screenshot = "images/projects/fishometry-cover-v2.png"
screenshot_alt = "Fishometry thesis pipeline: datasets, data split, preprocessing, model inputs, models, and held-out evaluation."
+++

Can a model estimate a fish's length from a single photo, with no ruler,
reference object, or camera calibration in the frame? Fishometry is my MSc
thesis research on that question. I built the image-processing pipeline, the
experiment matrix, and a Streamlit results explorer.

{{ figure(src="/images/projects/fishometry-cover-v2.png", alt="Fishometry experimental pipeline: three datasets, a protected split, landmark detection, relative depth, segmentation and scene annotation, seven model families, and test-set results", caption="The full experimental pipeline, from three datasets to held-out results. Open the image for the full-resolution version.") }}

## Why it is hard

One uncalibrated photo cannot uniquely recover physical scale: a small fish
close to the camera fills the same pixels as a large one farther away, and
depth models return relative, not metric, depth. The real question is how much
length information learned features recover within a known distribution of
photos, and whether that survives changes in scale and scene.

## How it works

- A YOLO11 model trained for this study detects the fish, head, tail, and eye;
  Depth Anything V2 samples relative depth at the head, body, and tail; Segment
  Anything isolates the fish outline.
- Outdoor photos add vision-language scene annotations and the species named
  in the angler's catch record.
- Seven model families, from a species-average baseline and linear regression
  to gradient-boosted trees, a ResNet-18, and EfficientNet-B3 or DINOv2
  embeddings with ridge regression, each run with and without depth.
- Splits are 70/15/15 and fixed before preprocessing. Zoomed versions stay in
  their source photo's split, models are selected on validation MAE, and the
  test set is used once.

## Results

| Dataset | Photos | Best test result |
| :--- | :--- | :--- |
| Controlled | 302, one species, fixed camera distance | **0.12 cm MAE** (0.76% MAPE), linear regression on coordinates |
| Zoom-derived | 906: each photo original, zoomed in, zoomed out | **0.71 cm MAE**, boosted trees with relative depth |
| Outdoor | 2,391 angling photos, 13 species, 7–127 cm | **5.53 cm MAE** (14.0% MAPE), DINOv2 + ridge |

Each dataset answers a different question. In controlled photos the fixed
geometry acts as a hidden ruler. Zooming breaks that ruler: the same linear
model rises to 2.01 cm, and relative depth cuts the boosted-tree error by 60%.
Outdoors, the whole photograph helps most: validation-selected DINOv2 features
reach **5.53 cm MAE** on 348 processed test images, **36.9% lower** than the
8.76 cm species-mean baseline. Both receive the species identity; nine test
images that failed preprocessing are excluded.

## Research explorer

{{ figure(src="/images/projects/fishometry-running.png", alt="Fishometry prediction page with model and split selectors, error metrics, and a predicted-versus-measured length scatter plot", caption="The explorer on the controlled test split: stored XGBoost predictions from coordinates and depth for 46 images.") }}

The explorer compares predictions with measured lengths by dataset, model,
split, species, and individual image, so every number in the thesis traces back
to the rows that produced it.

These are offline results for the species and capture conditions in the data,
not a general-purpose measuring tool.
