# Package ux2 — the open map's ✕ without its disc

From the operator, after ux (2aa143d2): «так все равно не очень, дело в самом
кружке. попробовать без него б» — the disc itself was the problem.

## Done

- **A bare cross.** `drawCloseButton` (`hud.ts`) draws no disc: an indigo
  (`inkCool`) cross of square bars, a touch bigger and bolder than before
  (arm 0.42 r, bar 0.15 r), rimmed in the disc's cream (`PALETTE.hud`) as wide
  as a disc's ink line (`discInk`, the `max(2, r · 0.1)` every button's ring
  takes), with the disc's own drop shadow under the rim. So it reads on the
  map's grass in the same pale-on-dark/ink-on-pale way as the HUD, without a
  disc. The tap target is unchanged: `placeButton` still sets the hit circle
  from `layout.map.r`.
- **The disc folds away, and back.** The map button's disc is a face of its
  own (`Controls.mapDisc`, made before `map` so it stands under it, its input
  disabled); `drawMapButton` draws the picture alone. Its scale and alpha run
  on `unfolded(!mapOpen, t − mapFlippedAt)`, the same curve the sheet unfolds
  on (`map-view.ts`, now shared by `MapView.update`), so the disc sinks as
  the sheet comes out and emerges as it folds back. It copies the picture's
  `pressedAt`, so it presses in with it. Shut and at rest, the button is the
  same disc and picture as before.
- **The sheet back at 18 px** (`SHEET_INSET = BUTTON_INSET`). The 9 px inset
  existed to get the disc clear of the frame; with only the cross there, it
  stands 14 px inside the edge at 18. Rendered both: at 18 the sheet lines up
  with every button's edge and unfolds to the line the shut disc stood on,
  and the cross reads as the sheet's close box in its corner; at 9 the cross
  floats 23 px in and the sheet crowds the screen edge for 18 px more map.
- Frames: `docs/remove-before-merging/frames/bite-17/map-close-bare-{tabL,phoneP}.png`
  (the `map-close-{before,after}-*` frames are superseded and removed).
  `pnpm play:mushrooms --screens tabL,phoneP --plays map` passes.

## Left

Nothing. Mid-unfold (the play's `m1-unfolding`), the cross's cream rim and
shadow show faintly on the still-large disc; it lasts a few frames.
