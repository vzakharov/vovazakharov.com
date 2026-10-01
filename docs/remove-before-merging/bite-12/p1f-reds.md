# p1f-reds — hand-over note

Package: the plan's `## Rest of the bite` item 1, "Built (d396ca72…)" — the
clump's patch scaled, then the two reds left since 86503fb. Starting point
`p1e-patch.md`.

## Done

- 2758d677 — the clump's patch scales like a grown one: 12 px at the
  tablet's unit, × unit ÷ tablet unit, between 8 and 12. `mushroom-patch`
  33/33.
- The patch scales with depth too (`patchFloor`): 16 (grown) or 12 (clump)
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

Measured, sideways, 40 visits, with the floor at:

| floor | full                        | behind the clump | plane `y` max |
| ----- | --------------------------- | ---------------- | ------------- |
| 8     | 40/40 (197/200 in `layout`) | ~20%             | 10.3          |
| 6     | 39/40                       | 232/397 (58%)    | 13.1          |
| 5     | 39/40                       | 260/397 (65%)    | 13.2          |
| 4     | 39/40                       | 259/397          | 13.2          |

(These floor rows were measured with the patch growing past the screen's
size for near rows, since dropped; rerun before picking.)

## Tests (at the depth-scaled patch)

`mushroom-patch` 33/33, `mushroom-room` 7/7, `meadow-rules` 12/12,
`mushroom-tap` 15/15, `layout` 66/67 (sideways 197/200 reach 12, as before),
`clump-layout` 6/7 (sideways).
