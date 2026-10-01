# ip-Cplay — package C's play checks: landed, played on tabL

Played on tabL (passes). phoneP not yet played.

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

- Landed as source: `scripts/lib/veer-watch.ts` (the recorder),
  `scripts/lib/play-veer.ts` (the play, 212 lines) and
  `scripts/lib/veer-report.ts` (the checks and logged measures, including the
  looking-back size check `satBack`). Lint, typecheck, prettier and
  `pnpm type-overlap` clean (`Hidden.start` is `first`, which `pan.ts`'s
  `Gliding` also declared).
- Field names all resolved on the first run; none needed a rename.
- `shown.out` holds while a release with no open perch in view flies out by
  the side and clears once it is past (`insect-shown.ts`), so check 1 counts
  every flight frame after the last `out` as off screen by design, and the
  landed-on-screen expectation applies only to a leg that never had `out`.

## tabL results

- Check 2, opening: 6 sitters at 0.71–0.93 of their host's zoom (fly 0.71 at
  d 12.93; butterfly 0.74–0.76 at d 12.2; bee 0.83 at d 10.41, 0.93 at d 9.39).
  Logged.
- Check 5: 0 blinks on either turn.
- Check 1: looking back from the clump (heading π) no perch is in view, so all
  three releases left by the side, as `entryAloft` designs: drawn on 381/383,
  88/88 and 167/168 of their in-view frames (butterfly, fly, bee), then landed
  off screen. Passes, but **the landed-on-screen half and `satBack` are
  vacuous here** (0 sitters looking back): the play has no perch in view
  behind the eye. Frames: `tabL-veer-back-*`.
- Check 3: walking into fly-12 hovering, nearest 5.40, zoom ≤ 1.60× at x 590
  (bound 1.78), widest span 68 px of 1180. Pass. Frames:
  `tabL-veer-walk-into-hover-{1,5,7}`.
- Over the run: most zoom by a perch's fade 1.42× (≤ 2.45), in flight 1.60×,
  sitting 1.55×. Pass.
- Check 4, logged: 34 fly legs flown whole, cruise 3.3–5.4 sizes/s; one
  cap→away 6.78 s leg had a 131.1 sizes/s frame and 0.00 flown a fifth in.
  17 one-frame steps over 59 px (butterfly 4, fly 11, bee 2), worst 98 px, fly
  cap→cap flown 0.55 d 5.95.

## Left

1. Play phoneP:
   `flock /home/user/vovazakharov.com/tmp/site.lock pnpm play:mushrooms --no-build --screens phoneP --plays veer`
   (after the probe build,
   `flock … env NEXT_PUBLIC_MUSHROOM_PROBE=1 pnpm build:vova`).
2. Decide whether check 1 needs a perch in view behind the eye (it is vacuous
   on tabL as played).
