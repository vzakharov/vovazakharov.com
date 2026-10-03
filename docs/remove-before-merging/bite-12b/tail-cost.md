# tail-cost — hand-over note

Two frame-cost leads from `review-handling.md` (C2, A2b), traced on tabL.

## Readout

`__probe.costs()` (`scripts/lib/mushroom-probe.ts`, schema `Costs`): the
frames updated since the last call, the ms summed of the update, the render
(`game.scene.render`) and the update's parts (`walk`, `see`, `sow`,
`dispatch`, `sightNow`, `perches.sightFrom`, each bed's `follow`/`update`),
and counts of what the scene holds (objects, visible, insects, flowers,
mushrooms, standing tufts, mottles, perches placed, air spots, planted).

The measurement itself was a scratch block in `play-meadow.ts` (not
committed): 40 drawn frames (`step(1)`) and 20 looks (`step(30)`) at the
opening, before `playFollow`, after it, 60 s later, after a second 20 s `↑`
walk and 90 s after that.

## Lead 1 — frames after a long walk: not reproduced, nothing grows

tabL, two runs (wait headless as committed; wait drawn as before C2):

| moment                               | drawn median (ms) | update (ms/frame) | visible / objects |
| ------------------------------------ | ----------------- | ----------------- | ----------------- |
| opening                              | 7.7–7.8           | 0.95              | 50 / 86           |
| before follow (10 insects on screen) | 16.3–18.5         | 1.8–2.2           | 77–85 / 119–123   |
| after follow (31.8 units walked)     | 6.8–11.5          | 2.2–2.7           | 45–46 / 124       |
| +60 s                                | 6.1–7.1           | 1.9               | 46 / 124          |
| after a 2nd 20 s walk                | 5.2–8.1           | 1.8               | 42 / 124          |
| +90 s                                | 7.8–11.6          | 2.3               | 48 / 124          |

Whole meadow play: 10.2 ms median / 517 frames with the wait headless,
10.5 ms / 630 frames with it drawn. Every count holds flat after the walk
(objects 124, standing tufts 88–108, mottles 243, perches placed 651–672,
air 647–654); no bed's update grows. The drawn frame is the render, and it
tracks what is visible — insects on screen — not distance or time. C2's
27.4 ms (against a ~17 ms baseline, itself 1.7× today's) reads as a loaded
machine, not the game.

## Lead 2 — the perches' `see` on a sow frame: `roomFor`, now judged once a foot

A sow sees afresh because a planting changes what the perches are (a new
flower is one) and where a bee may plant next (`Sight.room`). Profiled in
Node on a forest stand (12 mushrooms, 34 flowers, 20 bee plantings, a
scratch script under `tmp/`): `Perches.see` 7.5 ms, of which `perchSight`
5.8 and of that `roomFor` 5.55 — every flower's ring slots tried, each slot's
12 sightings (`sightingsAt`) built and tested against every mushroom's
outlines (`flowerInSight`). The rest of `see` (~1.7 ms) walked the air's
~650 places to skip them.

What a slot's sight reads is the layout, the covers and the foot alone, and
the ring feet a sow re-tries are the same floats every time, so
`sightAt(layout, covers, foot)` (`flower-sight.ts`) judges a foot once per
layout and covers (`perLayout` → `WeakMap` by covers; a new anchor brings a
new layout and its covers, so the memo goes with them). `Perches.see` walks
the beds' rows (`footRows`) instead of every place. Exact: no answer
changes. Node, warm: `see` 7.5 → 2.8 ms at the opening anchor, 3.35 → 1.2 ms
at a walked one; `roomFor` 5.55 → 0.9 ms. `fliers.test.ts` 93 s.
