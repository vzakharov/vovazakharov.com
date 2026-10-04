# Package ux — off the bite, from the operator

Three items from `bite-17.md` § "Left" → "Off the bite, from the operator".

## Done

- **The open map's ✕.** The earlier fix (710f170a) changed only the cross's
  drawing (`drawCloseButton`); the button's placement never moved, and the
  sheet's edge ran at `BUTTON_INSET`, the same line as the button's own edge,
  so the button sat tangent to the frame and over its rounded corner. The
  sheet now keeps `SHEET_INSET = BUTTON_INSET / 2` from the screen
  (`map-view.ts`), so the button, which stays put, sits fully inside the
  frame, 9 px clear of both edges and of the corner's arc — as far inside the
  sheet as the sheet is inside the screen. The map gains 18 px each way.
  Frames: `docs/remove-before-merging/frames/bite-17/map-close-{before,after}-{tabL,phoneP}.png`.
- **`M` presses the map button.** `keyboard.ts` binds `KeyM` to
  `{ kind: 'map' }` (it was no note, drum or move key); `instrument-input.ts`
  calls `pressMap` — the map button's own handler (`actions.map`, passed as
  `fold`), the one Escape calls — open or shut, before the map-open wait.
  `keyboard.test.ts` pins the binding; `play-map` presses `m` twice after the
  Escapes and checks it opens, then shuts.
- **`pnpm type-overlap`, Rain.** `Started = { startedAt }` in
  `model/motion.ts` (both modules import it); `Rain` and `Dusk` intersect it.

- **`pnpm type-overlap`, HaloLayer.** Still there once a1 landed (41188392):
  `Ramped = { from }` in `model/motion.ts`; `Dusk` and `HaloLayer` intersect
  it, a1's `backdrop-tones.ts` otherwise as it landed. The gate is clean.

## Left

Nothing.
