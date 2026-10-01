# lens-land — the panoramic lens landed

**State: step 1 part done, as `lens-land.patch`** (applies on 95f6ad9, whose
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
