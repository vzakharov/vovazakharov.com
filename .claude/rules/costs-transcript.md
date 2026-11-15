---
description: How the cost ledger reads a Claude Code transcript — the properties that decide what a session is priced at, why an unpriced model raises, and the fields that name a session
paths:
  - .claude/costs/lib/transcript.py
  - .claude/costs/lib/pricing.py
  - .claude/costs/lib/prices.py
  - .claude/costs/lib/shape.py
  - .claude/costs/lib/identity.py
  - .claude/costs/lib/tally.py
  - .claude/costs/prices.json
  - .claude/costs/session_cost.py
  - .claude/costs/test_pricing.py
---

# Reading a transcript

Part of the cost ledger, `.claude/costs/CLAUDE.md`; paths below are relative to
`.claude/costs/`.

Properties of `~/.claude/projects/<cwd-slug>/<session-id>.jsonl` that decide how
`lib/transcript.py` and `lib/pricing.py` read it. Each is load-bearing: get one
wrong and the totals are confidently incorrect rather than absent.

- **A subagent's spend is in a different file.**
  `<session-id>/subagents/*.jsonl` beside the transcript, one per agent — and it
  is the session's spend, billed to whoever spawned it. A reading that opens the
  main file alone therefore prices every delegating session short, and short in
  the one way nothing shows: the result looks exactly like a session that
  delegated nothing.
- **One API response is written as several records** — one per content block, so
  a turn that thought and called two tools writes three — and each carries that
  response's _whole_ `usage`. Records are deduplicated by `message.id`; summing
  them triples the bill.
- **A subagent's records carry the usage the stream started with.** Their
  `stop_reason` is null and their `output_tokens` a partial count — 16 of a
  response's final 112, 24 of 1,289 — while input and cache counts are already
  final. A matched event supplies the output; without one, the row warns that
  those responses' output is a floor.
- **A response is billed at the rates for its `(model, speed)` pair.** Fast mode
  doubles the rates, so `usage.speed` is read rather than assumed. A row's
  `above` is a second rate card for a model that bills a long prompt higher: a
  response whose prompt — input plus cache reads and writes — runs past its
  `prompt_tokens` is billed whole at it, output included.
- **Cache writes are billed by TTL.** `usage.cache_creation` splits into
  `ephemeral_5m_input_tokens` and `ephemeral_1h_input_tokens` — ×1.25 and ×2 of
  the input rate, against ×0.1 for reads.
- **Thinking tokens are already inside `output_tokens`.** They are reported for
  interest and billed once.
- **An absent field may arrive as an explicit `null`.** `lib/shape.py` reads the
  two alike, and a `<synthetic>` model — the placeholder Claude Code writes for
  a turn no model served — is skipped rather than offered to the price table.

An unpriced `(model, speed)` **raises**. A response silently counted as free
makes every total downstream a lie, and the failure is loud precisely because
`prices.json` is hand-maintained: no machine-readable source of Anthropic's
prices exists, so the table goes stale by sitting still. A new model is a new
row there before its first session can be priced.

## What names a session

Nothing in the transcript is the title Claude Code shows. Three fields stand in
for one, all read out of the file:

- **`openingPrompt`** — the session's first prompt, unwrapped from the envelope
  a slash command arrives in, so it reads `/handle <branch>`.
- **`prs`** — the numbers off the `pr-link` records, which is what groups the
  several sessions one pull request takes.
- **`url`** — the address a person opens the session at. Its id is a different
  one from the transcript's, and reaches the file only as prose, inside the
  attribution reminder the harness re-sends on a remote session change. That one
  record is what is matched: a commit trailer quoted anywhere in a transcript
  carries a session URL too, usually another session's.

**`operator`** is whose session it was: the GitHub handle
`.claude/hooks/operator-voice.sh` resolved at startup, read off the record that
hook leaves in the transcript. It is null wherever the hook named nobody — no
`gh`, or a token that is a bot's — rather than guessed from the pusher, who is
the token and so may be the agent's own account.
