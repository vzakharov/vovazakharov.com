# p3c-insects — hand-over note

Package: bite 12 P3, the insect adapter (step-spec §2 "Insects"). Paths under
`src/pages/mushrooms/ui/scene/`.

## Done

1. Step 1, the adapter (this commit):
   - `insect-view.ts`: legs flown in layout px as before; drawn through
     `ofLayout(view, point, row)` (the view from a `() => View | undefined`
     the scene passes, replacing the `Crop`), size unchanged, hidden at
     `v < V_NEAR` (`cull`; hidden ones are skipped by `reached`). Row:
     perched and arrived, the perch's foot row; in flight, the leg's two
     rows mixed by `alongOf` (distance to start over distance to start +
     end); air spots stand over the clump's row; leaving keeps the leg's
     start row. Entry: first perch drawn on the screen → past the nearer
     screen edge at that perch's row, mapped back (`layoutAtRow`); else past
     the world strip's end nearer the perch. `see(footRows)` takes the rows.
     The proboscis is posed against the nectar's screen point.
   - `perch-sight.ts`: `flowerInSight` gets no covers (edge test only;
     `roomFor` keeps its covers, a planting rule). New `clumpRow`,
     `footRows(stand)` (perchName → foot row: caps, standing flowers, air at
     the clump's row). `onscreenOf(layout, view)` is the layout stretch 33
     screen columns reach on both the screen's foot row and the seam's row
     (intersection, so conservative for every foot row between), clamped
     to the world strip; `undefined` when nothing shows (a release then
     goes without `onscreen`, the model picks any perch, the view enters it
     from the strip's nearer end).
   - `eye-crop.ts`: `layoutAtRow`, `ofLayout`'s inverse at a given row.
   - `meadow-scene.ts` (3 lines): `InsectView` gets `() => this.eye.view()`;
     release's `onscreen` from `onscreenOf(layout, this.eye.view())`;
     `see()` calls `this.insects?.see(footRows(stand))`. It is now 455 lines.
   - Tests: `eye-crop.test.ts` (new: the inverse over 5 eyes × 6 screens);
     `perch-sight.test.ts` (behind-cap count dropped; `onscreenOf` at the
     opening equals the opening crop, turned shifts, facing away is none,
     stepped/turned shown perches draw on screen; `footRows`). Passing:
     perch-sight, eye-crop, tufts, flower-plots.

## Left

- Step 2: `visit-play.ts` off `Crop` (swap `Pick<Crop, 'toWorld'>` for
  `Crosswise` from `eye-crop.ts`, structurally the same), delete
  `pan-input.ts` once `mushroom-room.ts` stops importing it, run
  `fliers.test.ts`, `/preview` frame `walk-butterfly.png`. Not started.
- The `shows` check in `mushroom-bed.ts`: there is none any more (p3b
  replaced `answer(sound, shows)` with `FlowerBed.inView`). Nothing done.

## Decided

- `onscreenOf` tests x only, as `Onscreen` does: a perch below the screen's
  foot after a walk into the clump still counts as shown. Exact per-perch
  sight would need `Onscreen` (model) to change.
- The in-flight row mix is by distance along the leg, not by time, so it
  follows where the steered path actually has the insect.
