# Relay 18 — #258's late review, handled on the island branch

## Standing constraints

None stated this session beyond the house rules (never resolve a review thread;
merge state and CI are reported, not fixed, outside `/finalize`).

## The conversation

1. **Operator** (`/handle claude/world-game-zoltan-syama-hodowq -- …`):
   «только ревью я по ошибке оставил на `island/review-1`, но там FF, поэтому
   наверное не сложно будет обработать в материнской ветке (и там тоже как
   минимум один коммент необработан)»

   **Agent**: attached to the branch (the empty auto-branch's remote delete got
   `stale info` — it was never pushed, nothing to remove). Exported #255 and
   #258 (`docs/pr/255`, `docs/pr/258`, committed 8fe91850): 14 unanswered
   threads on #258, 1 on #255. Worked them as the review lane, committing and
   pushing each unit; replied on every thread; paused for the context budget
   and relayed. (verbatim in Last agent turn)

## Intent

Answer the review Vova left on #258 (merged into this branch, so the fixes land
here) and the one open #255 thread, with the code changes the comments ask for.

## Decisions

- **T01 — vet fails a short cost row**, derived rather than listed:
  `unwritten()` (`.claude/costs/lib/shape.py`) compares a row's raw JSON with
  what `to_json` of the parsed dataclasses writes; plus explicit non-null
  `subjectLine`, `operatorWords`, `branchLines` (`FILLED` nulls in
  `check_estimates.py::unfilled`). Fix for both is `estimate.py set --session`,
  which rewrites the row in the current shape. Beat: a hand list of the
  mammoth's new fields (drifts with the next field).
- **T02 — subjects carry no scope the branch already names**: notice usage and
  `.claude/costs/CLAUDE.md` say so; this branch's rows lost `(island)`.
- **T05 — board data lives in `src/island-board/app/config/`** (`island.yaml` +
  `island/`), the app layer's `config` segment. Steiger and `check:masd` pass.
- **T06 — `done: true`**, an optional boolean on a sticky (not an enum: one
  state needed, and most cards never set it), rendered as a floated ✓.
- **T04 / #255 T01 — `.claude/rules/writing.md`**: the machine-prose tells moved
  out of `writing/CLAUDE.md` (which only loads under `writing/`) into a rule
  scoped to drafts and `sites/*/public/**/*.md`; contrast and the
  vzakharov/life polish rule folded in; `contrast.md` deleted.
- **T03 — no change**: the publish rule reaches the lead through the hook's own
  notice text every prompt and the plan's standing constraints (line 79), not
  through the docstring.
- **T12 — `Gridded`, `Distant` → `src/scene/shared/lib/plane.ts`**: only scene's
  descendants read them.

## Errors and dead ends

- #258 T07's attachment (a domain idea as an image) returns 403 to the
  container even with `GH_TOKEN`; asked Vova for the domain as text.

## State

- **Branch** `claude/world-game-zoltan-syama-hodowq`, PR
  https://github.com/vzakharov/vovazakharov.com/pull/255 (draft, base `main`).
  #258 is merged into it.
- **Last pushed** ed013f17 before this summary's commit.
- **Plans**: `docs/plans/island-review-2.paused.md` is this work (left: polish,
  PR refresh); `docs/plans/world-game-zoltan-syama.paused.md` is the mammoth
  itself, untouched here — the successor resumes the review-2 one.
- **Estimate** this session: 2 h senior developer (cost-row gate, backfill, type
  move) + 1.5 h senior developer (board move, done flag) + 1 h senior editor
  (writing rule, fifteen replies). **Remainder** for the successor: 0.5 h senior
  developer — the polish passes and the PR body refresh over a finished diff.

## Pointers

- `docs/plans/island-review-2.paused.md` — done and left, with SHAs.
- `docs/pr/258/pr.md`, `docs/pr/255/pr.md` — the exports this session answered.
- Commits: a4ca906a, 0832c16a, 5ea82220, 3cdcfb54, 979fd555.
- Predecessor transcript: https://claude.ai/code/session_01RAikusyvfNMFhA64b3J7RM

## Next step

`handle` — and the paused plan it resumes is
`docs/plans/island-review-2.paused.md`, not the mammoth's: run `/polish` over
this session's commits, then `/pr` to refresh #255's body. A fresh export may
show Vova's answers to T07 (the domain in text) or T10 (the coast primer).
