# tail-polish — hand-over

`/polish` over bite 12b: floor f680c86a (the last bare `polish:`), 266
commits, ~6.8k changed lines outside working notes. Refactors and prose only.
Stopped at the context ceiling partway through `/dry`.

## Done

- f78ca171 — `scripts/lib/play-insects.ts` (467 lines) split: `fliersOn`,
  `landed`, `LOOK`, `MOST_LOOKS`, `REST_LOOK` move to
  `scripts/lib/play-fliers.ts` (179); `playInsects` stays (307).
- 12799985 — knip green: dead `judgedFrom` removed; eight module-local
  exports un-exported.
- `/dry` applied: `playInsects`' `reaches` goes through `topsAt`;
  `play-walk.ts` gets `goneAlong` for five hand-written projections.

## `/dry` read so far

All of `scripts/`, all of `src/pages/mushrooms/model/` (tests included),
and `ui/scene/` `air-spots.ts`, `anchored-stand.ts`, `lawn.ts`, `mottles.ts`,
`visit-play.ts`, `layout.test.ts`. `openingCrop`'s inlined lambda (sweep +
layout.test) is the plan's call (`endless-field.md`), not a finding.

## tail-polish2 (continuing, same scope `f680c86a..HEAD`)

Commits before the last are `polish(12b):`, so a stop midway leaves the floor
at f680c86a; only the run's final commit is a bare `polish:`.

- `/dry` applied: `mottles.ts` `shownMottles` takes `forwardOf` from
  `model/stride.ts`.

## Left

- `/dry` over the rest of `ui/scene/` (non-test, then tests): `tending.ts`,
  `tuft-tap.ts`, `flower-shown.ts`, `mushroom-shown.ts`, `widest-spans.ts`,
  `tufts.ts`, `perch-sight.ts`, `clump-layout.ts`, `flower-bed.ts`,
  `flower-plots.ts`, `flower-layout.ts`, `mushroom-bed.ts`,
  `mushroom-room.ts`, `perches.ts`, `bed-place.ts`, and the smaller diffs.
- `/tend-prose` over the whole range. Already noted:
  - `play-approach.ts`: the `STANDS` doc ("Every mushroom drawn: …") sits
    above `SPREAD_OF` instead; the header has an over-long unwrapped line.
  - `mottles.ts` header names `cellMottles`, which does not exist
    (`cellLawn`); `lawn.ts` header line 5 over-long.
  - `veer-report.ts` `DASH_SLACK` cites `to-check.md`, a plan file
    (`docs/plans/`), from durable code.
  - `anchored-stand.ts` header: check `unanchored` is still what a rule
    goes back through.
  - `mushroom-probe.ts` `Hitches` has no doc line, unlike its siblings.
- The run's last commit must be a bare `polish:` (or
  `polish: nothing to change`) so the floor moves.
