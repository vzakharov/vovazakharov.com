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

- Finding 2: `walkAndTurn` (`mushroom-probe.ts`): `→` held ¾ s, then `↑`
  held ½ s, each left to rest (tabL: 0.559 rad, 0.80 units). After it, each
  play taps what was drawn: `play-tufts` the nearest tuft drawn (opens the
  picker), `play-keys` the nearest flower's head (sounds it, `tappedAt`),
  `play-hold` a press held on the nearest flower's head (opens the picker
  on it). Shots `tuft-6-walked`, `keys-walked-tap`, `p4-walked-held`.
  - Found by the play, a harness bug, not the game's: `__probe.flower()`
    kept a head only by its x on screen, so after the walk it picked a
    flower whose head stood below the screen's foot (y 828 of 820) and the
    tap fell off the screen. It now keeps only heads on screen both ways;
    this reaches `play-meadow`'s flower tap and `play-hold`'s other presses
    too, which pass.
  - `play-hold`'s `Flower` schema was a copy of `mushroom-probe`'s; it
    imports that one.

## Left

Nothing.
