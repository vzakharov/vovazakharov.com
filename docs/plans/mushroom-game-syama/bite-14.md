# Bite 14 — after the rain

Item 14 of the plan: while it rains, insects shelter under the caps; when it
stops, spores an old mushroom shed sprout into little mushrooms that grow
over the next minutes. Two packages, each mapped by a spec
(`docs/remove-before-merging/bite-14/spec-shelter.md`,
`spec-sprouting.md`), whose recommendations are taken except where a call
below says otherwise. Paths are under `src/pages/mushrooms/`.

## Calls — shelter

1\. **A shelter is a perch kind of its own**, `shelter`: a cap's id and seat
0 or 1, left and right of the stem just under the rim, the insect drawn
over the stem facing up. Every switch over perch kinds learns it,
`scripts/lib/mushroom-probe.ts`'s `PERCHES` included. Chanterelles offer
none: a funnel has no underside.

2\. **The model learns of the rain from the meadow it already receives**;
shelter edits nothing in `model/game.ts`. While `raining`, a flier is
offered only shelter seats and the air — flowers and cap tops are
withdrawn.

3\. **Nearest is from where the insect is drawn**, deterministic, so nothing
changes in flight while it is dry.

4\. **Two seats a cap**, the existing crowding check deciding which can be
filled together; never a huddle (fliers sit apart, standing rule).

5\. **No shelter open: the insect roams the air as today.** Planting more
mushrooms buys more shelter. Leaving over the brow is rejected — nothing
is lost for a shower.

6\. **A bug button while it rains** flies the newcomer straight to an open
shelter on screen, or into the air if none is open.

7\. **A tap on a sheltering insect** darts it to the nearest other open
shelter, or up into the air and back; the tap goes through and wobbles
the cap, as a tap on a perched insect does.

8\. **The rain's start makes every leg set off before it due at once**, mid
flight too, through the path that re-targets a flier whose perch is gone.
A shower lengthened by a tap sends no second dash.

9\. **A shelter pace per kind**: the butterfly about doubles and darts, under
cover in ~2 s; the fly and the bee keep their own, already quick.

10\. **When it stops they come out one by one**, each 0.3–2.5 s after the
stop by its own seed, as the rainbow rises; while it rains a sheltering
stay is stretched to the current `stopsAt`, which covers a lengthened
shower.

11\. **A cap shelters only where it is drawn at least as wide as a
butterfly**, judged in `perch-sight.ts` from the drawn size — so a
sprout still small offers no shelter of itself, with no flag shared
between the packages. A sprout's cap top stays a perch as any cap's
(sprouting C11).

22\. **The rain's take-off turn is slowed, not the watch loosened** (S4,
`s4.md`): a butterfly drawn turning 11.35 rad/s against 10.81 at the
start on tabL comes from the shelter pace halving the flight. The fix
raises the butterfly's shelter-pace `flying` lower end from 1200 toward
~1500 ms and re-measures; a minimum take-off turn on shelter legs only if
that does not hold.

23\. **Call 9's ~2 s holds for a near shelter only**: a butterfly 13–16 sizes
from the nearest open seat takes 6–8 s at the shelter pace. Accepted —
a faster far leg would break call 22 — and the play's frames judge
whether it still reads as hiding; a line in `to-check.md`.

24\. **A shelter seat a nearer cap covers is not offered** — S3's frames
showed an insect under the opening clump's back cap drawn over the
front one, reading as sitting on its rim. Withholding the seat
(judged on the drawn outlines, as `mushroom-tap.ts` judges a tap) beat
re-ordering the insect layer behind the mushrooms, which would touch
every flier's depth for one case.

## Calls — sprouting

12\. **Old is full-grown**: every mushroom not still sprouting. The parent is
the oldest in sight (`meadow.mushrooms` order among those on screen),
falling back to the next oldest when the first finds no room — two
parents at most, up to `SPROUTS` 3 sprouts a shower.

13\. **Sprouts land near the parent** through `pickFoot`'s new optional
`near: { ground, reach }`, reach ≈ one clump size tuned by the sweep;
without `near` the stream draws exactly as today, so the sweep and the
placement tests do not move. `roomFor` gains the matching optional
`near`.

14\. **The scene finds room, the model decides**, as `grow` and the bees'
`Plot.room` do: a pure `shedding(meadow, now, inSight)` names when, who,
how many and which seeds; the scene's `shedIn` finds feet with
`roomFor`; the tick carries them as an optional `shed`; the reducer
re-checks them as `grow` does and records the shower as shed even with
no sprout, so the scene searches once. A tick with nothing to shed
returns the same `Meadow`.

15\. **A shed is due from `stopsAt` for `SHED_WINDOW_MS` 12 s**, about the
rainbow's span, and only while an old mushroom is in sight; a turn back
within the window brings it then.

16\. **A sprout is an ordinary mushroom with `sprout: { at, parent }`**, its
size a pure clock function: hidden for `SPORE_FALL_MS` 0.7 s while its
spores fall, then 0.4 rising to full over `SPROUT_MS` 120 s, eased out
(≈0.58 at 20 s). Growth never enters the model.

17\. **The parent's species**; seeds salted from the parent's seed.

18\. **Full caps mean fewer sprouts, never a refusal**; with none, no puff
either — a puff with nothing after it teaches a false cause.

19\. **The child sees the cause**: the parent puffs from its crown, a few
spore dots fall along an arc to each sprout's foot
(`ui/scene/spore-drift.ts`, `PALETTE.spore`), and the sprout pops up at
0.4 as they land, with the grow sound.

20\. **A sprout is a mushroom in every way**: tapped, furnished, sunk, perched
on. A shed selects nothing and touches no picker. A second shower does
not pause growth, and a sprout still growing is never a parent.

21\. **A sprout is judged at its start size too** (`partsInView`,
`keepsPatches` at 0.4, for `near` searches only), so none is born hidden
behind a stem. If the stop frame's cost rules it out, it drops back to
accepting the risk, in the report. **Dropped back** (P2, 3aad2f45):
judged at 0.4 too, a shed found a foot in 0 of 20 tabL visits at ~3.5 s
a shed, against 20 of 20 at ~30 ms without — so a sprout may come up
half behind a stem until it grows; a hand check in `to-check.md`.

25\. **The falling spores stay the crown puff's dots** (A3, `a3.md`): for
the first ~20 frames they are lost in the puff, then read clearly along
their arcs to the feet. Accepted — the cause is still seen leaving the
parent, and a second spore ink would add a colour for one moment. A
sprout ~20 px from the crown has its fall inside the puff; same answer.

26\. **A seat drawn over a mushroom behind it stays offered** (A2, `a2.md`):
S3's "fly on the rim" was the front cap's own inner seat with the back
cap's dome behind it, not a covered seat. In the frame the fly reads as
tucked into the nook between the two caps. Withholding these too would
leave the opening pair two seats of four on every seed; the to-check.md
line keeps it for the operator's eye.

27\. **The take-off pivot of a shelter dash is floored, not the pace raised
alone** (A1, `a1.md`): the pivot's peak turn is 8π over its time, so
no pace short of the dry one held; legs to a shelter time their pivot
as at least `Sheltering.pivoting` (2700 ms for the butterfly), the
`flying` low end raised to 1500 too. tabL's take-off now peaks 8.72.
One frame of a mid-flight re-target at the rain's start (call 8) draws
10.90 against 10.81 — 0.8 % over for one frame, nothing a child sees,
and no committed play measures it: accepted, not traced. A1's scratch
play is `play-zzshower.ts.txt` beside the notes.

28\. **Each shower picks its parents by its own seed, a new species first**
(the operator, playing: «а после дождя растут только новые мухоморы?
не заметил чтобы другие тоже появились»). Oldest-first always named
the opening clump's fly agarics. Now the old mushrooms in sight are
ordered by a stream salted from the shower (its `stopsAt`), those of a
species the last shed did not use first; still the parent's species,
still up to `PARENTS` tried in order. Beat: one sprout per species in
sight, which scatters a shed across the view and weakens "this one
puffed, these came up".

29\. **A drag on the sky turns, a drag on the ground strafes** (the
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

30\. **A tap on a full-grown mushroom settles one spore** on the ground near
it, beside the puff it already makes, while it has a free seat; a
sprout still growing settles none. Each tap one, so the child sees
each tap leave a dot.

31\. **Up to `SPORE_SEATS` (6) spores a mushroom, each foot found on its
tap** (the operator: «вокруг каждого, грубо говоря, 6 посадочных мест —
или можно случайно выбирать … по критериям "близости" и
"нет-толпы-шности"?»). The field is continuous (`pickFoot` over plane
candidates), so there are no fixed seats: each tap's spore lands where
`roomFor`'s `near` finds room round the mushroom by the tap's seed —
near it, and clear of every other mushroom, sprout and spore, which is
the not-a-crowd rule already. Beat: six fixed seats in a ring, which
would draw the same hexagon round every mushroom and need its own
crowding check against neighbours. A spore is laid as the full-grown
mushroom it comes up as (call 41), and counts against `MUSHROOM_SLOTS` and
`FIELD_MUSHROOMS`, so it always has room to sprout. Six spores, no room
near, or full caps: the tap puffs as today, no dot, no refusal.

32\. **A spore is model state**, `Meadow.spores`: its foot, parent, seed
and when it settled — the reducer records it from the tap with the
feet the scene found, re-checked as `grow` re-checks. Nothing happens
to a spore while dry: it stays until rain, a walk away and back finds
it.

33\. **A spore is drawn as a tiny white dot on the ground** at its foot
(`PALETTE.spore` or a white of its own in the palette), a few px at
the clump's depth, scaled by depth like any foot thing, hazed and sunk
by the brow, under every mushroom and insect. A tap picks it up (call
38); it is no perch. The tap's dot drops from the puff along `spore-drift.ts`'s
arc to its foot (reused), then stays.

34\. **When it rains, every spore sprouts** at a moment its seed picks in
the shower's first ~6 s after the dark sets in, wherever it lies —
out of sight too — becoming a sprout of its parent's species and
seed stream (17), growing on call 16's clock with the grow sound; the
dot is gone as the sprout pops. A spore whose parent was sunk since
still sprouts (the species is on the spore).

35\. **The after-the-rain shed is retired**: `shedding`, `Meadow.shed`,
the tick's `shed`, `shedIn`, `shedNow` and the stop's search go; the
probe's `sprouts()`, the `sprouts` play and the sweep's `--showers`
follow the new source (tap to sow, rain to sprout).

38\. **A tap on a spore picks it up** (the operator: «нажатие на точку её
убирает (мало ли, может именно там ребёнок не хочет, чтобы появлялся
новый гриб)»): the dot pops with a tiny puff and a soft sound, the
spore leaves `Meadow.spores`, and its parent may sow there again. A
spore's reach is `TAP_RADIUS` like every small thing; a mushroom's
drawn outline takes a tap before a spore, a spore before a grass tuft
(so a tap beside a dot never opens the flower picker by surprise).
This revises call 33's "it takes no tap".

39\. **The map's readings are taken** (`map-spores.md` § 7, M, a17bb175):
a spore sprouts at `darkAt(rain)` (start + `WET_MS`) plus its seed's
draw of 6 s, the sprout's clock started `SPORE_FALL_MS` earlier so it
pops as the dot goes; the dot sorts a shadow's step nearer than its
foot's row; a spore pick-up changes neither the selection nor a
picker; the tap routing tries a spore in `tapMeadow` between the cloud
and the tuft, not as an interactive object.

40\. **A spore sown while it rains sprouts in that shower**, at the later of
its seed's moment and `SPORE_DWELL_MS` (~2 s) after it settles — the
child sees the dot land, then come up, which shows the rain's cause
best. A spore sown in the shower's last ~2 s comes up just after it
stops, still wet. Beat: waiting for the next shower, which reads as the
rain not working on this dot; and capping the moment at `stopsAt`, which
would cut the dot's dwell short.

36\. **A cloud rains on a press, a drag starting on it included** (B2,
`b2.md`, found a sky drag over a cloud starts a shower). Kept: the
operator, «это норм, так он и обнаружит, что есть дождь» — the child
finds the rain by turning. The walk play's sky drag skips clouds.

37\. **A chase ends when the finger lifts, and any key cancels it** (the
operator: «если свайпишь достаточно далеко, стрейф идёт до этого места
и не останавливается только если нажмёшь или прострейфишь ещё раз
мышкой. Если нажмёшь в это время шифт стрелка в другую сторону — не
останавливается. и если поворачиваешься клавиатурой, тоже не
останавливается»). The stride's chase (a step's or a strafe's, capped at
the cruise) runs on toward a target the finger left far behind. On the
lift it eases to a stop over the cruise's own ease rather than running
to the target; a held walk, strafe or turn key cancels it at once and
takes over (`model/stride.ts`, `model/walk.ts`). A finger still moving
at the lift glides on instead (call 43).

## From the operator's play — for item 15

> 1- мышки: я мельком увидел, что они должны бегать? это хорошо. но
> предлагаю так: мышка бежит, только если есть другая дверца, и бежит к
> этой дверце
>
> 2- на маленьких грибах отрисовка мышки оставляет желать лучшего.
> наверное, нужно делать мини-мышек, несмотря на то что это против
> биологии :)
>
> 3- есть ли какая-то интерактивность с окошками? если нет, предлагаю
> червячков -- бегут из одного окошка в (если есть) другое на том же грибе.
> если нет -- как и мышка выглядывают и прячутся обратно

The frame he sent (`docs/remove-before-merging/frames/bite-14/operator-chanterelle-mouse.png`): a chanterelle's mouse as wide as its stem, its door hidden
behind it.

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

- **This session's round** (2026-10-03): **A1** addafa1, 46ca7fc — the
  shelter dash's pivot floored (call 27). **A2** e671c74, 2b47ed9 —
  covered seats withheld, `shelter-cover.ts` (calls 24, 26). **A3** f07b50c,
  bad0688 — the play's tweens step on the game clock (call 25). **P3a**
  b0daf89 — the probe's `sprouts()`, the `sprouts` play. **P3b** 5b1bf71,
  8dd1aab — the sweep's `--showers`, R1 holds. **B1** 386a396 — parents by
  the shower's draw (call 28, to be retired by 35). **B2** b1cc7f5, 6ef6a6e
  — sky turns, ground strafes (call 29).

- **The second round** (2026-10-03, relay depth 4): **M** a17bb175 — the
  spores map (`map-spores.md`). **C37** 7d0b6871 — a chase eases to rest on
  the lift, any key ends it (call 37). **FB** 1946a63 — the frame budget
  reports, never fails. **SA** aacbd7f4 — spores in the model
  (`Meadow.spores`, `sown`/`unsown`/`sproutedInRain`, `darkAt`, furnishing
  moved to `model/furnishing.ts`; the counter is `scattered`). **SB**
  522362cc, 3edcafaf — spores in the scene (`spore-seats.ts`,
  `spore-bed.ts`, the pick-up in `tapMeadow`). **SC** 5b494679, eb66ec9b —
  the probe, the `sprouts` play, the sweep's `--showers`, the shed retired.
  **SD** 1285d6f6 — the play passes first run; `DOT` 0.05, cap-spot size.
  **ST** 7144209b — `roomFor` judges the meadow as it stands once every
  lying spore has risen (`risen`); clump 24.8/50.0 against bounds 25/50,
  median 7 sprouts a shower.

41\. **A lying spore holds its place against everything laid after it**,
`+` and other spores included (ST): `roomFor` judges the risen meadow,
flowers replotted off the spores' feet. Beat: judging the meadow as
drawn, which let six spores round a cap bury each other once grown.

42\. **The fly's landing turn drawn 0.5 % past its cap is accepted** (R,
`r.md`): the model steps exactly `TURN_RATE.fly` (36.00 rad/s), and the
screen's bend draws that step at a slope of ~1.005 where fly-8 lands, so
the watch, judging the drawn turn, reads 36.18 for one frame. Same cause
and answer as call 27's butterfly. Beat: a second limiter on the drawn
rotation (state the model's `wound` does not see, moving the light and
nectar pose) and headroom in the model's clamp (a margin with no bound,
the bend's slope varying across the screen). The flier watch allows
the bend as `BEND_SLOPE` 1.01 over the model's cap (W): judging the
model's turn instead would stop it catching a turn the screen snaps.

43\. **A quick ground swipe glides on, as a sky turn does** (option 2 of
three put to the operator after call 37; unanswered by the tail, so the
recommended one, G). On the lift a finger still moving flings the eye
on along the chase's line at its speed, capped at
`STRIDE_FLING_FASTEST` (5 × cruise, 8 units/s), slowing on the sky
turn's curve: ~2.7 units, nine tenths within 1 s. A finger at rest
before the lift, or a walking key held at it, keeps call 37's ease to
rest; a key or a press ends the glide, a key taking over its pace held
to the cruise. The curve and the finger-speed sampling are one module,
`model/glide.ts`, that `pan.ts` and `stride.ts` share. Beat: (1) stop
on the lift, which moved a quick swipe ~0.2 units; (3) run to the lift
point at the cruise, which leaves the ground far behind the finger.

44\. **While the finger is down the ground stays under it** (the review,
RA: the strafe's chase at the cruise left a 150 px swipe's ground ~15 %
of the way to the finger at the lift, and call 29's "slides the ground
under the finger" held only for a slow drag). A ground drag tracks the
finger with no cruise cap, as a sky drag keeps its azimuth; call 43's
glide takes over on the lift (FW). Beat: restating call 29 as "lags,
then catches up on the glide", which makes the ground feel unlike the
sky under the same hand.

- **R** f5f5f71 — `sprouts` passes after `risen` (tabL: 3 sown, 1 picked,
  2 sprouts, 0 left; 14.3 ms median); fly-8 traced (call 42). **W**
  dacec89b — the watch allows the bend; meadow green on tabL. **G**
  eae780e, 3855aad — the ground fling (call 43), merged 6c786971; the
  walk play green on tabL.
- The phone's narrow clump (62 % narrower than a fingertip after a shower,
  47.8 % under the old shed) is a `to-check.md` line.
- **The review** (PR #57 review 5400519622, RA shelter+walk, RB spores; 11
  inline findings, each replied to with its commit): **FS** 769aeec0 — a
  spore's foot only where its dot is seen and reachable (`spore-sight.ts`;
  covered dots 59/52 → 0 over 50 visits, clump median 7 → 6 sprouts).
  **FW** 08c78ffa, ccfff90d — `shelter.ts` formatted; the ground tracks
  the finger, no cruise cap (call 44; call 37's ease after the lift is
  gone, a finger at rest leaving the eye standing). **FS2** 9feaef7d,
  d47139d3 — a sprout's clock starts at its moment, the dead hidden phase
  gone; `SPORE_REACH`; the fall arc swings toward its foot. **FW2**
  a0fa1095, 03288494 — the walk play checks the ground under the finger
  (found and fixed a step drag drifting 6 % off-centre, the bend ignored);
  the rain play expects every flier sheltering and a staggered way out.
  All plays named green on tabL and phoneP. The plan's call numbers,
  renumbered by prettier, restored (7de3ca4c).

## Left, in order

1. The rest of the tail: the fold (this file's calls at the plan's
   altitude into `## Eaten so far`, `decisions.md:61`'s "spores an old
   mushroom shed" corrected), this bite's working notes under
   `docs/remove-before-merging/bite-14/` retired into `retired.md`, the
   Artifact republished, `/polish`, `/pr`; then the plan paused for the
   next bite (item 15).
