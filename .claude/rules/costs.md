---
description: The API-rate cost ledger — how a session's spend is priced, how its Stop hook shares the event with the harness's own, and what the totals do not cover
paths:
  - costs/**
  - scripts/session-cost.ts
  - scripts/costs-report.ts
  - scripts/lib/session-cost.ts
  - .claude/hooks/stop-session-cost.sh
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
  the input rate, against ×0.1 for reads.
- **Thinking tokens are already inside `output_tokens`.** They are reported for
  interest and billed once.

An unpriced `(model, speed)` **throws**. A response silently counted as free
makes every total downstream a lie, and the failure is loud precisely because
`costs/prices.json` is hand-maintained: no machine-readable source of Anthropic's
prices exists, so the table goes stale by sitting still.

## Running beside the harness's Stop check

The harness registers its own `Stop` hook in `~/.claude/launcher-settings.json` —
`stop-hook-git-check.sh`, which ends a turn with exit 2 on a tree that is
unclean, holds untracked files, or is ahead of its remote. **Hooks for one event
run in parallel**, so writing and committing the row is work done while that
check may be reading the tree.

**Wrapping it is not available.** The launcher's config reaches the CLI through
`--settings`, read once at startup and never re-read, and the launcher rewrites
that file at every start and resume — so a patch applied from a `SessionStart`
hook is a session late every session, not just the first.

**So the hook waits the check out.** That check leaves nothing on disk — it
reads the tree and writes to stderr — so its process is the only thing there is
to wait on, and the hook polls for it by name at the last moment before anything
it does can touch the tree. A match that is an **ancestor** of the hook is not
the check: the check is a sibling, and an ancestor carrying the name is a shell
that merely mentions it, so waiting on one would outlast the turn.

Every way the wait can fail — no `pgrep`, a renamed check, a look that lands
before the process exists, a check still running after five seconds — falls back
to racing, and so does a failed push, which leaves a commit the check will refuse
on the _next_ turn, attributed to nobody. So the hook re-reads the same two
conditions after its own work and, when they hold, exits 2 with one line naming
the row — the only channel a `Stop` hook has to the agent, spent solely where a
block is already happening. It bails on a re-fired `Stop` (`stop_hook_active`)
exactly as the harness's check does: two hooks that can both block and neither
bail would hold the turn open forever.

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
