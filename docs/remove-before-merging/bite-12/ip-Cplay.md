# ip-Cplay — package C's play checks: the play written, not yet run

Stopped at the context ceiling before the first play run. **No check has a
result yet.** No frames were taken and nothing in `src/` was looked at in a
browser.

## What exists

`ip-Cplay.patch` (`git apply` from the repo root) adds:

- `scripts/lib/veer-watch.ts`: `VEER`, a page-side recorder that wraps
  `scene.insects.update`, so every stepped frame is recorded, drawn or not.
  For each insect it records the leg, `visible`, the drawn x/y, the zoom
  (`container.scaleX`), the drawn span, `flown`, the distance of `shown.drawn`
  from the eye, the `out` flag, and the seat as `perchAt` gives it (host
  `stands.zoom`/`distance`/`drawn`, seat drawn x/y). It also has helpers that
  read the record: `sitting`, `fading` (inside `SEAT_FADE` of a seat end),
  `byLeg`, `byInsect`, `hiddenRuns`, `steps` and `most`.
- `scripts/lib/play-veer.ts`: `playVeer`, the `veer` entry in `PLAYS`. On a
  fresh meadow it does the following, in order:
  1. Grows four mushrooms and releases 4 butterflies, 2 flies and 2 bees
     facing the clump, then logs every sitter's zoom, its host's zoom and
     the ratio of the two (check 2).
  2. Holds `→` for π/`TURN_CRUISE` and logs blinks of 8 frames or fewer,
     counting those within 2 of `D_SEE` (check 5).
  3. Snaps the heading to exactly π by setting `scene.eye.walk.pan.motion`
     to rest at `π·arc`. It then releases one insect of each kind and
     expects each to be drawn on ≥95% of its flight frames (frames flying
     out of view are left out) and seated, drawn and on screen on every
     frame after landing (check 1). It also expects each sitter's
     zoom·distance/CD/bend to be at least 0.97 (check 2, looking back).
  4. Faces heading 0, waits for an insect hovering in the air (releasing
     flies every 4 looks), faces it with `azimuthOf`, and holds `↑` for 160
     frames. Over the walk it expects the zoom to stay ≤ (CD/V_NEAR)·bend·1.03
     (≤2.45 during a fade) and the span ≤ width/2 (check 3).
  5. Holds `←` back round and logs blinks again.
  6. Over the whole record, it checks the most zoom against the same bounds
     and logs each fly leg's pace in butterfly sizes/s as drawn (with its
     fastest frame and how much was flown a fifth of the way in) and every
     one-frame step over width/20 px (check 4).

  Frames: `veer-opening-fly-in`, `veer-opening-perched`, `veer-turning`,
  `veer-back-<kind>-in` and `-landed`, `veer-back-perched`,
  `veer-walk-in-{1,3,5,7}`.

## State

- Landed as source (the patch is removed): `scripts/lib/veer-watch.ts` (the
  recorder), `scripts/lib/play-veer.ts` (the play, 212 lines) and
  `scripts/lib/veer-report.ts` (the checks and logged measures read off the
  record, including the looking-back size check `satBack`). Lint, typecheck,
  prettier and `pnpm type-overlap` clean (`Hidden.start` is `first`, which
  `pan.ts`'s `Gliding` also declared).
- Not run yet: its page-side field names (`scene.insects.view()`,
  `scene.eye.walk`, `shown.out`, `seat.on.stands`) are unverified.

## Left

1. Build the probe:
   `flock /home/user/vovazakharov.com/tmp/site.lock env NEXT_PUBLIC_MUSHROOM_PROBE=1 pnpm build:vova`.
   Then play one screen per call:
   `flock … pnpm play:mushrooms --no-build --screens tabL --plays veer`,
   then `phoneP`.
2. Read the notes, pick frames into
   `docs/remove-before-merging/frames/bite-12/insect-plane/`, and report.
