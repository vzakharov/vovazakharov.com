# rv-taps2 — review 5391057365, findings 3 and 2 (continues rv-taps)

Contract: `docs/plans/mushroom-game-syama/bite-12/review.md` § "taps-flowers-harness".

## Done

- Step 0: the tests reaching `tufts.ts`, `flower-sight.ts` (and the other
  modules 116f5888 touched: `flower-bed`, `planter`, `flower-cover`)
  directly or through imports, found by walking the import graph: ground,
  placement, proboscis, bed-place, clump-layout, fliers, flower-cover,
  flower-hold, flower-layout, flower-plots, flower-sight, insect-away,
  insect-drawn, insect-layout, insect-seat, insect-shown, layout,
  meadow-rules, mushroom-patch, mushroom-room, mushroom-tap, perch-sight,
  perches, repaint-queue, tufts. Each run alone: all green, nothing to fix.

- Finding 3: `playHeldDrags` (`play-taps.ts`), played from `play-walk.ts`
  after the bare drags: one drag with a mushroom selected, one with the
  flower picker open on a tuft. Each checks the drag grew nothing, planted
  nothing and selected no new mushroom; a shut picker or a dropped
  selection is allowed and noted (tabL: both are shut/dropped).
  - Decided: the selection is a mushroom grown from `+` (which selects it),
    not a cap tap — by that point of the walk the eye looks away from every
    cap. `+` grows only where the view leaves room, and the view the tufts
    stand in has none, so the grown-and-selected drag runs first and is a
    short drag down (it walks in a little), which keeps the tufts in view
    for the picker drag after it (a sideways one).

## Left

- Finding 2.
