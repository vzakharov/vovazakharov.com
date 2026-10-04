# Bite 17 — package `map`: the map at dusk

The operator: «карта ночью тоже должна выглядеть приглушённо».

## Done

- The open map dims under the meadow's own dusk wash: a third layer in the
  map's container (`veil`, the sheet's rounded rect in `PALETTE.duskWash`)
  lies over the paper, the ground, the wedge and the things, its alpha
  `DUSK_WASH_DEEPEST × duskness` set every frame in `MapView.update`, so it
  fades with the turn while the map is open, and a dark page (at full dusk
  from the first frame) opens it dim. No new colour: the wash and its depth
  are the meadow's.
- Over the wash, on a `top` layer, stand what glows or must read first: the
  compass (its moon at dusk, its sun by day — the glyphs untouched) and the
  child's dot and arrow, the "you are here" mark.
- `drawView` / `drawChild` moved from `map-view.ts` to `map-child.ts`
  unchanged, to keep `map-view.ts` under ~450 lines (it was 449).
- `play-dusk.ts`: at full dusk the map is opened, shot as `dusk-map`, and
  shut. Frame: `docs/remove-before-merging/frames/bite-17/map-dusk-tabL.png`.

## Decided

- A wash over the paper rather than toned colours: one fill and one alpha per
  frame, and the map dims exactly as the meadow does.
- Mushrooms, houses and flowers sit under the wash, as in the meadow; in the
  frame the red caps and houses still read clearly. The windows on the map
  do not glow (the meadow's `paintGlow` clears its graphics and works per
  house; on the map's tiny houses the gain is small). A successor wanting
  them lit paints the panes again on `top` in `PALETTE.windowLit`.
