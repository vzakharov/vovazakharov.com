# p1f-reds — hand-over note

Package: the plan's `## Rest of the bite` item 1, "Built (d396ca72…)" — the
clump's patch scaled, then the two reds left since 86503fb. Starting point
`p1e-patch.md`.

## Done

- 2758d677 — the clump's patch scales like a grown one: 12 px at the
  tablet's unit, × unit ÷ tablet unit, between 8 and 12. `mushroom-patch`
  33/33.
- 5d6f8d88 — the patch scales with depth too (`patchFloor`): 16 (grown) or 12 (clump)
  px × min(unit, tablet unit) ÷ tablet unit × min(1, `scaleAt(z)`), floored
  at `LEAST_PATCH` 8. `keepsPatches(own, foot, around)` reads the new foot;
  `Around` carries the camera instead of one `grown` px.

## The cause of both reds

Neither is the view-judged `+`: both tests grow over the world, with no view.
It is the patch. Since 86503fb a far mushroom has no finger pad, and the
grown patch was one px figure per screen while a mushroom drawn at the back
row (`z` 3) is 0.65 the size of one at the clump's front foot. So the back
rows could not keep the patch, and forests grew only in front. p1e's "the
same with both patches at 0.1 px" missed it because the 8 px floor clamped
the 0.1.

Grown mushrooms standing behind the clump's back foot (`z` > 0.24), first 20
visits, over the world (opening view in brackets), and plane `y` max:

| screen          | 7a94a1c (pads) | HEAD before  | depth-scaled   |
| --------------- | -------------- | ------------ | -------------- |
| tablet          | 113 (125) 13.2 | 70 (77) 11.2 | 131 (127) 13.2 |
| tablet portrait | 132 (138)      | 132 (138)    | 132 (138)      |
| phone           | 144 (152) 13.2 | 67 (52) 11.1 | 129 (137) 13.2 |
| phone sideways  | 132 (136) 13.2 | 40 (47) 10.3 | 40 (47) 10.3   |
| small phone     | 162 (153) 13.2 | 59 (52) 11.0 | 120 (127) 13.0 |
| desktop         | 129 (129)      | 128 (130)    | 132 (128)      |

Phone and small phone in the opening view went from 1 of 20 forests full to
20 of 20.

`clump-layout` "wider cap farther in" (pairs): tablet 318 at 7a94a1c, 589
before, 303 now; tablet portrait 297, phone 317, small phone 342, desktop
297 — all pass. Phone held sideways 684 of 2206 (31%): red.

## Left: the phone held sideways, which the 8 px floor holds

On the sideways phone the scaled patch is 7.6 px at the front and 4.9 at the
back row, so the floor of 8 sets it everywhere and the back rows stay shut.
The three `layout` visits that stop (4038693, 8710903, 12907973 at 8, 7, 5)
are a seed whose russula holds at most a 7.6 px disc even at the front row
(5.6 at `z` 1.1, 4.6 at `z` 2.7; head 46×25 px at the front): every
candidate fails its own patch, none fail another's. The refusal is the patch
rule working as written, so the test is not wrong; the floor is what the
plan named ("floored at 8 px"), so it is not picked here.

Measured on the sideways phone at 5d6f8d88 with `LEAST_PATCH` changed (the
floor is shared by every screen, but only the sideways phone's scaled patch
falls below 8 — small phone's back row is 10.1 × 0.65 ≈ 6.6, so it would
loosen there too):

| floor | full (40 visits) | behind the clump (of 400) | plane `y` max | `layout` reach 12 | `clump-layout` pairs |
| ----- | ---------------- | ------------------------- | ------------- | ----------------- | -------------------- |
| 8     | 40/40            | ~80 (40 of 200)           | 10.3          | 197/200 red       | 684/2206 red         |
| 6     | 40/40            | 227                       | 13.1          | 200/200           | 358/2250             |
| 5     | 40/40            | 258                       | 13.2          | 200/200           | 330/2250             |

The pads' baseline (7a94a1c) was 132 of 200 behind (66%), so 5 restores it,
6 nearly. Not run at a lower floor: `mushroom-patch` (7 min) and `fliers`.
Options for the orchestrator: (a) `LEAST_PATCH` 6 or 5 everywhere; (b) the
floor kept at 8 and the sideways phone's forest left in front, with
`layout`'s and `clump-layout`'s sideways rows relaxed — which the tests'
rule ("the meadow grows into the back rows") argues against.

## Tests (at the depth-scaled patch)

`mushroom-patch` 33/33, `mushroom-room` 7/7, `meadow-rules` 12/12,
`mushroom-tap` 15/15, `layout` 66/67 (sideways 197/200 reach 12, as before),
`clump-layout` 6/7 (sideways).
