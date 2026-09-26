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

Nothing past this bite: it is the last.

## This bite

**295cac7's ledger change, by replacing the TypeScript ledger with the source's
Python wholesale**, and the watermark to 295cac7 (still the source's HEAD). What
the commit adds: each row records its orientation — spend before the session's
first edit in the repo, its first question, or its first `end_turn`, restarted
at every compaction — and Claude Code's OpenTelemetry `api_request` events,
captured by a local receiver started from `SessionStart` and `PostToolUse`,
price the calls the transcript never records. Taking the Python turns this and
every later ledger commit from a translate into a take.

- `.claude/costs/` taken whole from the source, `sessions/` excepted; the
  watermark note on `.claude/costs/` shrinks to "`sessions/` is each repo's own".
- `scripts/session-cost.ts`, `scripts/costs-report.ts`,
  `scripts/lib/{session-cost,session-identity,cost-totals,cost-rows}.ts` and
  their tests removed; `.claude/hooks/stop-session-cost.sh` gives way to
  `.claude/costs/hooks/stop-session-cost.sh`; `settings.json` and
  `.claude/hooks/lib.sh` taken from the source.
- `.claude/rules/costs.md` gives way to the source's nested
  `.claude/costs/CLAUDE.md`, with a tombstone; the CLAUDE.md layout line
  repointed through a staged copy; `pnpm costs` runs `report.py`;
  `.prettierignore` and `operator-voice.sh`'s comment repointed.
- `vet.sh` runs `.claude/costs/test_*.py` beside the context budget's, and
  `.claude/rules/stack.md` lists them.
- The existing rows read clean under `report.py`; any retired key it strips is
  committed with the bite.
- The PR #71 probe goes with the TypeScript hook. Its log lands in a gitignored
  `tmp/` of a container that is reclaimed, so it answers nobody, and the source
  shipped the same wait without it.
- The report names the exporter variables the operator has to set in the
  environment's settings, from the receiver hook's own list.

DRY notes: nothing is re-expressed, so nothing is duplicated — each file is the
source's, and the one repo-specific seam, `vet.sh`'s line, reuses the loop the
source's own vet runs over the same test files.
