+++
title = "Kozmetik Stüdyo — A Local Editorial Workspace"
description = "A local-first Rust desktop app that keeps product research, articles, and images connected without mixing them."
date = 2026-10-14
weight = 6

[taxonomies]
tags = ["Rust", "Desktop Applications", "SQLite", "Software Engineering"]

[extra]
short_title = "Kozmetik Stüdyo"
monogram = "KS"
card_description = "A desktop workspace for product research, articles, and images."
kind = "project"
status = "Local application"
role = "Designer and developer"
showcase = false
stack = ["Rust", "GPUI", "gpuikit", "SQLite", "WebP", "Nix"]
screenshot = "images/projects/kozmetik-studio-running.png"
screenshot_alt = "Kozmetik Stüdyo desktop editor with a demo draft and a linked sample product."
+++

Kozmetik Stüdyo is a desktop studio for the editorial work behind Kozmetik
Günlüğü, a Turkish skincare blog. It keeps product knowledge (ingredient lists,
dated observations, sources, private notes) separate from the articles and
social posts that reference it, and stores everything locally in SQLite.

{{ figure(src="/images/projects/kozmetik-studio-running.png", alt="Kozmetik Stüdyo desktop editor showing a demo draft with a linked sample product in the reference panel", caption="The writing editor with a demo draft linked to a sample product. The interface is in Turkish; all content shown is synthetic.") }}

## What it does

- **Products:** verbatim ingredient (INCI) lists with source and check date,
  dated usage observations, and private notes, kept apart from manufacturer
  claims.
- **Writing:** posts, articles, and Reels drafts with linked products in a side
  panel, card and phone previews, Instagram length checks, and restorable
  revisions.
- **Images:** one managed library; each placement has its own crop, rotation,
  order, and alt text, while originals stay unchanged.
- **Export and backup:** immutable public packages without private notes or
  image metadata, plus full-workspace backups.

The UI is built with GPUI and gpuikit. A single storage worker handles database
transactions and image processing asynchronously, so rendering never waits on
disk. Edits autosave, and saves within ten minutes fold into one revision.

## Limits

This is a local desktop app, not a hosted service. Export creates a package but
publishes nothing; there is no AI integration, sync, or automatic social
posting. Workspaces are not encrypted by the app, so backups need deliberate
handling.
