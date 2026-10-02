# Package bed (tail) — hand-over

## Done

- **Step 1 — split `mushroom-bed.ts`** (479 → 414 lines), no behaviour
  change (`refactor(mushrooms): split the shown mushroom out of its bed`).
  New `ui/scene/mushroom-shown.ts` holds `Shown` (the type), `unplacedShown`
  (the object `show` builds before `place` shapes it; the bed still makes
  the graphics, hit area and house and passes them in) and `paintLit(shown,
heading)` (body, house and shadow in its headed light). The bed keeps a
  `heading` getter (the view's, else the opening's) for its two `paintLit`
  calls. `capTop` stays in the bed, where I4 adds `foot` and `opening` to
  the `Host` it builds.

- **Step 2 — every puff at the drawn size** (`fix(mushrooms): puff from
a house at the size its mushroom is drawn`). `Puffing` gains `Standing`
  (`stands`, whose `zoom` it is drawn at) and `spores.ts` exports
  `drawnSize` (`size · stands.zoom`); `puffFrom` reads it every frame for
  both the puff's offset and its reach. `Body` (house-view) is now
  `HazedGraphics & Lighted & Puffing & { door }` — built on `Puffing`
  rather than repeating `Splayed & Standing`, which `pnpm type-overlap`
  flags. The bed's tap passes `shown` itself (the getter wrapper is gone)
  and its growth puff and boing pitch read `drawnSize`.

## Left

Nothing in this package.

## Seen

- The door and window puffs now sit where the door or window is drawn and
  open to its drawn size: before, a mushroom zoomed near or far puffed from
  a point off its zoom and at its unzoomed reach.
