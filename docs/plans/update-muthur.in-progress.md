# Sync vzakharov/muthur forward from 634bdfa

An `/update-muthur` run over five source commits, split as an elephant on the
operator's call: the first four land in the first bite, and the fifth —
vzakharov/muthur@295cac7, orientation and billed spend in the session ledger —
is the rest. The sync lock `muthur-sync-lock-634bdfa47431` is held on origin
across the bites; it frees itself when this PR merges and moves the trunk's
watermark.

## Eaten so far

The watermark stands at vzakharov/muthur@8f0f29a, with `/relay` in `adopted`
and `docs/adopting/` in `declined`. On the branch:

- `/plan` splits work across sessions as an elephant or a pizza
  (`plan/elephant.md`); `/go` eats one bite per session; the context budget
  hook's nearly-done judgment reads the open bite and offers `/relay`.
- `/relay` is adopted verbatim.
- `scripts/muthur-sync.sh` and its `SessionStart` nudge offer a sync when the
  source moves, behind the lock; `/update-muthur` claims it, clones through the
  script, and hands its candidates to `/task`.
- From 295cac7 already: the operator entry's two Russian-language preferences,
  and the Stop hook's `session cost (new)` subject on a session's first row.

The PR body carries the triage table for all five commits.

## Rest of the elephant

**295cac7's ledger change**, and the watermark to that commit (the source's
HEAD at this sync). What it adds: each row records its orientation — spend
before the session's first edit in the repo, its first question, or its first
`end_turn`, restarted at every compaction — and Claude Code's OpenTelemetry
`api_request` events, captured by a local receiver started from `SessionStart`
and `PostToolUse`, price the calls the transcript never records.

**How it lands is open, pending the operator.** The local ledger is a
TypeScript port of the source's Python, row-compatible with it and behaviourally
the same at 634bdfa; the only differences are wording, the source's handling of
a row with no `cost-state` record (reported as unchecked), and a temporary
harness-check-wait probe in the local Stop hook left over from PR #71.
Recommended: replace the TypeScript ledger with the source's Python wholesale at
HEAD, turning this and every later ledger commit from a translate into a take.
That means:

- `.claude/costs/` taken whole from the source, `sessions/` excepted; the
  watermark note on `.claude/costs/` shrinks to "`sessions/` is each repo's own".
- `scripts/session-cost.ts`, `scripts/costs-report.ts`,
  `scripts/lib/{session-cost,session-identity,cost-totals,cost-rows}.ts` and
  their tests removed; `.claude/hooks/stop-session-cost.sh` gives way to
  `.claude/costs/hooks/stop-session-cost.sh`, and `settings.json` points there.
- `.claude/rules/costs.md` gives way to the source's nested
  `.claude/costs/CLAUDE.md`, with a tombstone; the CLAUDE.md layout line
  repointed through a staged copy; `pnpm costs` runs `report.py`;
  `.prettierignore` and `operator-voice.sh`'s comment repointed.
- `vet.sh` runs `.claude/costs/test_*.py`, as it runs the context budget's.
- The telemetry receiver wired in `settings.json`. Its exporter variables live
  only in the environment's settings, which no agent can edit, so the report
  names them for the operator — the source's `docs/adopting/costs.md` lists them.
- Whether the PR #71 probe has answered its question, so it can go with the
  TypeScript hook rather than being re-added to the Python one.

The alternative, re-expressing ~1,200 lines of Python in TypeScript, is the
fallback if the operator keeps the port.
