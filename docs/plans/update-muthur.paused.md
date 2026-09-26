# Sync vzakharov/muthur forward from 634bdfa

An `/update-muthur` run over five source commits, split as an elephant on the
operator's call: the first four land in the first bite, and the fifth —
vzakharov/muthur@295cac7, orientation and billed spend in the session ledger —
in the second. The sync lock `muthur-sync-lock-634bdfa47431` is held on origin
across the bites; it frees itself when this PR merges and moves the trunk's
watermark.

## Eaten so far

The watermark stands at vzakharov/muthur@295cac7, the source's HEAD, with
`/relay` in `adopted` and `docs/adopting/` in `declined`. On the branch:

- `/plan` splits work across sessions as an elephant or a pizza
  (`plan/elephant.md`); `/go` eats one bite per session; the context budget
  hook's nearly-done judgment reads the open bite and offers `/relay`.
- `/relay` is adopted verbatim.
- `scripts/muthur-sync.sh` and its `SessionStart` nudge offer a sync when the
  source moves, behind the lock; `/update-muthur` claims it, clones through the
  script, and hands its candidates to `/task`.
- The operator entry's two Russian-language preferences.
- The cost ledger is the source's Python, taken whole: `.claude/costs/` bar
  `sessions/`, its nested `CLAUDE.md` the ledger's doc, its Stop hook and
  telemetry receiver wired in the source's `settings.json`. The TypeScript port
  and its PR #71 probe are gone; `pnpm costs` runs `report.py`; vet runs the
  ledger's tests. Existing rows read clean under it.
- CLAUDE.md's pointer to the ledger's doc is edited in its staged copy.

The PR body carries the triage table for all five commits.

## Rest of the elephant

**Retire `.claude/rules/costs.md` when the staged CLAUDE.md is swapped in** —
early on the operator's ask, or at `/finalize`. The live CLAUDE.md `@`-imports
it, so it is always loaded and removing it before the swap is an in-place edit
of the prompt prefix, which `scripts/staged.sh` cannot stage. At the swap:
`git rm` it and add `.claude/rules/costs.retired.md`, a tombstone scoped by
`paths: [.claude/rules/costs.md]` so it never loads, pointing at
`.claude/costs/CLAUDE.md` and recording 3c59ca44c355424d09ecc4d70f40f2897088eb12
as the last commit that held the file.
