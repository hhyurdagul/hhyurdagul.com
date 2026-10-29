+++
title = "A working note"
description = "A starting point for a technical note: the question, the work, and what changed."
date = 2026-10-29
draft = true

[extra]
is_template = true
+++

> This is a temporary writing template, not a published article. Replace it with
> your own note when you're ready.

## Start with a question

Open with the thing you wanted to understand. A concrete question is enough:
a result that looked wrong, a tool you wanted to try, or a decision you needed
to make. Give the reader just enough context to follow along.

## Show the work

Describe what you tried and what you observed. Keep the useful details; leave
out the diary of every attempt. A small example can be more helpful than a
long explanation:

```python
latencies_ms = [120, 135, 118, 142]
mean_latency_ms = sum(latencies_ms) / len(latencies_ms)
print(f"Mean latency: {mean_latency_ms:.1f} ms")
```

For a technical note, it often helps to separate three things:

- **The setup:** what you measured or built, and under which conditions.
- **The observation:** what actually happened, including the awkward parts.
- **The interpretation:** what the evidence supports, and what it doesn't.

## Leave a useful takeaway

Close with what changed in your understanding. Say where the result applies,
where it might not, and what you'd try next. A short, honest conclusion is
better than a sweeping one.

A note doesn't need to settle the whole subject. It just needs to leave the
next reader with something useful.
