# Bite 14 — after the rain

Item 14 of the plan: while it rains, insects shelter under the caps; when it
stops, spores an old mushroom shed sprout into little mushrooms that grow
over the next minutes. Two packages, each mapped by a spec
(`docs/remove-before-merging/bite-14/spec-shelter.md`,
`spec-sprouting.md`), whose recommendations are taken except where a call
below says otherwise. Paths are under `src/pages/mushrooms/`.

## Calls — shelter

1. **A shelter is a perch kind of its own**, `shelter`: a cap's id and seat
   0 or 1, left and right of the stem just under the rim, the insect drawn
   over the stem facing up. Every switch over perch kinds learns it,
   `scripts/lib/mushroom-probe.ts`'s `PERCHES` included. Chanterelles offer
   none: a funnel has no underside.
2. **The model learns of the rain from the meadow it already receives**;
   shelter edits nothing in `model/game.ts`. While `raining`, a flier is
   offered only shelter seats and the air — flowers and cap tops are
   withdrawn.
3. **Nearest is from where the insect is drawn**, deterministic, so nothing
   changes in flight while it is dry.
4. **Two seats a cap**, the existing crowding check deciding which can be
   filled together; never a huddle (fliers sit apart, standing rule).
5. **No shelter open: the insect roams the air as today.** Planting more
   mushrooms buys more shelter. Leaving over the brow is rejected — nothing
   is lost for a shower.
6. **A bug button while it rains** flies the newcomer straight to an open
   shelter on screen, or into the air if none is open.
7. **A tap on a sheltering insect** darts it to the nearest other open
   shelter, or up into the air and back; the tap goes through and wobbles
   the cap, as a tap on a perched insect does.
8. **The rain's start makes every leg set off before it due at once**, mid
   flight too, through the path that re-targets a flier whose perch is gone.
   A shower lengthened by a tap sends no second dash.
9. **A shelter pace per kind**: the butterfly about doubles and darts, under
   cover in ~2 s; the fly and the bee keep their own, already quick.
10. **When it stops they come out one by one**, each 0.3–2.5 s after the
    stop by its own seed, as the rainbow rises; while it rains a sheltering
    stay is stretched to the current `stopsAt`, which covers a lengthened
    shower.
11. **A cap shelters only where it is drawn at least as wide as a
    butterfly**, judged in `perch-sight.ts` from the drawn size — so a
    sprout still small offers no shelter of itself, with no flag shared
    between the packages. A sprout's cap top stays a perch as any cap's
    (sprouting C11).

## Calls — sprouting

12. **Old is full-grown**: every mushroom not still sprouting. The parent is
    the oldest in sight (`meadow.mushrooms` order among those on screen),
    falling back to the next oldest when the first finds no room — two
    parents at most, up to `SPROUTS` 3 sprouts a shower.
13. **Sprouts land near the parent** through `pickFoot`'s new optional
    `near: { ground, reach }`, reach ≈ one clump size tuned by the sweep;
    without `near` the stream draws exactly as today, so the sweep and the
    placement tests do not move. `roomFor` gains the matching optional
    `near`.
14. **The scene finds room, the model decides**, as `grow` and the bees'
    `Plot.room` do: a pure `shedding(meadow, now, inSight)` names when, who,
    how many and which seeds; the scene's `shedIn` finds feet with
    `roomFor`; the tick carries them as an optional `shed`; the reducer
    re-checks them as `grow` does and records the shower as shed even with
    no sprout, so the scene searches once. A tick with nothing to shed
    returns the same `Meadow`.
15. **A shed is due from `stopsAt` for `SHED_WINDOW_MS` 12 s**, about the
    rainbow's span, and only while an old mushroom is in sight; a turn back
    within the window brings it then.
16. **A sprout is an ordinary mushroom with `sprout: { at, parent }`**, its
    size a pure clock function: hidden for `SPORE_FALL_MS` 0.7 s while its
    spores fall, then 0.4 rising to full over `SPROUT_MS` 120 s, eased out
    (≈0.58 at 20 s). Growth never enters the model.
17. **The parent's species**; seeds salted from the parent's seed.
18. **Full caps mean fewer sprouts, never a refusal**; with none, no puff
    either — a puff with nothing after it teaches a false cause.
19. **The child sees the cause**: the parent puffs from its crown, a few
    spore dots fall along an arc to each sprout's foot
    (`ui/scene/spore-drift.ts`, `PALETTE.spore`), and the sprout pops up at
    0.4 as they land, with the grow sound.
20. **A sprout is a mushroom in every way**: tapped, furnished, sunk, perched
    on. A shed selects nothing and touches no picker. A second shower does
    not pause growth, and a sprout still growing is never a parent.
21. **A sprout is judged at its start size too** (`partsInView`,
    `keepsPatches` at 0.4, for `near` searches only), so none is born hidden
    behind a stem. If the stop frame's cost rules it out, it drops back to
    accepting the risk, in the report. **Dropped back** (P2, 3aad2f45):
    judged at 0.4 too, a shed found a foot in 0 of 20 tabL visits at ~3.5 s
    a shed, against 20 of 20 at ~30 ms without — so a sprout may come up
    half behind a stem until it grows; a hand check in `to-check.md`.

## Packages and waves

- **Wave 1, in parallel: S1** shelter's model (spec-shelter § 5 step 1) and
  **P1** sprouting's model (spec-sprouting § 4 step 1). Disjoint:
  `model/game.ts` and `model/placement.ts` are P's, the flier modules and
  `model/shelter.ts` S's; S1 adds `shelter` to the probe's `PERCHES` only.
- **Wave 2, in parallel: S2** shelter's scene, play and `fliers.test.ts`
  case; **P2** sprouting's scene. Shared files by lines granted:
  - `ui/scene/mushroom-bed.ts` (427): S2 only `capTop`'s block, net ≤ +8;
    P2 `reconcile`, `update` and a new `inSight`, net ≤ +12. Whichever
    lands second and would pass 445 moves code out first.
  - `ui/scene/meadow-scene.ts` (446): P2 ≤ +3; S2 none.
  - `model/game.ts` (436): P1 ≤ +8; S none.
- **Wave 3: P3** the probe's `sprouts()`, the `sprouts` play and the
  sweep's `--showers`; then the tail (frames, review, fixes, fold, Artifact).
