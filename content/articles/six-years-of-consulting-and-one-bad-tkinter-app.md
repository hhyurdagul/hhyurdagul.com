+++
title = "Six Years of Consulting and One Bad Tkinter App"
description = "Six years of consulting on forecasting and machine learning, alongside engineering jobs, team leadership, and an MSc thesis still in progress."
date = 2026-06-30
updated = 2026-10-15

[taxonomies]
tags = ["Career", "Machine Learning", "Consulting"]

[extra]
kind = "post"
intro = "How a forecasting tool grew into years of consulting, alongside engineering jobs, team leadership, and a master’s thesis still in progress."
+++

My career began with a surprising collaboration with my professor during the
last semester of the year before my final year of my bachelor's degree in
computer engineering at Çukurova University, around 2020. He had some experience
working with government incentives and grants, especially Tübitak and official
R&D Centers — Turkey's main public-funding routes for applied research. Machine
learning and AI in general were the hotspots in those years, and grants were
specifically targeting AI work.

He hadn't been exposed to AI yet and wanted a
workforce that knows what he is dealing with, could tackle and solve those
problems, build the tools, products, and systems, and secure the grant, and he
found the one-man army, which is me, of course.

We started in 2020
with a modest clothing company, Sefamerve, which wanted demand forecasting for
their products' future sales, which, of course, needs no explanation. Those early
engagements also included Comdata, one of the well-known call centers, which
wanted to forecast future call volumes to optimize call agents' schedules and
create a system they could use productively, and an international car parts
manufacturer, Teknorot, with the same problem: demand forecasting.

After a while, it became clear that the industry needs this; forecasting future
values for any given data will eventually occur, so instead of coding everything
manually, we could have created an app that would make it possible for us, and
even for others who are not proficient code writers, to get results using
machine learning and AI in general. So I did that.

There was already a similar
ongoing project called DTReg, which was basic, only limited to Windows, and, of
course, paid, and not free. Being a fresh young developer, I have made terrible
mistakes, design choices, and engineering that will shoot me in the foot several
times in the future. One bad decision was to use tkinter for the UI, since DTReg
was already using it, so I went with the same approach. Don't get me wrong, I am
not against Tkinter, but it didn't look good at all, and we weren't in 1980; it
was the 2020s. Looking at it now, I could have used QT instead of Tkinter, which
would have looked much better.

Not stopping there, I didn't separate ui and
logic from each other; it was one giant Python class where everything was tied
together, mutable state everywhere, functions not returning, and changing the
state itself, methods calling methods, no private functions, everything is one
giant code. All of these could have been avoided if we had also been taught
functional programming alongside object-oriented programming in our education,
but that is a topic for another time. It started as a one-page LSTM-based time
series tool and became a giant app that packed a bunch of algorithms together
with no modularity, separation of concerns, or anything along those lines taken
into consideration. As I said, I was fresh blood. But we used it well: for every
client, I had to delete some places on one page, some on others, and maybe add a
little something for each new customer. I always had the thought of
restructuring it, but I was telling myself, we won't get any more customers, of
course, I was wrong, people had too many problems to solve.

After a while, I started getting work that is not just predictive modeling.
Times are changing, people have learned what ML/DL can do, and they want that. I
had started working with Datakod, which has a large volume of customer data.
They wanted to understand customer behavior, so I studied and implemented
systems such as customer segmentation, campaign recommendation, churn
prediction, association rule mining, and even anomaly detection on customer
data.

## From One Model to Understanding Customers

The demand-forecasting approach I'd built for Sefamerve, matching new products
to older ones by image similarity and borrowing their sales history, never
worked as well as I wanted it to. By this point I'd learned to be more upfront
with clients about what a model could and couldn't promise, instead of just
shipping the cleverest idea I had.

Datakod ended up being one of the broadest engagements I've had, running from
January 2022 to December 2024, and it's the one that pushed me from "build me a
forecast" to "tell me who my customers are." Alongside segmentation and campaign
recommendation, I built association rule mining with FP-growth and Apriori for
their market-basket data, RFM scoring, and anomaly detection, packaged as BI and
intelligence reports rather than another Tkinter screen.

Albert Solino, a consultancy firm, kept me busy from May 2021 to January 2023.
The core deliverable was a churn and lifetime value system wired directly into
their CRM, but the part I remember best is mentoring two of their mid-level
engineers, who ended up rebuilding the MLStudio idea from scratch in Flask, a
framework I'd never touched myself. Watching someone take the concept and remake
it cleanly was a good sign that the idea itself, even if my implementation of it
was a mess, had been sound the whole time.

Two more from this stretch are worth a mention. At Unsped Customs Consultancy,
the churn and CLTV work also fed into an R&D proposal under Tübitak 1511.
And HepsiEmlak, the real estate marketplace, had me spend most of my hours
writing R&D Center registration and Tübitak proposal material rather than
shipping models, with recommendation and duplicate-photo-detection work
happening underneath.

## Teaching Others to Fish

Somewhere in this stretch the work started changing shape again. I wasn't just
being hired to build something anymore, I was being hired to teach other people
how to build it.

Protel, the hospitality and restaurant-tech company, had me lead and mentor five
people, from juniors to seniors plus one MSc student, on demand forecasting
using ARIMA, LightGBM, XGBoost, and Random Forest — the first time I was
responsible for other people's output instead of just my own. At Nano I taught
ML/DL fundamentals and guided the team toward building their own MLStudio
equivalent, except in C#, which proved the idea wasn't tied to my stack at all,
it was tied to the workflow. Gtech, CukurovaMakine, and JForce rounded out this
period: three more data scientists mentored into building their own desktop
MLStudio tool at Gtech, and straightforward ML/DL courses at the other
two, one eight modules long, the other reaching more than ten engineers.

## Taking a Real Job While Still Consulting

While all of this was going on, I also started taking on work that wasn't
consulting at all. OxyAI brought me on as a contractor from May 2021 to January
2023 to build recommender systems for their clients. For Collectors, an online
art gallery, I built a hybrid multi-modal recommender that combined a user's
text preferences with CNN-extracted visual features from the artwork itself. For
Dinlebi, an Audible-style audiobook app, I built collaborative filtering with
matrix factorization, plus an onboarding data-collection flow specifically
designed to take the edge off the cold-start problem. Both are apparently still
running in production.

In April 2021 I joined Universal Software full time, a company that builds
software for municipalities, ministries, and the utility companies that work
closely with them, like water administrations and energy providers. This is
where the work stopped being purely about a single client's forecast and started
touching physical infrastructure. The two projects that stuck with me most: a
route optimization system for municipal garbage trucks, built on IoT sensors
mounted on the bins themselves reporting fullness and flagging fire or flood
events, routed through heuristic algorithms instead of a fixed schedule; and a
real-time object detector for Enerjisa, the country's largest electricity
provider, that ran on the phones field workers used to photograph inventory, so
blurry, duplicate, or empty shots could be rejected before inventory review.
Around the same time I also built a predictive maintenance classifier for
a client's CNC assembly line, LSTM forecasting pipelines for electricity and gas
consumption under a project called GAM-GAD (short for Geographic Analysis
Modules and Geographic Analysis Tools), and an LSTM pipeline forecasting future
water demand for the Istanbul Water Administration.

## Leading a Team and Chasing Grants

Universal Yazılım also runs the support software a lot of municipalities use,
and two of the projects I'm most proud of came out of that side of the business.
The first is a ticketing classifier that uses TF-IDF and embeddings to route
incoming citizen complaints to the right department, used across client
municipalities. The second is a support-ticket system for the municipalities
themselves — when something breaks or needs adding in the software we've
deployed to them, or they have a reproducible support question or an event to
log, they open a ticket here. Many messages repeated questions already
answered, buried in typos and miscategorization. I shipped a first version
using embeddings and clustering to find underlying topics, LLM-assisted text
cleanup, and sentence similarity to retrieve previously solved cases and
support answer suggestions. It's still one of the most exhausting and most
satisfying projects I've worked on.

In January 2024 I was promoted to lead Universal's AI R&D team. Since then I've
been the technical lead on two Horizon Europe consortium proposals: FloodGuard,
a flood prediction project Universal manages end-to-end, and Pre-act, a fire
prediction project Universal only participates in. FloodGuard alone was a 3.5
million euro consortium. Neither was funded in the end, but putting them
together taught me more about scoping a multinational research project than a
funded one probably would have.

Around the same time, I picked up a project under Tübitak's 1832 program:
river-discharge forecasting. I started with the obvious
approaches first, supervised regression models, then autoregressive deep
learning models, and all of them performed badly. What ended up working was a
custom seq2seq LSTM with attention built in, which became the focus of the
modeling and serving work. I'm leading the project
together with our hydraulics engineer, which has been its own kind of education,
explaining to a domain expert why the model is doing what it's doing, and
learning enough hydrology from him to understand the modeling assumptions.

In the middle of all this I also went back to school. I started an MSc in
Computer Engineering at Çukurova University in August 2023, and my thesis is
still in progress. It studies fish-length estimation from uncalibrated images,
comparing geometric, relative-depth and learned image features. It's a narrower,
more academic kind
of problem than anything I'd been paid to solve, which was exactly the point
of doing it.

## Where the Consultancy Work Stands Today

The consultancy side never stopped while all of this was happening, it just kept
compounding. As of this October update, Moka is my only active consulting client.
Inveon, an e-commerce technology company, kept me busy from November 2022 to
September 2026: product search using titles and descriptions without exact
matches, image classification across more than fifty product subcategories,
and similarity and recommendation systems accepting images, descriptions, or
titles, delivered through Streamlit and FastAPI. Later work included
cancellation/return classification APIs and shipment-to-delivery prediction
and analysis, including carrier-specific forecasts and comparison with actuals.

Ikas wrapped up at the end of 2025. That engagement used the three-route
pattern I eventually settled on for app delivery — Tkinter for model-building,
Streamlit for people using a model without touching code, an API for integration —
all deployed and in use. One concrete example connected call-volume and
average-handling-time forecasts to Erlang staffing calculations in FastAPI.
That's a long way from the single overloaded Tkinter file I was patching by
hand for Comdata six years earlier.

Moka, a fintech and payments company, still has me on price prediction, churn,
lifetime value, and forecasting, deployed on Azure with Docker and Kubernetes.
The serving work includes batch inference with model-specific feature contracts
and missing-feature checks. Working inside a team with Git pull requests instead
of being the only name on the commit log still feels new after years of working
alone. My past Robokobi work, for a CRM platform for SMEs, also covered financial
forecasting, from Tkinter and Streamlit tools to ONNX Runtime CPU inference.

Smartiks, a software company, was a similarly long-running consultancy: three
years working with their R&D center, eventually leading a small team of three
there. Most of that time went into writing and leading the technical side of
ITEA consortium proposals, the same kind of grant-scoping work I was doing for
Universal, just for a different company's portfolio. Underneath that sat a
handful of smaller deliverables — a Basal Metabolic Rate model for a health
client, e-commerce customer segmentation, a bird-detection model for drone
safety. That engagement wrapped up in May 2026.

Underneath those is a long tail of shorter, narrower engagements. During the
Apr 2022–Jun 2025 Badem engagement, I built regression and churn/LTV models for a
company serving doctors and family physicians. Past that, there are more
SME, fintech, and energy clients with the same handful of recurring
problems: forecasting, churn, fraud, feasibility. The full roster, with dates
and tech stacks, is on the [/work](/work) page if you want the long version.

Looking back at all of it, the throughline isn't really the algorithms, it's
that I started out as one person patching a single overgrown Tkinter file by
hand for every new client, and somewhere along the way that turned into leading
teams, writing European grant consortium proposals, and mentoring other
engineers into building their own versions of the same idea in languages I don't
even write.

## October Update: The Rewrite

My conclusion about the original desktop app was that I'd rewrite it from
scratch. I later rebuilt [MLStudio](@/projects/mlstudio.md) in Streamlit/PyTorch,
with a separate modeling backend, time-aware validation, and versioned model
bundles. The desktop workbench was used across 30+ organizations and cut time
to a first validated model from 10 working days to 2; the web app is the newest
generation of that workflow.
