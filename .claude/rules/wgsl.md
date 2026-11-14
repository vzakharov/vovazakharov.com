---
description: When a number in a shader takes a name, and where the name lives
paths:
  - '**/*.wgsl'
---

# Numbers in WGSL

**A number takes a name when changing it means changing something else too.**
Ask that of each literal; "nothing" leaves it a literal. No checker can ask it,
so it is a review call:

- **Derived** — one quantity from another: `HOUR_TICKS = TICK_RATE * 3600u`, not
  `43200u` beside `12.0`, which goes stale the day the rate changes.
- **The same quantity in two places** — one name. Two values that merely
  coincide stay apart: one name over both turns an edit to either into a bug in
  the other.
- **A value TypeScript holds too** — a TS piece exporting it, imported from the
  `.wgsl`, never a literal copy. The theme's air is `AIR`, which `floorSource`
  declares in every floor's shader.
- **Mathematics WGSL lacks** — the kit's (`kit/lib/math.wgsl`: `PI`).

A threshold, scale or weight tuned by eye stays a literal beside the code it
shapes: a name for `0.3` reads worse than `0.3`. A hash salt stays a literal
too, being arbitrary by design.

**A name lives with the code it belongs to**: a module constant in the `.wgsl`
that uses it, exported by import where another needs it (`HEX_ROW` in
`kit/lib/honeycomb.wgsl`). Module constants share one namespace once a floor is
linked, so a name is specific enough not to collide.
