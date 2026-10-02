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

## Left

- Step 2 — the door puff at the drawn size (`spores.ts`' `Puffing`).
