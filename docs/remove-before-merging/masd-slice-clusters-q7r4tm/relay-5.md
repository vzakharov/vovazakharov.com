# Relay 5 — MARS sub-slices: tooling built, the cuts and docs left

## Standing constraints

None stated.

The muthur sync offer was made; do not make it again.

## The conversation

1. **Session opened with**
   `/relay take claude/masd-slice-clusters-q7r4tm — MARS разобран, ждём решения по правилу Steiger и по тому, где его делать`
   (parked from relay-4).
   - Agent: attached. The auto-branch delete
     (`claude/mars-steiger-rule-ycch12`, empty) was blocked by the auto-mode
     classifier and left on origin. Read relay-4.

2. **Operator** (mid-turn): «Steiger отключаем, делаем здесь -- без этого
   какой вообще смысл этого пиара?»
   - Agent: took it as the go-ahead for MARS as bite 3 on this branch,
     flipped the plan to in-progress and wrote `## This bite`.

3. **Operator** (mid-turn): «и отдельно: хорошо бы детерминистическое
   определение "такой-то слайс импортирует из такого-то слайса только его
   подслайс, значит этот подслайс стоит вывести вовне"; пока что в виде
   ворнинга, потому что _куда_ его вывести -- задача нетривиальная (и с учётом
   всех импортных ограниченией не всегда решаемая, за исключением "решения"
   "перенести всё в shared")»
   - Agent: accepted, noting that `warn` is banned in this repo's ESLint
     (`.claude/rules/eslint.md`), so a warning would have to live in the
     report.

4. **Operator** (mid-turn): «ну тогда ок, error, и с советом агенту (с
   разрешением оператора) игнорить то, что просто не выносится»
   - Agent: built promotion as a `check:masd` error whose message advises
     asking the operator and, on their yes, marking the sub-slice's barrel
     `// masd-disable promotion -- <why it cannot move>`; built the rest of
     the tooling; the first cut (`prose/`) tripped promotion, so
     `ProseContent` moved to blog's `shared/ui`; then paused on the context
     budget and relayed. The whole session was one turn, every operator
     message after the first arriving mid-turn, so
     `scripts/relay-last-reply.py` found no earlier turn to append; the
     interim chat lines are in the transcript (Pointers).

## Intent

MARS: clusters the report finds become sub-slices inside their slice
(relay-4's Intent), guarded by real checks rather than a report alone, and
landed on this PR, since without it the PR's cluster report has nothing to
act on. A sub-slice a consumer uses alone belongs outside its slice, and
that is an error; where it goes is a judgement per case, so the error points
at the operator for the cases nothing can host.

## Decisions

- **Sub-slice** = any folder directly in a slice or a sub-slice not named in
  `SEGMENTS` (`ui`, `model`, `lib`, `api`, `config`, `i18n`). A non-segment
  folder _inside a segment_ (`ui/backdrop/`) is segment internals, not a
  sub-slice. `i18n` joined the set on relay-4's recommendation; the operator
  never answered that question — mention it, don't block on it.
- **Barrel rule** is a custom ESLint rule (`vova/sub-slice-entry`), not
  `boundaries`: boundaries reads a slice as one element and its
  `fileInternalPath` cannot express "the first non-segment folder". The
  sub-slice's barrels are the same `PUBLIC_API` names, `index.test-only.ts`
  for test code. Outside the slice, `boundaries` already forbids reaching a
  sub-slice barrel (`prose/index.ts` is no `PUBLIC_API` match).
- **Steiger override** scoped to `./src/*/{pages,widgets,features,entities}/**`,
  with `check:masd` keeping the residual guard: a segment's name inside a
  segment. Approved by the operator (message 2).
- **Significance**: a sub-slice fails when cutting it off its parent (slice or
  enclosing sub-slice) does not raise modularity, shipped files only. Integer
  numerator `ends·(2m − ends) − 2m·crossing`, so zero is exactly zero.
- **Promotion** (operator's term "вывести вовне"): per consumer location (a
  slice, a segmented layer, a router) and target slice, the names it imports
  from the slice's root barrels are traced through the barrel's
  `export { … } from` lines to the sub-slice they come from; all from one
  sub-slice → error. Dynamic imports and `export *` are not traced (none
  exist in barrels today); an untraceable name counts as "not a sub-slice",
  so the check errs toward silence.
- **`ProseContent` → `blog/shared/ui`**: it renders a content tree and knows
  no document (music's story renders a song with it), and `shared` in blog is
  the lowest place both consumers inherit. `print-job.ts`'s
  `DOCUMENT_SOURCES` gained `src/blog/shared/ui`.
- **MASD → MARS rename** of files and scripts is not done; it is a question
  for the operator (Rest of the elephant).

## Errors and dead ends

- `subSlicesOf` first read a slice-root file as sitting in a sub-slice named
  `''`, which flagged every slice as an insignificant sub-slice of itself;
  fixed before commit.
- The `prose/` sub-slice, relay-4's trial, is gone: promotion moved it out.

## State

- Branch `claude/masd-slice-clusters-q7r4tm`, draft PR
  https://github.com/vzakharov/vovazakharov.com/pull/228, `CONFLICTING` with
  `main` (left for `/finalize`). Commits this session: 595712b (tooling),
  f4e6515 (`ProseContent` move), then the pause and this summary.
- Plan: `docs/plans/masd-slice-clusters.paused.md` — `## Rest of the bite`
  lists the cuts and the docs.
- All of `check:masd`, `lint:fsd`, `tsc`, and the touched files' ESLint pass
  at f4e6515; vet not run.
- Nothing running: no CI, subscription or check-in.
- Auto-branch `claude/mars-steiger-rule-ycch12` is still on origin (delete
  was blocked).
- Estimate: this session 4.5 h senior developer + 0.5 h senior architect.
  Remainder handed on: 1.5 h senior architect (naming and judging each cut,
  promotion destinations) + 1 h senior developer (the moves, barrels and the
  two masd docs).

## Pointers

- `eslint/masd-graph.ts` — `SEGMENTS`, `subSlicePath`.
- `eslint/rules/sub-slice-entry.ts` (+ test) — the barrel rule.
- `scripts/lib/slice-graph.ts` — `sliceOf`, `subSlicesOf`, `importsOf`,
  `edgesWithin`, `cutGain`.
- `scripts/lib/sub-slices.ts` — nested segments, significance, promotion,
  `STAYS` marker.
- `scripts/masd-check.test.ts` § "masd-check on sub-slices",
  `scripts/masd-clusters.test.ts` — fixtures to copy.
- `steiger.config.mjs` — the override.
- `docs/masd.md`, `.claude/rules/masd.md` — still describe no sub-slices.
- `pnpm masd:clusters` — the candidate list for the cuts.
- Earlier summaries: `relay-4.md` (MARS analysis), `relay-3.md`.
- This session's transcript:
  https://claude.ai/code/session_01DaohkDP54itUJefK924SN8
- Predecessor's: https://claude.ai/code/session_01DaohkCcNFQKo8oG38wbeLV

## Next step

Resume the paused plan with `go`: cut the hits in `## Rest of the bite` into
sub-slices one commit each, judging any promotion error per case (asking the
operator where nothing can host one), then write sub-slices into
`docs/masd.md` and `.claude/rules/masd.md`, then `/go`'s Step 3 and Step 4.
Still open with the operator, not blocking: whether to rename MASD to MARS
across files and scripts, and whether `i18n` in the segment set stands.
