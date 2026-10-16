+++
title = "Build notes #1: My AI agent beta-tests its own memory"
description = "Building Muninn, a local LLM librarian for Markdown vaults, and having Claude Code beta-test its memory and log bugs into the vault itself."
date = 2026-10-16

[taxonomies]
tags = ["AI", "LLMs", "Developer Tools", "MCP"]

[extra]
kind = "post"
intro = "Muninn gives AI agents shared memory across tools. To test it, Claude Code uses it during daily work and logs findings through the very tool under test."
+++


I do most of my work with AI agents now. And every time I switch tools, or hit a usage limit and carry on somewhere else, the next agent starts from zero. It doesn't know who I am, what I'm working on, or what we decided last week. Memory features exist, but each one lives inside a single product, and my context doesn't.

My knowledge already lives in one place: a vault of plain Markdown notes. What's missing is a way for every agent to reach it. So I'm building **Muninn**, named after Odin's raven of memory: a librarian for that vault.

## Where Muninn stands

I pin the vault once. After that, from any folder:

- `muninn ask "…"` answers or saves in one shot from the terminal.
- `muninn` opens a chat with the vault.
- `muninn mcp` makes Muninn a tool for coding agents. Claude Code, Codex, or anything that speaks MCP can ask my notes, save decisions, and talk back and forth with Muninn.

When an agent session starts, it loads a short `MEMORY.md` from the vault: who I am, what I'm working on now, how I like to work. Muninn keeps that file up to date, and every change to it needs approval.

Muninn runs its own agent loop over the vault. It can only read, search, and write notes there: no shell, no internet. It follows the rules written in the vault itself, and every change it makes is logged and can be undone. It runs on OpenRouter today; support for Anthropic, OpenAI, Gemini, and local models is in and waiting for its first live tests. It isn't public yet.

## Why the agent is the beta tester

The main user of Muninn isn't me. It's the agent I work with. The agent calls Muninn throughout the day, gets every answer first, and is the first to see when one is wrong. So I made Claude Code Muninn's beta tester.

The loop:

1. Claude Code uses Muninn during real work: asking about my notes, saving decisions, setting up project notes.
2. It checks every answer and every change against the vault before trusting it.
3. When something is off, it logs a finding (what was asked, what it expected, what happened, how serious it is), and it logs it *through Muninn*, in a findings log in the same vault.
4. We fix it in the repo, rebuild, re-run the scenario, and mark the finding fixed with the commit.

The tool under test keeps the record of its own bugs.

## Day one: twelve findings

**What it got right.** Everything Muninn quoted from my notes was correct. Muninn followed my vault's schema and filed notes where they belong. When a vault rule asked it to run a validation script, it said plainly that it couldn't (it has no shell) instead of pretending the check had passed.

**What it got wrong.** What it said about *its own actions*, and about what it *hadn't* found.

- It said it had linked two new notes. It had written their paths in backticks, which aren't links.
- It said a search had found no notes linking to a page. One did.
- Asked whether my vault had a convention for blog posts, it answered **"No"**, confidently and wrongly. It had run one search for the whole phrase "website blog hhyurdagul.com channel". Search matched exact text only, so nothing came back. It then reported that searches for "blog" and "channel" had come back empty, searches it never ran. The convention was there all along: a `channel: blog` field, with a template.

**The worst bug wasn't the model's fault.** The model provider failed halfway through a turn. Notes had already been written, but the error said nothing about them, so the calling agent couldn't know what had landed.

## What changed

- A failed turn now lists every change already made, with undo ids, and the conversation can continue.
- Temporary provider errors are retried.
- A search of several words that matches nothing falls back to any of the words, and the tool says to search one keyword at a time. The same question now gets the right answer.
- Notes cited only from search snippets are flagged as not read in full.
- The startup memory goes out without its metadata header, which only took up the agent's budget.

## The lesson

The model I tested with is small and free. Minutes after I added a prompt rule, "read every note you cite", it ignored it. The answer was still correct, but the rule didn't hold. A prompt rule is a suggestion. If it matters, enforce it in code, or make the tool hard to misuse.

## What's next

The same questions on stronger models, to see which findings are about the model and which are about Muninn. More days of dogfooding. Then a public release, once an agent can rely on it without checking every answer.

The findings log keeps growing, and so will these notes.