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

- `/tend-prose`, swept by grep over every added prose line in `src/` and
  `scripts/` (the range touches nothing else outside the off-limits
  notes): narration tells (none; the three "no longer" hits are runtime
  states), plan-file pointers (`play-veer.ts`' `to-check.md` dropped),
  lens 4 (no removed identifier survives only in prose; every backticked
  name in added prose names code), and the negator sweep (all constraints,
  no residue).

## tail-polish3 (existence and tightness, same scope)

- `scripts/`: `veer-report.ts` states R3.1's two bounds in place (no
  `insect-plane.md` citation) and `DASH_SLACK` tightened; `play-approach.ts`
  header 15 → 9 lines; `checkWatch`, `checkPops`, `checkBack`, `REST_LOOK`
  and the probe's hitch timing tightened; `play-walk.ts` header rewrapped.

- `src/`: tightened `anchor.ts` header, `anchored`, `headedLight`,
  `placesSetOff`, `tick` (rewrap); `anchoredStand` 12 → 7 lines,
  `STAND_REACH`; `air-spots.ts` `latticeOf`, `namedCell`, `airOf`;
  `laidOf`; `bentTurn`; `plantableIn`. Cut restating docs on `standingAt`
  and `Stood`. Read so far: all of `model/`, and in `ui/scene/` up to
  `tending.ts` alphabetically, plus `air-spots`, `anchored-stand`,
  `clump-layout`, `insect-drawn`.

## tail-polish4

- Cut the five restating one-liners: `lawn.ts` `cellOf`, `cellTufts`;
  `mottles.ts` `MOTTLES_PER_CELL`; `perch-crowding.test.ts` `apartEvenly`;
  `draw-flower.ts` `drawIn`.
- Tightened the eight blocks: `bareToTap` 8 → 5, `SIDE_OVERHANG` 5 → 3,
  `offSides` 4 → 3, `shownMottles` 5 → 3, `LIVE_REACH` 4 → 2, `tufts.ts`
  header 10 → 6, `follow` 4 → 3, `ringFoot` 5 → 3, `Laid` 4 → 3.
  (fe9cdfef)
- `ui/scene/` after `tending.ts`, added comment hunks: `tuft-tap.ts`
  header 4 → 1, `TUFT_REACH` 3 → 1, `tuftReach`'s restating doc cut;
  `tufts.ts` `shownSprouts` 4 → 3. `tufts.test.ts`, `view.ts`,
  `widest-spans.ts` hold; `tuft-tap.test.ts`, `view-inverse.test.ts`,
  `view.test.ts`, `visit-play.ts` add no comments.
- The bare `polish:` closing the run lands with the last of these.

## Left

Nothing: the run is closed, and the next `/polish` floors at its bare
`polish:` commit.
