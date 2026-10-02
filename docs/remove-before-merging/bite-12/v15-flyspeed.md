# v15-flyspeed — a leg off a cap timed off its drawn length

Step 1 is part done: the cause is found and measured, and a test is drafted
(`v15-flyspeed-test.patch`). The fix is designed but not built. I stopped at
the subagent context ceiling.

## The cause (measured, `v15-flyspeed-probe.ts.txt`)

The suspected cause is close, but it is not "a cap grown later". **Every
`Place` that `sightFrom` gives is in the opening layout's frame.** The caps',
flowers' and air spots' `x, y` come from `perchSight`. The away spots come
from `placeOfAloft`, which uses `gathered` and so measures about the opening
eye. Only `fromEye` follows the eye. `apartOf` (layout distance × `fromEye`
/ `CLUMP_DISTANCE`) is the drawn length only at the opening eye. Once the eye
walks or turns, the layout stops being a similarity of the screen.

Drawn ÷ timed, cap → away right, tabL, a forest grown anywhere (seed 3; the
cap's `fromEye` corrected as `sightFrom` corrects it):

| eye (x, y, heading) | drawn ÷ timed |
| ------------------- | ------------- |
| 0, 0, 0 (opening)   | 0.87–0.96     |
| 0, 0, −0.6          | 0.95–1.12     |
| 0, 0, 0.6           | 0.74–0.90     |
| 0, 3, 0 (walked)    | **1.25–1.50** |
| 1.5, 2, 0.3         | 1.08–1.26     |
| 0, 0, 1.6 (turned)  | 0.28–0.49     |

At the opening eye, caps grown later measure the same as the clump's. So
fly-22 was set off from an eye that had walked; the veer play walks into a
hover and then turns back to heading 0 without walking back. The note's "eye
at the opening spot" is probably a misread. phoneP's fly-25 "while the eye
walks" points the same way. A deeper walk gives more than 1.5×, so 2.2× is
in reach.

## The fix, designed, not built

Put every place `sightFrom` gives, and `onscreenOf`, in **the eye's frame**:
`framedOf(view, view.eye.heading, aloft)`, with `x, y` in sizes and
`fromEye = max(V_NEAR, forward)`. At the opening eye this frame is the
layout, so `perchSight` does not change. A leg's own frame (`centreOf`) is
the eye's heading whenever its clamp does not bite, so every leg drawn on
screen would be timed exactly.

1. `plane-place.ts` `placeOfAloft`: frame at the eye's heading, with the
   azimuth off the heading clamped to `±FRAME_MARGIN`. A perch farther round
   then lands off screen, at the frame's edge, rather than at `tan`'s blow-up.
   Work `y` out from the clamped forward. It is never `undefined`.
2. `Perches.see`: keep each non-away place as an `Aloft`
   (`aloftOfLayout(camera, place × unit, footRows(stand).get(name) ??
clumpRow)`, the inverse of what `perchSight` lays out). `sightFrom` then
   re-places each one with `placeOfAloft(view, …)`, and no longer needs
   beds or `perchAloft`, which it uses only for `fromEye` and only at the
   foot.
3. `onscreenOf`: in the eye's frame, `left/right = (middleOf ∓ focal ·
tan(pinhole.x / focal)) / unit` at every eye. That is the screen's linear
   azimuth through the frame's `tan`. The world-strip clip and the
   `rowRuns` columns go. It is `undefined` only without a view.
   `perch-sight.test.ts` § onscreenOf's first test changes with it ("a
   turned stretch turned, nothing facing away" stops holding). Facing away,
   a release then takes `shownOf`'s path and flies out by the side, timed
   with `outFirst`. That is a change in how releases looking back are timed.
4. Run `perches.test.ts`, `perch-sight.test.ts`, `insect-away.test.ts`,
   `fliers.test.ts` (alone, ~6 min), and the scripts' `veer-away.ts`
   (`onscreenOf` caller).

## The test patch: caveats

`v15-flyspeed-test.patch` adds `ui/scene/perches.test.ts`: every cap in view,
cap → away right, drawn ÷ timed in [0.85, 1.15] from 4 walked/turned eyes, on
tablet and phone. At HEAD it fails, but **for a weaker reason**: with no beds,
`sightFrom` skips its `fromEye` correction, so the walked eyes pass and only
heading 0.6 fails. Once step 2 drops the beds dependency, it tests what the
scene does. Before that, it should construct real `fromEye` (or assert
against the probe's numbers). On phone, only 10 legs are in view: lower the
`legs > 10` floor or add eyes.

## Left

- Build the fix above, finish the test, run the checks, commit.
- Step 2 (the tabL veer play run and frames) has not been run.
