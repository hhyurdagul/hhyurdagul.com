+++
title = "Muninn — An Agent for Markdown Notes"
description = "A Rust LLM agent that searches and edits a Markdown vault from the terminal, or as an MCP server for coding agents."
date = 2026-10-14
weight = 6

[extra]
short_title = "Muninn"
card_description = "An LLM librarian for Markdown notes, from the terminal or inside a coding agent."
kind = "project"
status = "Active development"
role = "Designer and developer"
repo_url = "https://github.com/hhyurdagul/muninn"
showcase = true
stack = ["Rust", "Tokio", "Ratatui", "MCP", "OpenAI-compatible APIs", "Markdown"]
screenshot = "images/projects/muninn-running.png"
screenshot_alt = "Muninn's terminal interface with its command list and keyboard shortcuts."
+++

Muninn is an LLM agent that works directly on a folder of Markdown notes, with
no separate database or knowledge store. One Rust core powers three interfaces:
one-shot CLI requests, a terminal conversation, and an MCP server that Claude
Code, Codex, and other coding agents can call.

{{ figure(src="/images/projects/muninn-running.png", alt="Muninn terminal interface showing its command list, keyboard shortcuts, notes panel, and message input", caption="The terminal interface on a demo vault, after setup.") }}

## What it does

- Searches, reads, and edits notes inside one pinned vault, never outside its
  root, and has no shell tool.
- Follows the vault's own rules: a shared `AGENTS.md` for every agent, plus an
  optional `MUNINN.md` for Muninn alone.
- Shows changes as diffs when the rules require review: an approval dialog in
  the terminal, a prompt in the CLI, a pending diff over MCP.
- Journals every change, so `/undo` reverts it without overwriting later edits.

Onboarding asks for the vault, an OpenAI-compatible endpoint and model, makes
one test call, and offers to register the MCP server with installed coding
agents. Provider access, agent execution, vault storage, MCP, and terminal
widgets live in separate crates, so the same vault rules apply wherever a
request comes from.

## Limits

Muninn is a local tool in active development. Long conversations are not yet
trimmed to the model's context window. Over MCP, the calling agent approves a
pending change by replying in the same conversation; Muninn cannot verify that
the agent actually asked its user first.
