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
- `/dry` applied: `tending.ts` `tendedIn` takes `azimuthOf`
  (`model/flight-frame.ts`); `tuft-tap.ts` measures through
  `distanceBetween`; `flower-plots.ts` `ringFoot` turns its slot step
  through `anchored`, which its doc already named.
- `/dry` read, nothing to apply: `flower-shown.ts`, `mushroom-shown.ts`
  (the two `unplacedShown` build different shapes), `widest-spans.ts`,
  `tufts.ts`, `perch-sight.ts`, `clump-layout.ts`.
- `/dry` applied: `perch-crowding.ts` measures through `distanceBetween`.
- `/dry` done over the rest of `ui/scene/` and its tests. Left as calls,
  not applied: `view?.eye ?? OPENING_EYE` (or `.heading`) is spelled in
  `flower-bed.ts`, `mushroom-bed.ts`, `tufts.ts`, `planter.ts` and
  `paint-backdrop.ts` — a one-line fallback whose helper would save little;
  `insect-seat.ts`' sideways step is `forwardOf(sidewaysOf(sight))` only up
  to rounding, so it stays.
- `/tend-prose`, the six named problems: `play-approach.ts` `STANDS` doc
  back over `STANDS`, header rewrapped; `mottles.ts` (and `Grass.seed`)
  name `cellLawn`; `lawn.ts` header rewrapped; `DASH_SLACK` states its
  bound's reason, no plan-file pointer; `Hitches` gets its doc line.
  `anchored-stand.ts` header holds: `grownOn` and `Perches.see` go back
  through `unanchored`.

## Left

- `/tend-prose` over the rest of the range.
- The run's last commit must be a bare `polish:` (or
  `polish: nothing to change`) so the floor moves.
