# Bite 14 — sprouting: spec

When a shower stops, the oldest mushroom in sight puffs its spores. Up to
three little mushrooms of its own species come up round it, each through
`pickFoot` and `roomFor`, and grow to full size over the next two minutes.
This file maps the code the build stands on, lists the calls with options
and a recommendation, names the risks to standing invariants, and cuts the
build into three steps. Paths are under `src/pages/mushrooms/` unless they
say otherwise.

## 1. The map

**The reducer.** `model/game.ts` (436 lines, close to the cap).

- `Planted = Mushroom & Housed & Footed` (:37). `Mushroom` is
  `WithId & Seeded & { species }` (`mushroom-genes.ts:37-38`). A mushroom
  has **no birth time and no age**. The order of `meadow.mushrooms` is the
  order they were planted ("the last is the newest", :58), and `grown`
  (:74) counts every mushroom ever grown, so ids are `mushroom-${grown}`.
- `Meadow` (:57-79) is `Swarm & {…}`. `rain: Rain | undefined` (:78) keeps
  the latest shower after it stops. `firstMeadow` (:112-131) is the only
  place a `Meadow` literal is built, the tests included.
- `Action` (:81-106). `grow` is `{species} & Seeded & Footed` (:83).
  `tick` is `Sighted` = `Timed & Sight` (:106, :109).
- `grow` (:346-365): "Where it grows is the scene's pick (`pickFoot`), made
  before the tap." The reducer only checks the caps again
  (`isFull || isCrowdedAt(meadow, foot)`), then appends the mushroom,
  selects it and shuts the picker.
- `tick` (:428-431) is `swarmed(meadow, ticked(meadow, perchesOf(meadow,
  action), now))`. `swarmed` (:231) hands back **the same object** when the
  insects changed nothing. `perchesOf` (:214-228) offers only the caps the
  scene placed (`sight.places`), so a mushroom the scene has not seen yet is
  no perch.
- `rain` (:419-427) builds a **new** `Rain` object on every tap. A tap while
  it rains keeps `startedAt` and moves `stopsAt`.

**How `grow` gets the screen into the model.** It doesn't: the scene
decides the foot. `ui/scene/arrivals.ts:54-64` draws the seed before the tap
(`upcoming`). `roomNow()` (:94-97) runs `keptRoom()(stand, seed, view)` with
the scene's `stand()` and `eye.view()`, and the dispatched `grow` carries the
`Footed` it found. The sweep's `visit-play.ts:57-69` (`opened`) loops in
the same way: `roomFor(standOf(layout, flowers, meadow), seed, view)`, then
`reduce(grow)`, then the next seed against the grown meadow. **The tick
already follows the same pattern for the bees.** `Sight` carries `Plot.room`
(`model/flight.ts:116`, `model/pollen.ts:21-22`), which the scene computes
(`flower-sight.ts:383-405` `roomFor`, called from `perch-sight.ts:247`).
The tick's `sown` (`pollen.ts:140-170`) then picks a slot from it and
plants. "The scene says where there is room, the model decides" is the
standing shape.

**Placement.** `model/placement.ts`

- `pickFoot(seed, {frame, feet, admits, within})` (:190-212) draws from
  `mulberry32(seed ^ 0x6f075e)`. It runs up to `ROUNDS` 32 rounds of
  `CANDIDATES` 12 (:136-141). Each candidate is drawn evenly over the frame,
  across `within` (`drawnFoot`, :164-171, in `seen` space:
  `x·scaleAt(z)`). Candidates closer than `FOOT_APART` 0.3 (:146) to any
  foot are dropped, the rest are sorted farthest-first from their nearest
  foot, and the first one `admits` takes wins.
- `apartOnScreen` (:149) measures distance in `seen` space (`ground.ts:140`).
- `grownOn(eye, ground)` (:117) turns a ground point into a stored `Footed`,
  with the lean set by the side of the line of sight.

**The room.** `ui/scene/mushroom-room.ts` (383 lines)

- `roomFor(stand, seed, view?)` (:272-311) judges from `anchorOf(view.eye)`.
  It builds `anchoredStand` and `screenOn` (:112-132: edges, the controls,
  the sun's rays, the `within` span the view shows).
- `admits` (:292-308) tests, cheapest first:
  - `isCrowdedAt(stand, foot, anchor)` and the flowers' `FLOWER_APART`;
  - `shownTrials` (:236-257): **all four species** (`speciesOf`, :219),
    each cap on screen and off the controls;
  - `partsInView` (MOST_HIDDEN), then `doorsKept`;
  - `keepsPatches` (the tappable patch), the most expensive test.
- `fitsView` (:319-335) and `keptRoom` (:363-383) cache the `+` room per
  seed and stand. `FOUND_FROM` includes `mushrooms`, so new sprouts make
  `+` search again.
- `groundIn(layout.mushrooms, foot)` (`clump-layout.ts:157-163`) gives a
  stored foot's ground in the anchored layout, or `undefined` behind the eye.

**The caps.** `model/crowding.ts`: `MUSHROOM_SLOTS` 12 (:227),
`FIELD_MUSHROOMS` 96 (:235), `isFull` (:242), and `isCrowdedAt(stand, foot,
from = foot)` (:268-277), which counts mushrooms within `D_SEE` of the foot
and of the anchor. `D_SEE` is `ground.ts:278`.

**The weather.** `model/weather.ts` uses ms on the insects' clock. The
scene's `tick` passes Phaser's `time` as `now` (`meadow-scene.ts:195-199`),
and the bed's `t` is `time / 1000`, so it is one clock in two units.

- `Rain = {startedAt, stopsAt}` (:10); `RAIN_MS` 10 s (:13).
- `raining` (:24-26).
- `rainbow` rises 1.5 s, holds 8 s and fades 3 s from `stopsAt`
  (:19-21, :55-63). The rainbow constants are private.

**How the bed draws a mushroom appearing.** `ui/scene/mushroom-bed.ts`
(427 lines, close to the cap).

- `reconcile` (:106-167): a new id gets `show(mushroom, clock)` (:373-398,
  which stores `plantedAt` through `unplacedShown`, `mushroom-shown.ts:60-95`)
  and `place`. Unless it is the opening, the bed puffs spores at its foot
  (`puffSpores`, `drawnSize·0.5`) and plays `voice.grow()`.
- `update(t, wetness)` (:222-261):
  `grown = min(emerge(t − plantedAt), sink(t − goneAt)) · swell` scales the
  graphics, the shadow and the house through `house.update`. The hit area
  lives in the graphics' frame, so it scales too (:62-67).
- `emerge` (`model/motion.ts:108-117`) is a 0.75 s Back.Out. It returns
  **1 for elapsed < 0**, so a mushroom with a future `plantedAt` would stand
  at full size until then.
- `motion.ts:13` already exports `Sprouted = { plantedAt }`, the scene's
  emerge time shared by the flowers and the mushrooms. **Do not reuse that
  name** for the model's sprout.
- `capTop` (:268-281) reads `graphics.scaleX/Y`, so a seat on a growing cap
  rises with it.
- `tap` (:412-427) puffs from the crown: `puffFrom(scene, shown, crown, 0.75,
  SPORE_DEPTH)`.
- `stands.drawn` (used by `hazeHere`, :346-349) says whether the view draws
  the mushroom at all.

**Spores.** `ui/scene/spores.ts`.

- `puffFrom(scene, body, point, share, depth)` (:40-58) puffs from a point
  on a mushroom.
- `puffSpores(scene, anchor, depth)` (:68-129): two rings of dots that open
  and drift **up**, follow `anchor()` every frame, then shrink away (no
  alpha fade).

**The probe and the plays.**

- `scripts/lib/mushroom-probe.ts` (705 lines) reports `mushrooms` ids
  (:279-280) and `rain()` (:431).
- `scripts/lib/play-rain.ts` (180 lines) runs on the frame clock:
  `STOP = ceil(RAIN_MS / FRAME_MS)` (:40), shot `rain-2-dry` (:161).
- `scripts/sweep-mushrooms.ts` grows forests through `visit-play.ts`
  `opened` and never rains.

## 2. The calls

Each call lists its options, then the recommendation (**rec**).

**C1. What "old" means.**

- (a) Full-grown: every mushroom the child or the opening grew is old, and a
  sprout is old once it has finished growing. The parent is the **oldest in
  sight**, the first in `meadow.mushrooms` order among those on screen. No
  new field on grown mushrooms.
- (b) Every `Planted` gets a `grownAt`. `grow` then carries `now`, which
  touches `Arrivals`, `visit-play`, `game.test.ts` and the probe. "Old"
  becomes "stood through the whole shower".
- (c) No age: the parent is the mushroom nearest the eye.
- **rec (a).** The child cannot see age, and planting order already ranks
  it. On the opening view the parent is usually the clump's back fly
  agaric, the oldest thing she knows. Cost: one pure predicate.

**C2. How many sprouts per shower, and from which parents.**

- (a) One parent, the oldest old one in sight, with up to `SPROUTS` 3.
- (b) Every old mushroom in sight, one sprout each: busy, the cause hard to
  read, and up to 12 searches in one frame.
- (c) The nearest to the eye, up to 3.
- **rec (a)**, plus a fallback to the **next** oldest in sight (two parents
  at most) when the first finds no room. Each extra search costs about one
  `+` search in the same frame. The model returns the candidate parents in
  order, and the scene stops at the first that gets at least one foot.

**C3. Where the sprouts land.**

- (a) `pickFoot` with a new optional `near: { ground, reach }`. It draws
  candidates evenly in the disc of `reach` round the parent's `seen` point
  (the inverse of `seen` is `z = y / UP_PER_Z`, `x = sx / scaleAt(z)`) and
  rejects any outside the frame or `within`, never clamping them.
  `FOOT_APART`, the Mitchell sort and `admits` stay as they are.
  `reach` ≈ 1.0 clump size in `seen` space, to be tuned by the sweep (C12).
  **Without `near`, the stream draws exactly as today**, so the placement
  tests and the sweep do not move.
- (b) Fixed ring slots like the bees' `ringFoot` (`flower-plots.ts:102`). A
  ring would match the mandala language, but fixed slots fail more often
  against patches, doors and flowers, and three mushrooms round one read no
  rounder than a cluster.
- (c) Plain `roomFor` anywhere on screen. This cuts the parent-to-sprout
  link the child is meant to see.
- **rec (a).** `roomFor` gains an optional fourth parameter
  `near?: Footing`, the parent's stored foot, which it turns into ground
  with `groundIn`; if that is `undefined`, there is no room. The sprouts are
  searched one after another, each against the meadow with the earlier ones
  added, as `opened` does. Cost: about 25 lines in `placement.ts` and about
  10 in `mushroom-room.ts`.

**C4. Placing them without the screen in the reducer.**

- (a) The tick carries what the scene found:
  `{kind:'tick'} & Sighted & Shedding`, where
  `Shedding = { shed?: { parent: string; sprouts: readonly (Seeded & Footed)[] } }`.
  This is the bees' `Plot.room` shape and the "first thing the reducer's
  tick grows" line taken literally.
- (b) A dedicated `shed` action the scene dispatches. It works the same and
  leaves the tick alone, but the plan names the tick.
- (c) The model places by its own rules (plane distances, `isCrowdedAt`).
  This breaks the screen's rules (the controls, the sun, the doors, the
  patches), so it is out.
- **rec (a).** The model decides **when, who, how many and which seeds**,
  through a pure exported `shedding(meadow, now, inSight)` →
  `{ parents: [{ id, seeds }] } | undefined`. The scene finds the feet for
  those seeds and passes them in. The reducer checks it all again, as
  `grow` does:
  - the shed is due;
  - the parent exists and is old;
  - for each sprout, `!isFull && !isCrowdedAt(m, foot)`.

  It then appends the sprouts and records the shower as shed, **even with
  zero sprouts**, so the scene never searches again for that shower. A tick
  without `shed` changes nothing, which keeps `visit-play.play` and the flier
  sweeps exactly as they are.

**C5. The shed's bookkeeping.**

- A shed is due when `rain` is defined,
  `stopsAt ≤ now < stopsAt + SHED_WINDOW_MS`, and `meadow.shed !==
  rain.stopsAt`.
- `Meadow` intersects a sprouting-owned base `Shed = { shed: number |
  undefined }`, the `stopsAt` of the last shower that has shed, as `Swarm`
  is intersected. `pnpm type-overlap` holds.
- A new shower is a new `Rain` with a new `stopsAt`, so it sheds again of
  its own accord.
- **rec `SHED_WINDOW_MS` = 12 s**, about the rainbow's span, as a constant
  in `model/sprouting.ts` (not an export from `weather.ts`, which shelter
  reads).
- While the shed is due and no old mushroom is in sight, the scene does not
  search (a cheap check each frame). If she turns back to the meadow within
  the window, the sprouts come then.

**C6. "Little", and growing "over the next minutes".**

- (a) A sprout is a full `Planted` with `sprout?: { at: number; parent:
  string }` (base `Sprouting`, owned by `model/sprouting.ts`; `Planted =
  Mushroom & Housed & Footed & Sprouting`). Its scale is a pure function of
  the clock, `sproutScale(sprout, now)` in ms:
  - 0 before `at + SPORE_FALL_MS` (700 ms);
  - then `SPROUT_START` + (1 − `SPROUT_START`)·easeOut, over `SPROUT_MS`;
  - 1 for a mushroom with no sprout.
- (b) A new kind ("sprout" beside "mushroom"). This duplicates the bed, the
  taps, the perches and the house, so it is out.
- (c) Stepped sizes stored in the model, so the tick changes the meadow
  every few seconds. This breaks the same-object tick, so it is out.
- **rec (a), `SPROUT_START` 0.4, `SPROUT_MS` 120 s, easeOut `1 − (1 − u)²`.**
  It is ≈0.58 at 20 s, so the growth shows while she is still looking, and
  full at 2 minutes. The bed multiplies its `grown` by `sproutScale(sprout,
  t·1000)`. It uses `(at + SPORE_FALL_MS) / 1000` as the sprout's
  `plantedAt`, so `emerge`'s pop lands at its small size, and it hides the
  graphics, the shadow and the house while the scale is 0 (see R9).
  `parent` is there for the scene's spore trail and the probe. Nothing in
  the rules reads it.

**C7. Species.** **rec: the parent's.** A fly agaric's spores make little
fly agarics, which carries the cause and its effect. A seeded species would
lose that. `roomFor` keeps trying all four species (`speciesOf`): stricter
than needed, but no new code path, and `fitsView` and `keptRoom` stay as
they are. The cost is a little less room.

**C8. Seeds.** `nextSeed(saltedStream(parent.seed, SHED_SALT, meadow.grown
+ i))`: one parent and one meadow give the same sprouts, deterministic in
the tests, with no new stream in the scene.

**C9. When the caps are full.** The sprouts are simply fewer, never a
refusal. When `roomFor` finds no foot for a seed, that sprout is skipped,
and the reducer drops any foot `isCrowdedAt` or `isFull` would refuse.
**rec: with zero sprouts, no puff either**, because a puff with nothing
after it teaches a false cause. The shower is still recorded as shed.

**C10. What the child sees at the stop.**

- (a) A trail, in a new `ui/scene/spore-drift.ts` of about 80 lines:
  - the parent puffs from its crown (`puffFrom`, as a tap does);
  - a few dots per sprout fall along an arc from the crown to the sprout's
    foot over `SPORE_FALL_MS`, each end read every frame as `puffSpores`
    does, so a turn carries them;
  - as they land, a small `puffSpores` at the foot and `voice.grow()`, and
    the sprout pops up (`emerge`) at 0.4.
- (b) The parent's crown puff only, and the sprouts pop at once with the
  bed's usual newborn puff. No new module, but the link between the two is
  weaker.
- **rec (a).** It is what "shown, never taught" asks for. Cost: one module,
  plus a branch in the bed's `reconcile` that groups new sprouts by `parent`
  and skips their newborn puff and sound. No new colour: the dots are
  `PALETTE.spore`.

**C11. Can a sprout be tapped, furnished or sunk while small?** **rec: yes,
all three, with no special case.** It is a `Planted`. Its hit area, house,
selection ring and seats all follow the graphics' scale.

- `−` with nothing selected sinks the newest mushroom, which may be a
  sprout. That is still `−` taking something away.
- A shed **does not select** a sprout and leaves every picker as it is,
  because the child did nothing.
- A sprout becomes a perch once the scene has seen it (`perchesOf` via
  `places`). A butterfly on a small cap is the "button mushroom" case
  `decisions.md` already accepts.

**C12. A second shower before the sprouts finish.** They keep growing:
growth is a clock function and rain does not touch it, though the swell
multiplies on top. A sprout still growing is not old, so it is never the
next parent. The new stop sheds from the oldest **old** mushroom in sight,
as room allows. Shelter may put an insect under a small sprout's cap; shelter
leaves sprouts alone in this bite (see §4).

**C13. Judging a sprout at its small size too.** A sprout of 0.4 standing
behind a stem can be hidden, or keep no patch of its own, at the size it
starts at, even though its full-size self passes.

- (a) Accept the risk.
- (b) For a `near` search only, `admits` also runs `partsInView` and
  `keepsPatches` on the trial with its `Placement.size` × `SPROUT_START`.
- **rec (b).** It is about 15 lines in `mushroom-room.ts` and about twice
  the most expensive tests, for sprout searches only. If the stop frame's
  cost (R6) rules it out, drop back to (a) and report.

## 3. Risks to standing invariants

1. **`pnpm sweep:mushrooms`.** The sweep never rains, and `pickFoot` without
   `near` draws the same stream, so its output must stay identical. Check
   `--visits 200` before and after the model step. Rec: `opened` gains an
   optional `showers` count (sheds from the anchor with every mushroom in
   order as `inSight`) and the sweep gains `--showers N`. That shows how
   often a shed finds a foot (aim for ≥90 % of visits at the opening with one
   shower) and whether sprout-filled meadows keep the patch, hidden-share
   and slot numbers.
2. **The placement tests** (`placement.test.ts`, `mushroom-room.test.ts`,
   `meadow-rules.test.ts`) stay green and unedited, for the same reason.
   New cases go beside them:
   - every `near` foot lies within `reach` of the parent;
   - a sprouted meadow keeps every rule `meadow-rules.test.ts` checks, by
     reusing its checker over `opened(..., showers)`.
3. **The tappable-patch floor** (`mushroom-patch.ts`, `LEAST_PATCH` 6 px at
   :64). It is judged at full size; C13 (b) holds it at the start size. Any
   other mushroom's patch only grows while a sprout in front of it is small.
4. **The door in sight.** `doorsKept` is judged at full size. A small sprout
   hides less than its full self. A door put on a small sprout is seated at
   full size (`seatDoors`) and may sit lower behind a stem while the sprout
   grows. Accepted: it resolves as the sprout grows.
5. **`MUSHROOM_SLOTS` within `D_SEE`.** `roomFor` (`isCrowdedAt` round the
   foot and the anchor) checks it, and so does the reducer (`isCrowdedAt`
   round the foot, as `grow` does). Test: a forest at 12 sheds nothing and
   still records the shower as shed.
6. **The 26 ms budget.**
   - Each frame adds one `shedding` due-check and one `sproutScale` multiply
     per mushroom: negligible.
   - The shed frame spikes. It runs up to 2 parents × 3 `roomFor`, then
     `regrown` → `see()` (about 18 ms on tabL), the flowers' `sow`, the grass
     `tend`, and `keptRoom`'s `+` search again.
   - The play's median is unaffected, but measure the frame with
     `__probe.costs()`.
   - If one frame passes about 100 ms, the scene spreads the searches one
     per frame and dispatches once all are found. That is a scene-only
     change, and the model's contract stays as it is.
7. **The tick hands back the same `Meadow`.** `sprouted(meadow, action)`
   must return `meadow` itself when there is no `shed`, when the shed is not
   due, or when it was already shed. The tick then becomes
   `swarmed(m, ticked(m, perchesOf(m, action), now))` with `m` that result.
   Growth never enters the model. Test: after the stop, a tick without
   `shed`, and a second tick with one, both return the same object.
8. **Files near the 450-line cap:** `game.ts` 436, `meadow-scene.ts` 446,
   `mushroom-bed.ts` 427. Sprouting's budget:
   - `game.ts`: at most 8 lines (imports, `Shed` in `Meadow`, `shed:
     undefined` in `firstMeadow`, `Shedding` on the tick, one line in its
     case). Every rule lives in `model/sprouting.ts`.
   - `meadow-scene.ts`: at most 3 lines (spreading `shedNow()` into the tick
     action, and `inSight` into the getter the shedding helper reads).
   - `mushroom-bed.ts`: at most 15 lines (the scale multiply and visibility,
     `inSight()`, the sprout branch in `reconcile` calling `spore-drift.ts`).

   Shelter shares `game.ts` and `mushroom-bed.ts` (below). If both packages'
   budgets do not fit, the orchestrator first moves `perchesOf` and
   `swarmed` out of `game.ts`.
9. **Phaser at scale 0.** A sprout before its spores land is at scale 0.
   The bed sets `graphics`, `shadow` and the house invisible (`setVisible(
   young > 0)`), so neither a tap nor a rain drop (`rain-drops.ts:258`
   checks `visible`) finds it.
10. **Perches.** A just-shed sprout is no perch until the scene's `see()`
    places it, because `perchesOf` reads `places`. Once placed, an insect
    may perch on a 0.4 cap (accepted, C11).
11. **The opening clump as a parent.** `groundIn` takes opening feet (the
    plane foot from `OPENING_FEET`). Check that a `near` disc round the
    clump's back foot is mostly rejected for hiding the clump (MOST_HIDDEN
    and `BACK_CAP_SHOWN`), and tune `reach` by the sweep.

## 4. The build, for one agent

Each step type-checks on its own and is committed with its tests.

**Step 1: the model, with tests first.**

- New: `model/sprouting.ts` and `model/sprouting.test.ts`.
  - Exports: `Shed`, `Sprouting`/`Sprout`, `Shedding` (the tick's field),
    `SPROUTS`, `SPROUT_START`, `SPROUT_MS`, `SPORE_FALL_MS`,
    `SHED_WINDOW_MS`.
  - `isOld(m, now)`; `shedding(meadow, now, inSight)` (due → ordered
    parents, at most 2, each with its seeds); `sprouted(meadow, tick)` (the
    checks of C4, the same object when nothing applies); `sproutScale(sprout
    | undefined, now)`.
- Edit: `model/game.ts` within the budget of R8.
- Edit: `model/placement.ts` (`near` in `Picking`/`pickFoot`), with new
  cases in `model/placement.test.ts` (the old stream unchanged with `near`
  absent, and every foot within `reach`).
- Tests, through `reduce`:
  - due only after the stop, inside the window, once per `stopsAt`;
  - a new shower sheds again;
  - a sprout is the parent's species, unselected, with pickers untouched;
  - caps hold: full field, crowded foot;
  - zero sprouts still record the shed;
  - the same-object ticks (R7);
  - a growing sprout is not old;
  - the scale is 0, then 0.4, then rising, then 1.
- Run `game.test.ts`, `sprouting.test.ts`, `placement.test.ts`, then
  `pnpm typecheck`, then `pnpm type-overlap`.

**Step 2: the scene.**

- Edit: `ui/scene/mushroom-room.ts` (`near`; the start-size judging of
  C13 (b)) and `mushroom-room.test.ts`.
- New: `ui/scene/shedding.ts`, the pure
  `shedIn(stand, meadow, now, inSight, view?)` → `Shedding['shed'] |
  undefined`. It calls `shedding`, then `roomFor(..., near)` per seed
  against the meadow grown so far, parent by parent. Tested in
  `shedding.test.ts` over `opened(...)` stands, including the
  `meadow-rules` checks on the result.
- New: `ui/scene/spore-drift.ts` (C10).
- Edit: `ui/scene/mushroom-shown.ts` (the `Shown` carries `sprout`).
- Edit: `ui/scene/mushroom-bed.ts` (scale, visibility, `plantedAt` from
  the sprout, the `reconcile` branch, `inSight()`).
- Edit: `ui/scene/meadow-scene.ts` (at most 3 lines; the tick is
  dispatched with `shedIn`'s result only while `shedding` says a shed is
  due).
- Look at frames with `/preview` or a `--no-build` play, in both themes,
  at tabL and phoneP.

**Step 3: the probe, the play and the sweep.**

- Edit: `scripts/lib/mushroom-probe.ts`: `sprouts()` → `[{ id, parent,
  scale }]`, with its schema.
- New: `scripts/lib/play-sprouts.ts`, registered in `play-mushrooms.ts`
  as the play `sprouts`. On a fresh meadow it taps a cloud and steps to
  `STOP + SPORE_FALL + EMERGE`, then checks:
  - 1–3 new mushrooms;
  - each of the parent's species, within `reach` of it;
  - scale ≈ `SPROUT_START`;
  - after about 300 more frames, larger than before;
  - the shed frame's cost reported, and the median under budget.

  It shoots `sprouts-1-shed` and `sprouts-2-grown`. It is a play of its
  own, not an addition to `play-rain.ts`, which shelter is likely to
  extend.
- Edit: `ui/scene/visit-play.ts` (`opened(..., showers?)`) and
  `scripts/sweep-mushrooms.ts` (`--showers`).
- Report the sweep with and without showers (R1).

**Collisions with the parallel shelter package.**

- **Shelter's files, which sprouting does not touch:**
  - `model/flight-habits.ts`, `model/perch-room.ts`, `model/insects.ts`,
    `model/flight*.ts`, `model/insect-*.ts`;
  - `ui/scene/perch-sight.ts`, `perch-hosts.ts`, `perches.ts`,
    `insect-*.ts`, `air-spots.ts`;
  - `scripts/lib/play-rain.ts` and every flier play;
  - `mushroom-bed.ts`'s `capTop` (:268-281) and any cap-underside host
    builder beside it.
- **Shared files:**
  - `model/game.ts`, where shelter may need `perchesOf` to carry the rain;
  - `mushroom-bed.ts`, in disjoint hunks (sprouting: `reconcile`, `update`,
    a new `inSight`; shelter: next to `capTop`);
  - `meadow-scene.ts`;
  - `mushroom-probe.ts`.

  The line budgets in R8 are what keeps these merges clean. The orchestrator
  should give each package an explicit line allowance in `game.ts`,
  `mushroom-bed.ts` and `meadow-scene.ts`.
- **Interface.** Shelter does nothing about sprouts in this bite. If it
  later wants to skip small caps, `model/sprouting.ts`'s `sproutScale` is
  the one place to ask, so the sprouting model step should land first.

## DRY notes

- **Reused:**
  - `pickFoot`, `roomFor`, `isCrowdedAt` and `grownOn` for placement;
  - `puffFrom`, `puffSpores` and `PALETTE.spore` for the spores;
  - `emerge` for the pop;
  - `saltedStream` and `nextSeed` for the seeds;
  - the `Plot.room` and `grow` pattern for "the scene finds room, the
    model decides";
  - `opened` for the tests and the sweep;
  - the `meadow-rules.test.ts` checker for sprouted meadows.
- **New and shared, one home each:** `model/sprouting.ts` owns the clock
  function and its constants, which the bed, the probe and the play import.
- **Not extracted:** the sprout trail's arc stays in `spore-drift.ts`,
  because `puffSpores`' rings drift up and open, and folding a falling path
  into it would put a mode flag on its one other use. A second kind of
  `roomFor` for a single species is not written either; the four-species
  trial is the existing path.
