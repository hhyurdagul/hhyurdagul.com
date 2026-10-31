+++
title = "Fishometry — Fish Length From a Photo"
description = "MSc thesis research on estimating fish length from a single photo and the recorded species, without depth sensors or camera calibration: 5.53 cm MAE on 348 held-out angler photos, 36.9% below a species-mean baseline."
date = 2026-01-13
updated = 2026-10-31
weight = 1

[extra]
short_title = "Fishometry"
monogram = "Fi"
card_description = "Fish length from one photo plus the recorded species, no depth sensor or calibration: 5.53 cm MAE on held-out angler photos, 36.9% below the species mean."
kind = "project"
status = "Thesis in progress"
role = "Researcher (MSc thesis)"
showcase = true
repo_url = "https://github.com/hhyurdagul/fishometry"
stack = ["Python", "PyTorch", "YOLO11", "Segment Anything", "Depth Anything V2", "DINOv2", "XGBoost", "scikit-learn", "Polars", "Streamlit"]
screenshot = "images/projects/fishometry-demo.png"
screenshot_alt = "The Fishometry walkthrough's hidden-ruler step: zoomed 1.45×, a 28.4 cm fish spans 329 px and a pixels-to-centimeters rule fitted at the fixed camera distance reads 41.1 cm (illustrative values)."
+++

Can a model estimate a fish's length from a single photo, without depth sensors
or camera calibration? Fishometry is my MSc thesis research on that question.

On 348 held-out angler photos, the best pipeline is off by **5.53 cm** on average,
against **8.76 cm** for guessing the species' mean length (36.9% lower).
With a fixed camera distance, the error is 0.12 cm.

The data came already collected and annotated: my supervisor organized the
controlled capture, and anglers photographed and measured their own catches. I
did all the modeling: the YOLO11 detectors, the depth and segmentation
pipeline, every model family, the experiments, and the results explorer.
Controlled photos use a marked board and some outdoor photos contain measuring
devices, but no camera intrinsics or depth sensors are provided.

{{ demo(name="fishometry") }}

## Why it is hard

One uncalibrated photo cannot uniquely recover physical scale: a small fish
close to the camera fills the same pixels as a large one farther away, and
depth models return relative, not metric, depth. The real question is how much
length information learned features recover within a known distribution of
photos, and whether that survives changes in scale and scene.

## How it works

{{ figure(src="/images/projects/fishometry-cover-v2.png", alt="Fishometry experimental pipeline: three datasets, a protected split, landmark detection, relative depth, segmentation and scene annotation, seven model families, and test-set results", caption="The full experimental pipeline, from three datasets to held-out results. Open the image for the full-resolution version.") }}

- YOLO11 models trained for this study detect the fish, head, and tail, plus the
  eye in controlled photos (the outdoor detector has no eye class);
  Depth Anything V2 samples relative depth at the head, body, and tail; Segment
  Anything isolates the fish outline.
- Outdoor photos add vision-language scene annotations, including a yes/no
  "measuring device visible" flag, and the species named in the angler's catch
  record. The pipeline never reads device markings.
- Seven model families: a mean baseline (the species mean outdoors), linear
  regression, XGBoost, a small tabular neural network, a ResNet-18 on the isolated
  fish plus measurements, and EfficientNet-B3 or multi-view DINOv2 embeddings
  with ridge regression. Every family except the baseline runs with and without
  depth; the two embedding families run on outdoor photos only (17 controlled,
  17 zoom-derived, and 41 outdoor configurations).
- Splits are 70/15/15 and fixed before preprocessing. Zoomed versions stay in
  their source photo's split. Hyperparameters, pipeline design, and the
  reported configuration were all chosen on validation MAE, and the test set was
  used once. The selected configuration's validation MAE is therefore optimistic
  (4.98 cm outdoors, against 5.53 cm on test); the test MAE carries no selection bias.

## Results

| Dataset | Photos | Test photos scored | Best test result |
| :--- | :--- | ---: | :--- |
| Controlled | 302, one species, fixed camera distance | 46 | **0.12 cm MAE** (0.76% MAPE; 95% CI 0.09–0.16), linear regression on coordinates |
| Zoom-derived | 906 = 302 photos × 3 (original, zoomed in, zoomed out) | 135 | **0.71 cm MAE** (95% CI 0.55–0.87), boosted trees with relative depth |
| Outdoor | 2,391 angling photos, 13 species, 7–127 cm | 348 | **5.53 cm MAE** (14.0% MAPE), DINOv2 + ridge |

Each dataset answers a different question. In controlled photos the fixed
geometry acts as a hidden ruler. Zooming breaks that ruler: the same configuration,
trained separately on zoom-derived photos, reaches 2.01 cm, while relative depth
cuts the boosted-tree error by 60% (from 1.79 to 0.71 cm; paired 95% CI for the
reduction: 0.82–1.36 cm).

Outdoors, the whole photograph helps most: validation-selected DINOv2 features
reach **5.53 cm MAE** (95% CI 5.06–6.05 cm) on 348 processed test images, **36.9% lower**
(a 3.23 cm improvement, paired 95% CI 2.62–3.86) than the 8.76 cm species-mean baseline.
Both receive the species identity from the catch record; nine test images that failed
landmark detection are excluded.

| Outdoor test photos (device flag from the vision-language annotation) | Photos (n) | DINOv2 pipeline MAE | MAPE | Species-mean baseline | Reduction |
| :--- | ---: | ---: | ---: | ---: | ---: |
| No device visible | 228 | **6.12 cm** | 14.1% | 9.59 cm | 36.2% |
| Measuring device visible | 120 | **4.40 cm** | 13.8% | 7.18 cm | 38.8% |
| **All scored outdoor photos** | **348** | **5.53 cm** | 14.0% | 8.76 cm | 36.9% |

Photos with a device have lower error mainly because they show smaller fish:
the baseline is lower too, and MAPE and the reduction are almost the same in
both groups. The pipeline never reads device markings (it only gets a yes/no
"device visible" flag); this is an observational comparison, not a masking experiment.

The pipeline beats the species average for all 13 species, though for Garfish
only marginally (8.61 vs 8.64 cm on 9 photos; five of the nine excluded test
photos are also Garfish); the largest gains are for species
with a wide length range, such as Pike (14.48 to 8.10 cm). Predictions shrink
toward the species mean: fish more than 10 cm below their species' mean are
overestimated by 8.1 cm on average, and fish more than 10 cm above it are
underestimated by 7.0 cm. The smallest fish (under 27.7 cm, n = 53) have 32%
MAPE; the largest (94–111 cm, n = 15) have 9.1 cm MAE. Relative depth cut errors on zoom-derived
photos, but outdoors it added nothing measurable (+0.004 cm MAE, confidence
interval crossing zero), suggesting that monocular depth tracks capture
conditions rather than recovering metric distance.

## Research explorer

{{ figure(src="/images/projects/fishometry-running.png", alt="Fishometry prediction page with model and split selectors, error metrics, and a predicted-versus-measured length scatter plot", caption="The explorer on the controlled test split: stored XGBoost predictions from coordinates and depth for 46 images.") }}

The explorer compares predictions with measured lengths by dataset, model,
split, species, and individual image, so every number in the thesis traces back
to the rows that produced it.
The code is public; the photos, labels, and checkpoints are not distributed,
so the explorer runs locally.

These are offline results for the species and capture conditions in the data,
not a general-purpose measuring tool. Labels are tape measurements by whoever
photographed the fish (the anglers, outdoors): whole centimeters outdoors,
millimeters in the controlled set. MAE measures agreement with those labels, not with
a calibrated physical measurement. Photos are split within species; with no catch
or angler IDs, photos of the same catch may cross splits. Results apply to new
photos from this collection, not to new anglers or new species.

## What I took from it

- **One photo does not remove scale ambiguity.** Length is almost exact when
  capture geometry is fixed (0.12 cm), degrades when apparent size varies
  (2.01 cm for the same linear configuration, retrained), and is about a third
  better than the species average in ordinary angler photos.
- **Find out where the accuracy comes from.** Fixed geometry explains the
  near-exact controlled result, and the species alone already gets outdoor error
  to 8.76 cm; the image takes it to 5.53 cm. The reduction is similar with a
  visible device (38.8%) and without (36.2%); this does not establish that the
  model reads rulers.
- **Know what the error is good for.** About 5.5 cm is too large to judge a
  single fish against a minimum size limit; whether it is good enough for the
  length composition of a whole catch needs its own test.
