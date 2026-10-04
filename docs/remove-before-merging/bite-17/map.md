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
- Step 2 (the wash alone left the map's grass a bright mid green, ~#5e8a55,
  against the dusk meadow's dark blue-green, since the meadow's ground is
  also baked toward `DUSK`'s ground tones): a `shade` layer, the sheet in
  `DUSK.groundDeep`, lies over the paper, ground and wedge and under the
  things, at `DUSK_SHADE (0.56) × duskness`. With the wash over it the map's
  grass reads ~#415b53, the meadow's ground ~#354852–#3d5a4a; the red house
  still pops, as the things are under the wash alone. Day is unchanged
  (both layers at alpha 0).
- Over the wash, on a `top` layer, stand what glows or must read first: the
  compass (its moon at dusk, its sun by day — the glyphs untouched) and the
  child's dot and arrow, the "you are here" mark.
- `drawView` / `drawChild` moved from `map-view.ts` to `map-child.ts`
  unchanged, to keep `map-view.ts` under ~450 lines (it was 449).
- `play-dusk.ts`: at full dusk the map is opened, shot as `dusk-map`, and
  shut. Frame: `docs/remove-before-merging/frames/bite-17/map-dusk-tabL.png`.

## Decided

- Overlays rather than toned colours: the map's ground is drawn once as it
  opens, and toning its grass, mottles and tufts by `duskness` would mean
  redrawing it every frame of a turn or drawing it twice. Two fills with one
  alpha each follow the turn for free. The shade is coloured with the dusk's
  own deep ground, so the map takes on the dusk meadow's hue as well as its
  value.
- Mushrooms, houses and flowers sit under the wash, as in the meadow; in the
  frame the red caps and houses still read clearly. The windows on the map
  do not glow (the meadow's `paintGlow` clears its graphics and works per
  house; on the map's tiny houses the gain is small). A successor wanting
  them lit paints the panes again on `top` in `PALETTE.windowLit`.
