# p1d-taps — hand-over note

Package: bite 12 P1 step 2 (from `p1c-grass-taps.md`) — drawn-only taps,
`+` judged in the current view — plus `visit-play.ts` and `mushroom-room.ts`
off `Crop`. Paths under `src/pages/mushrooms/ui/scene/`.

## Done (one commit, this note's)

- `fingerPad`, `FINGER_ACROSS`, `HEAD_SHORTFALL` gone (`mushroom-tap.ts`).
  `tappedMushroom` is the front-most whose drawn parts hold the finger;
  `containsMushroom` is `drawnHolds`; `patchTarget` and `takerAt`
  (`mushroom-patch.ts`) lose the pad; comments in `tufts.ts` and
  `meadow-camera.ts` (`ZOOM_FLOOR`) follow.
- `+` in the view: `roomFor(stand, seed, view?: View)`, `fitsView`,
  `keptRoom` keyed on the eye. The meadow's rules stay at the opening eye;
  the screen's are judged as the view projects (`ofLayout` at the foot
  row): the cap box's corners on screen `EDGE_MARGIN` inside its sides,
  foot not culled and not behind the hills; controls and the sun's rays
  (screen circles, no conversion) off the drawn outlines. Candidates are
  drawn over `layoutShown(view)` (new in `eye-crop.ts`, replacing
  `eyeCrop`/`Crosswise`), the whole frame where an edge meets no row ahead.
- `pan-input.ts` deleted (nothing imported it).
- `meadow-scene.ts`: passes `this.eye.view()`; `crop` and `camera` fields
  gone (−3 lines).
- `visit-play.ts`: `stillCrop` gone; `openingCrop(layout)` now returns the
  opening `View` (name kept so `scripts/sweep-mushrooms.ts` still
  type-checks); `opened`'s last parameter is `viewIn`.
- Tests: `mushroom-tap.test.ts` (drawn-only at every size; a grown meadow at
  the opening eye and one stepped 3 in, hit areas scaled by `zoom`) and
  `mushroom-room.test.ts` (opening, turned 0.3, stepped 1; nothing facing
  away) pass. `meadow-rules.test.ts` loses the "a finger wide" rule and
  reads the opening view; `mushroom-patch.test.ts` grows on the opening
  view, turned 0.3 and stepped 3 instead of pan ends — **neither run to the
  end yet**, nor `tufts`, `layout`.

## Blocking: phones grow no forest

Without the pad, `keepsPatches`' `GROWN_PATCH` (16 px) can no longer be
kept by a phone's small far caps, so growth stops there. Mushrooms after
growing to `MUSHROOM_SLOTS` over 10 visits, anywhere in the world:

| screen              | base (pads) | now, 16 | 12  | 10  | 8   |
| ------------------- | ----------- | ------- | --- | --- | --- |
| tablet, desktop     | 120         | 120     |     |     |     |
| phone               | 120         | 41      | 120 | 120 | 120 |
| phone held sideways | 120         | 20      | 20  | 26  | 120 |
| small phone         | 120         | 20      | 61  | 120 | 120 |

(20 = the clump alone.) The plan's two lines — `fingerPad` goes,
`keepsPatches` stays at the opening eye — cannot both hold on phones. The
options: `GROWN_PATCH` 8 everywhere; a floor scaled to the camera's unit
(not measured); or accept no growth on phones. Not picked here.

### The rest of the suite, run after the commit (at 86503fb)

- Pass: `tufts` 46, `meadow-rules` 12, `eye-crop` 7, `ground-seam` 12,
  `mushroom-room` 7.
- `layout.test.ts` fails 6, all the phone growth shares: phone 13/200 visits
  reach 6 on the opening view and 3/200 reach 12; phone held sideways and
  small phone 0.
- `mushroom-patch.test.ts` fails 3, all on phone held sideways:
  - visit 237573 with 2 grown: the opening clump keeps no `CLUMP_PATCH`
    (12 px) once its pad is gone;
  - visit 9819563, anywhere in the world;
  - visit 237573 again, stepped in.

  The other screens pass. The worst head share is 73.0%, so
  `LEAST_HEAD_SHARE` 0.72 holds.

So the clump's patch floor is caught as well, not only `GROWN_PATCH`.

## Left

- The orchestrator's call above, then rerun `mushroom-patch`,
  `meadow-rules`, `tufts`, `layout` (their `LEAST_HEAD_SHARE` comment
  names crops still).
- `fliers.test.ts` once.
- Rename `openingCrop` → `openingView` with the scripts' owner.
