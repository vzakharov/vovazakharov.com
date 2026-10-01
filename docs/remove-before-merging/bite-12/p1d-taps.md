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

## Left

- The orchestrator's call above, then rerun `mushroom-patch`,
  `meadow-rules`, `tufts`, `layout` (their `LEAST_HEAD_SHARE` comment
  names crops still).
- `fliers.test.ts` once.
- Rename `openingCrop` → `openingView` with the scripts' owner.
