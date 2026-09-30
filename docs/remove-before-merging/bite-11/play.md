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

## Left

- See the report / next section once the per-screen runs are green.

## Decided

- The drag checks start on bare ground with no tuft under it: a press acts
  on what it lands on (a tuft opens the flower picker, bare ground
  deselects), so only there does "taps nothing" test the drag itself. The
  finger only crosses things in the world at the world's ends (1:1 follow
  keeps the same ground under it), hence the two end drags.
