# Bite 11 — package "play" hand-over

## Done

- Step 1: the probe speaks screen. `mushroom-probe.ts` converts every ground
  point it returns through `scene.crop.toScreen` (and `topAt`'s finger back
  through `toWorld` for `insects.reached`); exposes `__probe.toScreen`,
  `toWorld` and `crop()`; `flower()` picks only flowers the crop shows. The
  page-side strings in `play-buzzers.ts`, `play-tufts.ts` and
  `flier-watch.ts` (on-screen test → `crop.shows`) go through the same.
- `play-mushrooms.ts`: every touch carries the frames' clock as its CDP
  `timestamp` (the crop times velocity and glide by the event's stamp, and
  the stepped loop's clock is not the page's); `drag`, `press` (a key) and
  `turn` (swap width and height, then wait for the `ResizeObserver` refit).
- `lib/play-pan.ts`, a fresh meadow before the bees': `→`/`←` step 0.4 of a
  screen, walk to the right end (frame `pan-right-end`), a drag over a cap
  away from the end taps nothing and moves nothing, the same at the left end
  (`pan-left-end`), back to the middle, a drag from bare ground (no object,
  no tuft) moves the crop exactly the travel past the slop and glides on,
  tapping nothing (`pan-dragged`); a 6 px press on a cap selects it and
  leaves the crop; the turn keeps every mushroom's ground x and re-crops
  round the centre's ground point (`pan-turned`).

- Steps 2–3 (27d9edf, 60d9b1f): the resting-insect tap waits for one the
  crop shows (`__probe.insects()` carries `inSight`); the tufts tried are the
  ones on screen; the end drags also cross a flower; the middle drag takes at
  most 0.6 of the crop's room (phoneL has ~395 px of it); the wait for a
  butterfly on the one selected cap (`play-insects.ts`) looks 3× as long.
- **Green on all five screens**, each run alone (`--screens <one>`, ~8.5 min
  each, over the tool's limit all together) on a probe build of b187dc4 plus
  the other packages' tree at the time.
- Frames in `docs/remove-before-merging/frames/bite-11/`: tabL dragged,
  left end, right end; phoneP dragged, and turned sideways.

## Left

- Nothing in the package. The whole five-screen run takes ~42 min, so it is
  run a screen at a time.
- Seen, not this package's: on phoneP upright the far hills' parting under
  the sun reads as a flat-topped cliff at the sun's left (`pan-dragged`).

## Decided

- The drag checks start on bare ground with no tuft under it: a press acts
  on what it lands on (a tuft opens the flower picker, bare ground
  deselects), so only there does "taps nothing" test the drag itself. The
  finger only crosses things in the world at the world's ends (1:1 follow
  keeps the same ground under it), hence the two end drags.
