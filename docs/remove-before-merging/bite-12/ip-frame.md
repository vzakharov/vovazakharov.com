# ip-frame — hand-over note

Step 0 of `insect-plane.md` (R2.1's leg frame, R2.5's veer):
`src/pages/mushrooms/ui/scene/insect-frame.ts` and its test. Nothing draws
through it yet.

## Done

- Step 1, the frame: `Aloft`, `Framed`, `FRAME_MARGIN`, `centreOf`,
  `framedOf`, `aloftFramed`, `mixD`, `drawnAloft`.
- Step 2, the veer: see below once committed.

## Decided

- Frame x is world px about `middleOf(camera)`, not CSS px about the
  pinhole's `x`, so at the opening eye a framed point _is_ its layout point
  (the model keeps layout units). y is the pinhole's row, the same in both.
- `Framed`'s forward distance is `forward`, not the spec's `q`:
  `pnpm type-overlap` flags `q: number` against `instrument-voices.ts`'s
  `Band`.
- `view.ts`'s `placedAt` is exported, so `drawnAloft` places through it with
  `opening = CLUMP_DISTANCE` rather than repeating it; `wrapAngle` comes
  from `panorama.ts` (`ground.ts`'s `wrapped` is private and the same).
- `drawnAloft` returns `undefined` when hidden.
