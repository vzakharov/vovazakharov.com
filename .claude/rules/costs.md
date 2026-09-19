---
description: The API-rate cost ledger — how a session's spend is priced, why its Stop hook wraps the harness's own, and what the totals do not cover
paths:
  - costs/**
  - scripts/session-cost.ts
  - scripts/costs-report.ts
  - scripts/lib/session-cost.ts
  - .claude/hooks/stop-session-cost.sh
  - .claude/hooks/patch-launcher-hooks.sh
---

# The API-rate cost ledger

`costs/sessions/<YYYY-MM>/<session-id>.json` records what a session would have
cost at Claude API rates. The subscription price hides that number, and the
point of having it is to know the size of the bill before subscription pricing
stops being a bargain.

## Reading a transcript

Four properties of `~/.claude/projects/<cwd-slug>/<session-id>.jsonl` decide how
`scripts/lib/session-cost.ts` reads it. Each is load-bearing: get one wrong and
the totals are confidently incorrect rather than absent.

- **One API response is written as several records** — one per content block, so
  a turn that thought and called two tools writes three — and each carries that
  response's _whole_ `usage`. Records are deduplicated by `message.id`; summing
  them triples the bill.
- **A response is billed at the rates for its `(model, speed)` pair.** Fast mode
  doubles Opus-tier rates, so `usage.speed` is read rather than assumed.
- **Cache writes are billed by TTL.** `usage.cache_creation` splits into
  `ephemeral_5m_input_tokens` and `ephemeral_1h_input_tokens` — ×1.25 and ×2 of
  the input rate against ×0.1 for reads, which is why a session's largest line
  is usually its first write rather than anything it generated.
- **Thinking tokens are already inside `output_tokens`.** They are reported for
  interest and billed once.

An unpriced `(model, speed)` **throws**. A response silently counted as free
makes every total downstream a lie, and the failure is loud precisely because
`costs/prices.json` is hand-maintained: no machine-readable source of Anthropic's
prices exists, so the table goes stale by sitting still.

## Why the Stop hook wraps another one

The harness registers its own `Stop` hook in `~/.claude/launcher-settings.json` —
`stop-hook-git-check.sh`, which ends a turn with exit 2 on an unclean or unpushed
tree. **Hooks for one event run in parallel**, so a second `Stop` hook writing a
row would race that check for the working tree and lose on the turns where the
check reads mid-write.

So `stop-session-cost.sh` does not run beside it: `patch-launcher-hooks.sh`
repoints the launcher's `Stop` command at the wrapper, which prices the session,
commits and pushes the row, and only then runs the command it displaced. Two
contracts make that borrowing safe, and both are tested by the shapes they guard:

- **The displaced command runs even when everything above it failed.** It is a
  safety check this repo borrowed, not one it owns.
- **Its exit status and stderr reach the harness unaltered**, that being how it
  ends a turn.

The launcher rewrites its own files at every start and resume, so the patch is
re-applied from here each session rather than installed once. A launcher config
whose `Stop` entry is not the single-command shape the patcher knows is left
untouched and reported into session context: a silent no-op there looks exactly
like a working ledger until the month's total comes out wrong.

**The patcher is the only thing here that writes outside the repository**, and
an agent cannot run it as a tool call — a harness classifier refuses to let one
rewrite the hook configuration it is itself running under. It installs when the
harness runs it as a `SessionStart` hook, which is also the only way it is meant
to run.

## What the totals do not cover

- **The last turn of a session.** The transcript is written asynchronously and
  lags the live conversation, so each run rewrites the row from the whole file
  and picks up what the previous run was too early to see. The final turn has no
  successor to correct it.
- **Abandoned branches.** Rows reach `main` by merge, so work that is thrown
  away is thrown out of the ledger too — an undercount biased toward exactly the
  sessions that spent without delivering.
- **Other repositories.** The transcript directory is keyed by working
  directory, so these totals are this repo's. A cross-repo month needs a home
  outside any one repository.
- **`main` itself.** The hook declines to commit a row on the trunk, where there
  is no branch to carry it.
