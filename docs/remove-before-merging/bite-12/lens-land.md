# lens-land — the panoramic lens landed

**State: landed as source (Round 2, below); `lens-land.patch` is gone.**
Round 1 left it as `lens-land.patch` (applies on 95f6ad9, whose
source is aa7bf73's; type-checks, lint- and prettier-clean). It is still a
patch, not source, because six test files are red. It holds all of
`lens-build.patch` and the fixes below, so `lens-build.patch` is deleted.
Stopped by the subagent context budget. Steps 2–4 of the package are not
started.

## Fixed (green, one file at a time)

- `ground.test.ts`: "at the opening, where the opening crop shows it" is now
  the lens rule stated against `project`: across at
  `middle + focal · atan(pinhole dx / focal)`, the scale `cos θ · hypot(1, θ)`
  of the pinhole's, the row from that. The step test is split. A point
  straight ahead stays at the middle and scales by `d / (d − step)`. Every
  point in front grows and moves no nearer the middle. New: 4 screens a turn
  on tabL, `spread`/`gathered` round trip, `planeSeen` inverts `viewOf`.
- `walk.test.ts`: the turn formula is `(crossing − x) / arc`.
- `insect-seat.test.ts`: at the opening, the seat and the flight now part
  by up to 0.7 px off the middle (0 at the middle), because the seat is
  placed about its foot and the flight point by point. The tolerance is
  now 1 px. The zoom there is 0.99991 off the middle, so the tolerance is
  1e-3.
- `bed-place.test.ts`: "stands where the layout stands it" goes through the
  lens formula above (zoom = `cos θ · hypot(1, θ)`).
- `brow.test.ts`: blade gaps in px use `arc`.
- `screenAt` / `shiftOf` (`panorama.ts`) return `number`: a linear lens
  never says "behind". Callers in brow, grass, paint-backdrop and the
  tests dropped their `undefined` branches. The `arc: focal` aliases in
  brow, grass, paint-sky and skyline are renamed `arc`.
- **Clouds (`panorama.ts` `laneOffsets`), a decision the plan does not
  make.** On desktop (3.24 screens a turn) an even lane put a follower on
  the opening screen, so it opened with 4 clouds. Now a lane's two clouds
  next to the leader stand a whole screen off it, and the rest are spread
  evenly between, no gap wider than a screen. The sky away from the opening
  differs from the even lanes on every screen.
- `panorama.test.ts`: "behind" is now off the screen. "Away" turns by a
  screen plus the picture.
- `sun-layout.test.ts` `shownAbove` counts only the part of the disc over
  the sampled skyline. It used to extrapolate the first segment for a sun
  past the screen's edge, which the lens now reaches at 20° steps.

## Red, not yet looked at

- `sun-layout`: "parts the far hills … no level run", phoneL, visit 1409585,
  heading 4.54, level at x 356.
- `view` (24), `repaint-queue` (12), `tufts` (6), `perch-sight` (6),
  `meadow-rules` (3: tabL, tabP, phoneL).
- `fliers.test.ts` not run.

## Left

1. The reds above, then commit as source.
2. `scripts/lib/play-walk.ts:247`, `play-approach.ts:140`: azimuth as
   `dx / arc`, read from `pinholeOf`.
3. Cost of `layoutAtRow`'s search in `onscreenOf` (66 calls) against the
   frame budget.
4. Frames (`lens-land-*.png`).

## Round 2 — landed as source

Every mushroom test file but `fliers.test.ts` is green (82 files, one at a
time), `pnpm typecheck`, eslint and prettier clean. Fixed:

- `view`, `tufts` (24, 6): "at the opening as the crop shows it" is the
  lens rule `ground`/`bed-place` already state: across at
  `middle + focal · θ`, θ the crop's pinhole azimuth, the height below the
  horizon and the zoom times `cos θ · hypot(1, θ)`.
- `repaint-queue` (12): the bed paints a thing at `hazeAhead` where the
  view stands it (`mushroom-bed.ts` `place`), so "nothing repaints at the
  opening" holds by construction. The layout's pinhole haze is no longer
  the opening's: a side mushroom stands up to 0.067 hazier at θ ≈ 0.59
  (phoneL's edge, off-screen on the rest), 0.02–0.03 inside tabL. The test
  now says only that stepping in clears; the back-row case reads its paint
  off the view and checks it within 1e-3 of the layout's near the middle.
- `perch-sight` (6): at the opening `onscreenOf` reaches
  `middle ± focal · tan(half / focal)` (the screen's edge azimuth), wider
  than the crop.
- **A lens defect, fixed in source (`eye-crop.ts`, `perch-sight.ts`):**
  facing away, the spread wraps a row's two far ends (±176°) onto the
  screen out of order, so `onscreenOf` answered the whole world and
  `layoutShown` (the room's `within`) a span holding it. New `rowRuns`
  cuts a row's crossings into left-to-right runs; `onscreenOf` keeps each
  run to the world's strip, `layoutShown` answers none for edges out of
  order (the world's wedge is ±71°, so a screen straddling the back never
  shows it). New `layoutShown` test in `eye-crop.test.ts`.
- `meadow-rules` (3): the edge margin and the controls are measured on the
  screen, the cap and tap area drawn about the foot through the opening
  view, as the room does; it used to shift the controls by the shown
  stretch's left, the pinhole's identity.
- `sun-layout` (phoneL, 1409585, 4.54): two samples straddled a 0.001 px
  ripple of the far range's own crest at equal height. A level run now has
  to stay level at the midpoint too.

## Round 3

1. `fliers.test.ts` alone: 48/48 green (3.6 min) on the landed lens, no
   change needed.
2. Play scripts read the lens from source:
   - `play-walk.ts` (sideways drag): azimuth `(x − pinhole.x) / arc`, from
     `pinholeOf(camera)`, the rule `walk.ts`'s drag turns by.
   - `play-approach.ts` (aim): frames to turn by `|offset| / arc`.
   - `play-opening.ts` also read the old pinhole: its opening identity
     compared each drawn thing against "bite 11's crop" (layout px less the
     crop's left), which the lens no longer is off the middle. It now
     compares against `ofLayout(viewAt(camera, OPENING_EYE), laid, laid.y)`,
     within the same 0.5 px; the sunk-past-the-brow notes measure from
     there too. Not played yet (the frames round plays it).
   - The camera schema three scripts spelled is one `Camera` in
     `mushroom-probe.ts`, `satisfies z.ZodType` of the model's `Camera`.
   - `pnpm type-overlap` is red on `insect-away`/`insect-shown`/`flight`
     (`OverRow`, `Shown`, `Span`): not this package's files, red before it.

3. `layoutAtRow`'s cost, timed in node (not committed), `meadowLayout`
   seed 7, six headings from 0 to π: `onscreenOf` (33 columns × 2 rows,
   66 crossings) takes 0.36–0.51 ms at the median, 0.71 ms at p95, on both
   tabL (1180×820) and phoneP (390×844); one `layoutAtRow` 4–5 µs,
   `layoutShown` ~0.02 ms. The play run's budget is a 26 ms median of
   `game.step` (`scripts/lib/frame-budget.ts`), so that is under 2 % of a
   frame. And `onscreenOf` runs only when an insect is released
   (`arrivals.ts`), not every frame. Per frame, only `offScreen`
   (one `layoutAtRow` per insect flying in or out) and `layoutShown`
   (on a controls repaint) touch the search. Left as it is.

## Left

1. Frames (`lens-land-*.png`), and playing `play-opening`'s restated
   identity, `play-walk`'s drag and `play-approach`'s aim.
