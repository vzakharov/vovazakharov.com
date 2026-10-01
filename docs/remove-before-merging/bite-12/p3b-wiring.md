# p3b-wiring — hand-over note

Package: bite 12 P3 step 2, the scene wiring. Paths under
`src/pages/mushrooms/ui/scene/`.

## Done

1. Step 1, the wiring (this commit):
   - `meadow-scene.ts`: `EyeInput` replaces `Crop` (fit in `paint`,
     `listen`, `view()` per frame). Each frame (`walk`) calls
     `backdrop.follow`, `bed.follow`, `flowers.follow` before the updates;
     the camera never scrolls across (`scrollX` 0); the bob is the camera's
     `scrollY`; each foot that lands sounds `voice.step(foot)`. Keys go
     through `playTheMeadow`, which takes the flower bed and builds its
     `KeyedPlay` from `FlowerBed.inView` / `answer`.
   - `walking.ts` + test (new): `bobAt` (−0.004·height·gait·|sin(π·s/0.8)|),
     `gaitOf`, `Gait.step` → `{feet, bob}`.
   - `eye-crop.ts` (new): `eyeCrop` — the view as a strip crop's `toWorld`
     (x on the ground's middle row, y kept), for the consumers that still
     take `Pick<Crop, 'toWorld'>`: `roomFor`, `onscreenOf`, and
     `InsectView`'s off-screen entry points.
   - `flower-bed.ts`: `inView()` (drawn flowers whose head is on the screen,
     overhang by the head's radius allowed); `answer(flowers)` opens those
     ids (replaces `answer(sound, shows)`).
   - `instrument-input.ts`: `playTheFlowers` deleted.
   - The fade decision: `view.ts` `fade`/`FADE_FROM` retired, `behindHills`
     (ahead > `D_SEE`); `bed-place.ts` `BedPlace` loses `alpha`, gains
     `behind`; `depthOf` draws a behind-the-hills part at
     −4.5 + row·1e-4 (between far −5 and near −4 hills of
     `paint-backdrop.ts`'s `DEPTHS`), parts keeping their order;
     `standAt` no longer sets alpha. Tests updated.

## Left

- `/preview` frames (`walk-opening/turned/in.png`) — not taken (context).
- Step 2, the insect adapter — not started (see report).
- `pan-input.ts` not deleted: `mushroom-room.ts` and `visit-play.ts` (not
  this package's) still import its `Crop` type; `insect-view.ts` and
  `perch-sight.ts` too until step 2.

## Decided

- The bob is scaled by the walk's pace over cruise (`gaitOf`, from the
  distance walked between frames), so it is 0 at rest wherever the walk
  stopped, as the spec's "zero at rest" needs; the bare formula is not.
- Behind-the-hills depth duplicates the −5/−4 numbers of
  `paint-backdrop.ts`'s private `DEPTHS`: if P2c renumbers them, `BEHIND_HILLS`
  in `bed-place.ts` moves with them (or `DEPTHS` gets exported).

## Known interim breakage

- The grass (seam blades and tufts, `tufts.ts`/`grass.ts`) is still drawn
  in world px and no longer rides `scrollX`, so it stands shifted left by
  the opening crop's left (tablet landscape 492 px) and does not turn or
  walk; its taps match its drawing. P1 step 2 (tufts and seam grass by
  view) fixes it.
- Insects fly in layout px with `scrollX` 0, so they are off by the same
  shift until step 2's adapter.
