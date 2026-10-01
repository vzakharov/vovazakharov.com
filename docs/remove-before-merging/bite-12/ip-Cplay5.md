# ip-Cplay5 — veer: away legs traced, walking frames out, the flower planting

## 1. Away legs: timed to one point, drawn to another (not a moving target)

`scripts/lib/veer-away.ts` (`node --import tsx scripts/lib/veer-away.ts`)
stands the opening meadow (`opened(3, …)`) at the opening eye, still, and for
every cap and flower in sight and each side compares the leg's timed length
(`apartIn` over `perchSight`'s `places`; `outWay` for a release's stretch out
of view) with the length `InsectView` draws at the insect's own size (the
framed chord from its start to the end `offAloft` / `entryAloft` give, each
cut over its zoom). The ratio scales `dashPeak` to the leg's fastest frame.

**The suspect does not hold: with the eye still the away end moves 0** frame
to frame — `offAloft` is recomputed from the view each frame, but a still view
gives the same point. What does hold is that **an away leg is timed between
points it is not drawn between**:

| leg (eye still, heading 0)                 | tabL drawn / timed | phoneP drawn / timed |
| ------------------------------------------ | ------------------ | -------------------- |
| cap → away                                 | 0.57–0.61          | 0.42–0.45            |
| flower → away, most                        | 0.53–0.89          | 0.59–1.06            |
| flower → away, flower by the world's edge  | **1.30** (fl-13 r) | **1.40–1.90**        |
| released, out of view (`outWay`)           | **1.15**           | **2.06**             |
| released, on from past the side to the air | 0.25–**1.95**      | 0.43–**1.96**        |

At ×1.9–2.1 the fly's 41.6 px curve peak draws 80–86 px and the bee's 23.5
draws 45–49 — the play's measured 86–90 / 58. The causes, each in the game:

- **Leaving**: timed to `places`' away point, past the _world strip's_ edge at
  the clump's row (`perchSight`), drawn to just past the _screen's_ edge where
  the view stands, at the start's own distance (`offAloft` in `InsectView.fly`).
  Facing the clump the screen's edge is mostly nearer (ratio < 1, slow); from
  a perch near the world's edge toward that edge, or facing away from the
  strip (heading 1.83), the screen's edge is the farther, and the leg is fast.
- **Released out of view**: `outWay` is half the shown stretch in `Places`
  units with no depth in it, where `apartIn` scales by `logMean(fromEye)`;
  drawn from the brow (`D_SEE` 13.3, zoom 0.65) to `OUT_AHEAD · D_SEE`, so the
  far half is flown at a small zoom and its own-size length grows.
- **On from past the side**: timed from `shownOf`'s screen-edge away point at
  the clump's row, drawn from the `out` point at half the brow's distance.

No fix made: the cause is not the one the brief scoped a fix to (fixing the
away point on the plane at take-off changes nothing with the eye still), and
the cure — timing an away leg on the plane points it is drawn between — puts
the view's away points into `places`, the model's timing table, which spans
`flight-in.ts`, `flight-timing.ts`, `perch-sight.ts` and `insect-away.ts`.
That is a decision for the plan.
