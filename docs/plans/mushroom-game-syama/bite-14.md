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

22. **The rain's take-off turn is slowed, not the watch loosened** (S4,
    `s4.md`): a butterfly drawn turning 11.35 rad/s against 10.81 at the
    start on tabL comes from the shelter pace halving the flight. The fix
    raises the butterfly's shelter-pace `flying` lower end from 1200 toward
    ~1500 ms and re-measures; a minimum take-off turn on shelter legs only if
    that does not hold.
23. **Call 9's ~2 s holds for a near shelter only**: a butterfly 13–16 sizes
    from the nearest open seat takes 6–8 s at the shelter pace. Accepted —
    a faster far leg would break call 22 — and the play's frames judge
    whether it still reads as hiding; a line in `to-check.md`.

24. **A shelter seat a nearer cap covers is not offered** — S3's frames
    showed an insect under the opening clump's back cap drawn over the
    front one, reading as sitting on its rim. Withholding the seat
    (judged on the drawn outlines, as `mushroom-tap.ts` judges a tap) beat
    re-ordering the insect layer behind the mushrooms, which would touch
    every flier's depth for one case.

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

25. **The falling spores stay the crown puff's dots** (A3, `a3.md`): for
    the first ~20 frames they are lost in the puff, then read clearly along
    their arcs to the feet. Accepted — the cause is still seen leaving the
    parent, and a second spore ink would add a colour for one moment. A
    sprout ~20 px from the crown has its fall inside the puff; same answer.

26. **A seat drawn over a mushroom behind it stays offered** (A2, `a2.md`):
    S3's "fly on the rim" was the front cap's own inner seat with the back
    cap's dome behind it, not a covered seat. In the frame the fly reads as
    tucked into the nook between the two caps. Withholding these too would
    leave the opening pair two seats of four on every seed; the to-check.md
    line keeps it for the operator's eye.

27. **The take-off pivot of a shelter dash is floored, not the pace raised
    alone** (A1, `a1.md`): the pivot's peak turn is 8π over its time, so
    no pace short of the dry one held; legs to a shelter time their pivot
    as at least `Sheltering.pivoting` (2700 ms for the butterfly), the
    `flying` low end raised to 1500 too. tabL's take-off now peaks 8.72.
    One frame of a mid-flight re-target at the rain's start (call 8) draws
    10.90 against 10.81 — 0.8 % over for one frame, nothing a child sees,
    and no committed play measures it: accepted, not traced. A1's scratch
    play is `play-zzshower.ts.txt` beside the notes.

28. **Each shower picks its parents by its own seed, a new species first**
    (the operator, playing: «а после дождя растут только новые мухоморы?
    не заметил чтобы другие тоже появились»). Oldest-first always named
    the opening clump's fly agarics. Now the old mushrooms in sight are
    ordered by a stream salted from the shower (its `stopsAt`), those of a
    species the last shed did not use first; still the parent's species,
    still up to `PARENTS` tried in order. Beat: one sprout per species in
    sight, which scatters a shed across the view and weakens "this one
    puffed, these came up".
29. **A drag on the sky turns, a drag on the ground strafes** (the
    operator: «тащишь по небу — поворот (потому что как раз при повороте
    небо двигается). тащишь по земле — стрейф») — the axis lock's
    horizontal branch swapped (`model/walk.ts`); a vertical drag steps
    wherever it starts, as before. A ground strafe slides the ground under
    the finger with it.

## Calls — spores the child sows (the operator, playing)

> мне кажется было бы прикольно вот как: когда "тыкаешь по грибу", из него
> ж вылетают споры. Можно сделать, чтобы часть из них "оседала" на землю.
> Не обязательно чтобы анимация прям делала "из вылетающих в землю" --
> достаточно просто если рядом с грибом будут малюсенькие белые кружочки.
> Количество ограниченно количеством "посадочных мест" около гриба. Когда
> идёт дождь, эти споры прорастают.

These replace the after-the-rain shed: calls 12, 14, 15, 18, 19 and 28 go
as written; 13 (`near`), 16 (a sprout's clock), 17 (the parent's species
and salted seeds), 20 (a sprout is a mushroom) and 21 stand.

30. **A tap on a full-grown mushroom settles one spore** on the ground near
    it, beside the puff it already makes, while it has a free seat; a
    sprout still growing settles none. Each tap one, so the child sees
    each tap leave a dot.
31. **A mushroom has `SPROUTS` (3) seats**: feet the scene finds round it
    with `roomFor`'s `near`, as `shedIn` does; a spore takes one. A spore
    is laid as a sprout at its start size would be, and counts against
    `MUSHROOM_SLOTS` and `FIELD_MUSHROOMS`, so it always has room to
    sprout. No seat or full caps: the tap puffs as today, no dot, no
    refusal.
32. **A spore is model state**, `Meadow.spores`: its foot, parent, seed
    and when it settled — the reducer records it from the tap with the
    feet the scene found, re-checked as `grow` re-checks. Nothing happens
    to a spore while dry: it stays until rain, a walk away and back finds
    it.
33. **A spore is drawn as a tiny white dot on the ground** at its foot
    (`PALETTE.spore` or a white of its own in the palette), a few px at
    the clump's depth, scaled by depth like any foot thing, hazed and sunk
    by the brow, under every mushroom and insect. It takes no tap and is
    no perch. The tap's dot drops from the puff along `spore-drift.ts`'s
    arc to its foot (reused), then stays.
34. **When it rains, every spore sprouts** at a moment its seed picks in
    the shower's first ~6 s after the dark sets in, wherever it lies —
    out of sight too — becoming a sprout of its parent's species and
    seed stream (17), growing on call 16's clock with the grow sound; the
    dot is gone as the sprout pops. A spore whose parent was sunk since
    still sprouts (the species is on the spore).
35. **The after-the-rain shed is retired**: `shedding`, `Meadow.shed`,
    the tick's `shed`, `shedIn`, `shedNow` and the stop's search go; the
    probe's `sprouts()`, the `sprouts` play and the sweep's `--showers`
    follow the new source (tap to sow, rain to sprout).

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

## Built

Each package's hand-over note under `docs/remove-before-merging/bite-14/`
holds its detail.

- **S1** 40e7e229 — shelter's model (`model/shelter.ts`, the `shelter`
  perch kind). **S2** 30031520 — the scene's seats under dome caps
  (`perch-sight.ts`, `perch-hosts.ts`, the bed's `seat`). **S3** c5ddcff2,
  3be34bf7 — the rain play shelters and shoots three fliers; `capUnder`
  moved to `model/mushroom-outline.ts`, on the lowest drawn edge.
  **S4** 4fe541ad — the flier checks and a `fliers.test.ts` shower case; a
  sheltering flier no longer gives way to a waiting bee (`isDue`).
- **P1** fe6272a5 — sprouting's model (`model/sprouting.ts`, `pickFoot`'s
  `near`). **P2** 3aad2f45 — `roomFor`'s `near`, `shedding.ts`. **P2b**
  d1207f58, 7b3b5747 — the bed's sprout scale, `spore-drift.ts`, the tick
  wiring, perches seen on the scene's clock.

## Left, in order

1. **Done** (A1 addafa1, 46ca7fc; call 27). Was: **call 22**: slow the butterfly's rain take-off and re-measure with
   S4's play (`s4.md` says how to rebuild it); then the full
   `fliers.test.ts` once.
2. **Done** (A2 e671c74, 2b47ed9; call 26). Was: **call 24**: withhold covered shelter seats; re-shoot `--plays rain`.
3. **Done** (A3 f07b50c, bad0688: the play's tweens step on the game
   clock; the dots fall and land, frames `a3-*`). Was: **the spore dots were never seen** (`p2b.md`'s next step): Phaser's
   tweens run on the wall clock, the play steps the game's; drive the tween
   clock from the stepped one, then confirm the dots fall from the parent.
   P2b's scratch driver is `look-sprouts.ts.txt` beside the notes.
4. **P3**: the probe's `sprouts()`, a `sprouts` play (spec-sprouting § 4
   step 3, the stepped tween clock from item 3), the sweep's `--showers`
   and R1's sweep check.
5. The tail: the review (two reviewer agents by package), its fixes, the
   fold, bite 13's frames retired, the Artifact, `/polish`, `/pr`.
   `model/shelter.ts` carries a prettier warning (`saltedStream,type`).
