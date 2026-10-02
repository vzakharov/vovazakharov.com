# Syama's mushroom game

The whole game at `/mushrooms`, from Syama's drawing and voice notes (spec in
issue #65): a meadow of fly agarics, each with a mouse house, where a press
grows another mushroom and a press on a bug button flies one in — every
mushroom and every insect grown from its own seed, so a forest of them is all
different trees. No goal, no text, no failing: the player is six, and the
point, in his words, is to watch the butterflies, flies and bees.

Four people's loves go into it, in the operator's words: "от Сямы идея, от
меня любовь к процедуркам, от Золтана к экологии, от Лейсан к Мандалам" —
Syama's idea, the operator's procedural generation, Zoltan's ecology and
Leysan's mandalas.

The bar is the operator's: on a phone or tablet it looks and moves like a
casual mobile game — Angry Birds was the reference — and it is beautiful,
atmospheric and comfortable for a six-year-old's hands. One PR (#57), eaten a
bite per session; the PR closes #65.

## How this elephant is eaten

The operator delegated the whole loop and does not step in until the end
("весь процесс должен пройти полностью автономно, без единого моего
вмешательства"). Every session on this branch follows it:

1. A session takes a bite (`/go`), builds it, and reviews it in its own
   tail (step 2), then folds it into `## Eaten so far`
   as its own `mushroom-game-syama/bite-<nn>.md` and an index row, and
   rewrites the summary above the index rather than appending to it
   (`.claude/skills/plan/elephant.md` § "The plan's shape": past 450 lines,
   back under 400; an open bite's settled history goes to topic files in
   `mushroom-game-syama/bite-<nn>/`), runs `/polish` and `/pr`, publishes
   the Artifact (below), pauses the plan,
   then relays `/go` for the next bite when its context is spent.
2. **The review is a subagent in the bite's tail, not a session of its
   own.** Separate review and `/handle` sessions cost about 40% of the
   spend and doubled the relays, while what reviews caught came from fresh
   eyes on frames, which a subagent has too (the operator, asked whether
   review → handle earns its keep: «да»). A reviewer agent briefed with only
   the bite's diff, the plan's decisions and the frames — nothing of the
   build — reviews **that bite's commits** as the operator would:
   `writing/notes/the-five-percent.md` is the reading list (the frame taken
   as given, an account standing in for running it, reasoning written into
   the artifact, the copy edited instead of the fact, the render checked
   against intent rather than the page), and it plays the page before
   judging the look. It posts one PR review with inline comments; the same
   session fixes each finding and replies on GitHub (never resolving), or
   hands them to the next bite's session as its first work when the budget
   is spent. A structural bite (12b) keeps a review session of its own.
3. After the last bite and its review is handled: `/relay /finalize`. No
   merge.

**The relays stay relays.** A chain stops at eight sessions deep — about
three bites (bites 1–3 took ~3½ hours, 4–6 ~13) — and the operator restarting
it every eighth session is part of the loop, not a defect to engineer away
("менять relay на что-то другое в этот подход megabeast-a точно не надо").
Each relay summary carries the chain's depth, and the session at the cap
hands the operator the one line to paste into a fresh session.

Standing rules for every session in the chain:

- **`writing/notes/the-five-percent.md` is frozen** — read, never appended:
  every review here is an agent's, and the file only counts what a human
  caught ("пятипроцентник зафиксируй и НЕ пополняй, учитывая что все код
  ревью будут НЕ от меня").
- **Never merge.** `finalize` runs without `and merge`.
- **Every session and subagent in the chain runs on Opus, named
  explicitly** — `create_session` with `model: "claude-opus-5-5"`, every
  `Agent` call with `model: "opus"` — never left to inherit, because the
  operator's own default is Sonnet ("в этой задаче все новые должны идти
  опусом"). A cap-depth hand-off tells the operator to start the fresh
  session on Opus.
- **`.claude/skills/megabeast/notes/` is filled at the end of every
  session, before its relay**, each note in the file for its theme (the
  `README.md` indexes them): what the session found that would make this
  loop repeatable and better, toward a future skill ("файлик будущего
  скилла, который будет это всё автоматизировать (рабочее название
  megabeast). Не сам скилл, а именно соображения"; "заполнять в конце каждой
  сессии перед релеем"). It outlives the plan and is not swept.
- **Stop and ask only for the unrecoverable** — the operator's line is
  "взломать весь интернет, стереть мой локальный диск". Everything else is
  decided, written into this plan as the decision, and carried on.
- **A play run fixes the game, and hands the operator what it cannot
  check.** «если прогон находит баг в игре, он чинит баг. Если прогон
  находит баг в самом себе — проверить какое-то место очень сложно
  программно — он передаёт оператору (через тебя)». So a red that is the
  game's is fixed in the same run; a red that is the harness's own — a
  check too hard to make right in code — is not engineered further: it goes
  to [to-check.md](mushroom-game-syama/to-check.md), in Russian, as what a
  person should look at, and the check is dropped or loosened. Every
  package also adds its own hand checks there, kept from session to
  session and checked when the operator gets to it. The scenarios stay
  short: a screenshot looked at by eye is the model, not a three-storey
  script («не трёхэтажные сценарии»).
- **Every bite ends by committing the frames worth showing** — picked from
  `tmp/play/`, not the whole run — to
  `docs/remove-before-merging/frames/bite-<n>/`, so the operator can look in
  on them between bites ("хранить всякие скриншоты в remove-before-merging
  вместо tmp, хочу периодически на них посматривать"; "в конце каждого куска
  выбирать те что достойны показать"). A handled review's fixes count as
  their bite's, and land in the same directory. `/finalize` sweeps it.
- **Every bite ends with the game published as an Artifact**, updated in
  place at one URL posted on the PR, so the operator can play each bite
  without installing anything ("атефакт в конце каждого байта, чтобы по ходу
  дела тоже можно было тестировать без установки"). A handled review
  republishes it. The recipe: a single self-contained HTML,
  esbuild over the scene entry, Phaser from `cdn.jsdelivr.net/npm/`, built
  under `tmp/` and not committed; the build script is committed, since
  `tmp/` does not survive a relay. The first session to reach a bite's end
  writes it.

## Decisions the whole game carries

The palette, sizes, engine and every other call the whole game stands on:
[mushroom-game-syama/decisions.md](mushroom-game-syama/decisions.md). Read it
before a bite that adds a creature, a control or a look.

## Eaten so far

The game as it stands, then an index whose rows point at each bite's full
contract under `mushroom-game-syama/`. Each bite's end rewrites this summary
rather than appending to it, and a bite opens only the files its slice
touches. Paths below are under `src/pages/mushrooms/` unless they say
otherwise.

**What a child sees.** `/mushrooms` opens on a sunny meadow drawn in Syama's
indigo ink: a rosette sun in a gold halo, drifting clouds, three hill ranges
misting toward the air, lit ground in a lawn of grass tufts that sway in a
travelling gust. Two spotted fly agarics stand as one clump, feet close and
caps leaning apart, on a field with no edge that the child walks: the sun,
the clouds and the hills go round as she turns, the sun her compass and the
light on every cap and petal turning with her, and at the far edge a round
brow with a fringe of blades, behind which far things sink foot first and
pale as they go. Past the opening clump the field is grass, gently dappled,
until the child plants it. Every mushroom, flower and insect grows from its
own seed, so no two visits match. No text, no goal, no failing; every tap answers at once with
motion and sound.

**What a child can do.** A drag past a 24 px slop turns her (within 45° of
horizontal) or steps her along the heading; held `←`/`→` turn and `↑`/`↓`
walk, eased, with a bob and soft alternating footsteps. A tap wobbles a
mushroom, puffs spores and selects it. `+` opens a picker of four species —
fly agaric, porcini, chanterelle, russula — and grows the pick where it has
room in the current view, up to twelve within sight and 96 on the field;
where none does, facing bare ground
included, `+` shakes its head with a "nuh-uh". `−` sinks the selected or the
newest. The house button furnishes a cap with windows from Syama's row and
its stem with a door, where a mouse now and then peeks out, or comes at once
to a tap with a squeak. The butterfly, fly and bee buttons fly one in over
the brow (4/3/3 at most, the oldest leaving): butterflies
drink at flowers and rest on caps, flies favour the fly agarics, bees carry
pollen and plant a flower in a ring round one they visited. A tap on a
resting insect sends it off and goes through to what it sat on. Every
flower is a note or a drum, darker being lower, played by a tap (a retap
restarts its bounce), by several fingers at once as a chord, or by the
keyboard through the flowers in view; every grass tuft is a planting spot,
a tap opening a two-stage picker (colour, then shape) whose exact flower
grows there (bite-10.md), or a note key plants the flower that sounds it.
A long press on a flower opens the picker on it, ringed, with a cross: a
pick or a key replaces it, the cross pulls it, leaving a tuft (bite-12.md).
A mute pictogram sits top left.

**Pure model, reconciling scene.** `model/` is Phaser-free and under
`node:test`. `game.ts`'s `reduce` over the `Meadow` (growing, selecting,
furnishing, planting, releasing, startling, `tick`) is the only way the
state changes: the scene calls `dispatch`, diffs what comes back by id, and
skips reconciling when the same `Meadow` returns. Randomness enters only as
an injected `random.ts` generator. `motion.ts` (seconds) and
`insect-motion.ts` (ms) make every movement a pure function of the clock,
so a resize repaints into the objects on screen and never interrupts one.
`MUSHROOM_SLOTS` (12) caps the mushrooms within `D_SEE` of a new one and
`FIELD_MUSHROOMS` (96) the field, `FLOWER_SLOTS` (48) the flowers within
`D_SEE`, `INSECT_LIMITS` the fliers; and `Meadow.pulled` remembers every
flower pulled up or replaced. `meadow-scene.ts` only orchestrates the beds —
`mushroom-bed.ts`, `flower-bed.ts`, `insect-view.ts`, `house-view.ts`,
`controls.ts`, `hud.ts` — with `arrivals.ts` and `perches.ts` beside it.

**The world, the eye, the view.** One world `WORLD_ACROSS` (5.764) ground
units across on every screen (`ui/scene/meadow-camera.ts`). Every stored
foot is a plane point (`Footing`); the layout (`layout.ts`, CSS px) keeps
the opening frame, laid out once per screen size, for the opening clump and
its seeded flowers, and a thing grown elsewhere is laid at the clump's
distance in its own frame, so a step never repaints it; the zoom is the screen's, capped to
show the opening clump and floored where its narrowest cap is a finger
wide (`ZOOM_FLOOR`). The layout stands on a plane (`planeOf`, its angles
widened by `SPREAD`) seen from an `Eye {x, y, heading}` through a panoramic
lens (`viewOf`): linear in azimuth across, rows by distance, the ground bent
toward the sides by a fixed curve, a full turn 4 screens on tabL, the
opening frame exact at `OPENING_EYE`. The eye is the scene's pure state:
`model/pan.ts` a wrapping heading, `model/stride.ts` the step, both through `model/cruise.ts`, `model/walk.ts` the drag and
keys over them, `eye-input.ts`'s `EyeInput` the one screen↔eye home. Each
frame every bed `follow`s the `View` (`view.ts`, `bed-place.ts`), culled
nearer than `V_NEAR` and off the screen's sides; every rule judges from
the snapped eye (`model/anchor.ts`, `anchoredGround`) and reads only what
stands near it (bite-12b.md). Light turns with the heading
(`headedLight`), each bed relighting through its repaint queue. The camera's `scrollY` is only the walk's bob. Past
`D_SEE` a thing sinks under a round brow by its distance (`brow.ts`) and
pales; haze follows distance through `repaint-queue.ts`. The sun, glow, wash
and clouds stand at azimuths (`panorama.ts`), the hills are live round 360°,
the ground screen-fixed rows that, with the brow, take the walk's bob
(bite-12.md), dappled by mottles on the plane (`mottles.ts`).

**Placement and taps.** A grown mushroom's foot is `pickFoot`'s best of up to 32 rounds of 12
candidates by its seed (`model/placement.ts`), which `roomFor` in
`mushroom-room.ts` checks — the meadow's rules from the current eye, cap and
stem cover (`cap-cover.ts`), door in sight, and the screen's as the current
view projects: on screen, off the controls and the sun's rays — and
`keptRoom` finds again when the meadow changes. Hit areas are at least
`TAP_RADIUS` 32 (`tap-reach.ts`), but a mushroom takes a tap only where it
is drawn (`model/mushroom-outline.ts`, `mushroom-tap.ts`), the front-most
taking it, and every grown one keeps a tappable patch that shrinks with the
screen's unit and with depth, floored at 6 px (`mushroom-patch.ts`). Flowers
stay put: the seeded bed is fourteen, each half of the world sounding C D E
G A, a kick and a hat (`flower-layout.ts`); bees and the child plant through
`flower-plots.ts` and `flower-sight.ts`; a long press opens the picker on a
flower (`flower-hold.ts`, `flower-ring.ts`); a bee's ring is an offset on
the plane round its parent (`ringFoot`). The grass is a lawn of tufts laid
by plane cells (`lawn.ts`), so a walk back finds the same grass, every tuft
a planting spot, none standing where no flower fits (`tufts.ts`,
`grass.ts`, `tuft-tap.ts`); a note key sows and plays only what no nearer cap covers
(`flower-cover.ts`). Insects fly on the plane, each leg timed in the frame
it is drawn in (`model/flight-frame.ts`), hovering at air spots on a plane
lattice round the eye (`air-spots.ts`); an insect perches within `D_SEE` of
the snapped eye, so it follows the child (`perch-sight.ts`), never two to a perch (`perch-room.ts`), its first
perch on screen (`model/flight-in.ts`), each kind's habits in
`model/flight-habits.ts`. Pickers unfold from their button (`picker.ts`) in
finger-sized rows (`picker-rows.ts`), hiding the buttons they cover where
the sky is short (bite-10.md); the flower picker's cross keeps off the sun
(`sky-layout.ts`).

**Generators and painting.** Genes and drawing are two modules per
creature. `model/`: `mushroom-genes.ts` (a gene table per species,
`HEAD_KIND` dome or trumpet), `mushroom-pose.ts`, `mushroom-profile.ts`,
`chanterelle-outline.ts`, `flower-genes.ts`, `insect-genes.ts`
(`INSECT_KINDS`, `GenesOf<K>`), `fly-genes.ts`, `bee-genes.ts`, `house.ts`.
The scene paints with `draw-*.ts`, `paint-dome.ts`, `paint-trumpet.ts` and
`paint-backdrop.ts` (`paint-sky.ts`, `paint-land.ts`, `skyline.ts`): the sky
rows, the ground rows and one grain texture baked once a paint (`baking.ts`)
in bands, the glow, sun and wash small bakes slid by azimuth, the hills and
the brow live Graphics redrawn on a turn; no filters or gradient fills. One light, `sunLight` (`model/light.ts`),
reaches every bed and painter; every ink comes from `inkFor` (`ink.ts`);
`palette.ts`, `palette-backdrop.ts` and `palette-creatures.ts` hold every
colour literal (bite-07.md, bite-08.md).

**Sound.** All synthesized: `sound.ts`'s `MeadowSound`, built on the first
tap's release and playing what was asked before it, with `synth.ts` and
`insect-voices.ts`, the footsteps (`footsteps.ts`) panned side to side; the
mute is remembered in `localStorage`.
`instrument.ts`'s `Instrument` plays `instrument-voices.ts`'s twenty voices
(`model/flower-sounds.ts`, `model/notes.ts`) through a compressor on master,
levelled by `part-loudness.ts` (bite-10.md).

**The play run, the sweep, the suite.** `pnpm play:mushrooms` builds a probe
export (`NEXT_PUBLIC_MUSHROOM_PROBE`) and drives every control over the
DevTools protocol on tabL, tabP, phoneP, phoneL and phoneS
(`scripts/lib/play-*.ts`, the probe and its schema in
`scripts/lib/mushroom-probe.ts`, which reads the eye: `__probe.eye()`,
`sun()`, `toScreen`/`toWorld`). Its plays — meadow, walk, planting,
species, tufts, hold, approach — each start on a fresh meadow (`--plays` picks them).
It fails on a page error, a wrong effect, a flier turning or relit too fast
(`flier-watch.ts`), a pop while walking (`play-walk.ts`) or a median frame
past 26 ms (`frame-budget.ts`); frames land in `tmp/play/`, one screen per
call (`--screens`, `--no-build`). `pnpm sweep:mushrooms` grows all 2000
visits on every `VIEWPORTS` screen. The suite runs a file at a time,
`fliers.test.ts` alone (~354 s).

**The Artifact.** `pnpm artifact:mushrooms`
(`scripts/build-mushroom-artifact.ts`) esbuilds the scene into one HTML
under `tmp/mushroom-artifact/`, Phaser from jsDelivr at the lockfile's
version, republished in place at the URL on the PR.

**What the next bites stand on.** Rain's weather is model state already
built (`model/weather.ts`, `Meadow.rain`; the rest in `rain.md`). Dusk is a
second set of `palette*.ts` colours through the baked backdrop and
`sunLight`, lit windows in `draw-house.ts`, mice from the house's peek
motion, fireflies a fourth `INSECT_KINDS` entry. Around the canvas, reduced
motion switches the clock functions' idle loops and the walk's bob off, the
hidden buttons dispatch from `ui/meadow-canvas.tsx`, and the home pictogram
is a `hud.ts` drawing placed by `layout.ts`.

The bites, each file its full contract:

1. **The meadow, still** — [bite-01.md](mushroom-game-syama/bite-01.md)
2. **The meadow alive, and heard** — [bite-02.md](mushroom-game-syama/bite-02.md)
3. **More mushrooms, and a forest** — [bite-03.md](mushroom-game-syama/bite-03.md)
4. **The mouse house** — [bite-04.md](mushroom-game-syama/bite-04.md)
5. **The butterfly** — [bite-05.md](mushroom-game-syama/bite-05.md)
6. **The fly and the bee — the MPP line** — [bite-06.md](mushroom-game-syama/bite-06.md)
7. **Atmosphere** — [bite-07.md](mushroom-game-syama/bite-07.md)
8. **Real mushrooms** — [bite-08.md](mushroom-game-syama/bite-08.md)
9. **The operator's two ideas weighed, and the meadow on the ground** — [bite-09.md](mushroom-game-syama/bite-09.md)
10. **The flowers as an instrument, and the child plants them** — [bite-10.md](mushroom-game-syama/bite-10.md)
11. **A wider meadow, panned** — [bite-11.md](mushroom-game-syama/bite-11.md)
12. **Walking the meadow** — [bite-12.md](mushroom-game-syama/bite-12.md)
13. **The meadow has no edge** (12b) — [bite-12b.md](mushroom-game-syama/bite-12b.md), contract [endless-field.md](mushroom-game-syama/endless-field.md)

## Rest of the bite

12b's tail. **Done:** the lawn re-tend spread a slice a frame (838b087),
the mottles at tone 0.7 / alpha 0.4 (4605c4a), the planting play's two
harness reds (25fae6b), a take-off from a perch out of sight timed from
where it was drawn (3c7d9b6), `fliers.test.ts` whole and green after it.
**Left**, in order (`docs/remove-before-merging/bite-12b/tail-screens.md`):
the probe timing `retend`/`tendOn` into `hitches.tend`; one tabL `veer` to
confirm the reordered releases and `DASH_SLACK` 1.15; tabL's red
`play-insects.ts:343` (no butterfly rests on a cap to tap through); every
play on tabP, phoneP, phoneL and phoneS, **one screen per agent and one
play per call**; then `/polish`, frames, the Artifact, `/pr`, and 12b's
own review session. Each package's commits and the orchestrator's calls:
`docs/remove-before-merging/bite-12b/waves.md`.

## Rest of the elephant

In order.

**The rest of idea 1 is item 15.** Bites 9, 11, 12 and 12b built the
ground, the wide world, walking it and its endlessness; the map comes
after the rain's aftermath («карту можно отложить до после после дождя»).
`docs/remove-before-merging/ideas/idea-1-walking-meadow.md` is its spec,
its «Что ты решил» section overriding the body.

**Open:** near-square windows of ~320–360 px each way (no phone has one)
fit no finger-sized picker row: it overlaps `−`, and `+` stands below the
ground; no test covers them. The play run shoots no 568×320 screen, so the
tests alone hold it. On tablets the front mushroom's stem can run to the
bottom edge. On phoneP one planted flower reads larger than its neighbours
at the same depth. The play run shoots no refused `+` and no bees planting
in a full forest. A flower still drawn past the brow takes a
tap on the covered part of its head. The sky may read a little plain since
bite 7 tamed the halo. Carried from bite 6: fliers are kept apart where
they sit and hover, not in flight, so a flier crossing the meadow is drawn
straight over one seated on a cap (frame
`phoneL-butterfly-crosses-one-on-a-cap.png`); a butterfly making way for a bee
leaves its flower moments after landing, which may read as a twitch; a
flier holding an air spot is drawn still, with no hover bob.

13. **Rain** — the shower itself; what it leaves behind is item 14. Its
    contract, the model already built (5c9f2e9):
    [rain.md](mushroom-game-syama/rain.md).

14. **After the rain.** While it rains, insects shelter under the nearest
    cap (a perch in `flight-habits.ts`, clear of the world's edge as every
    perch is, `perch-sight.ts`); when it stops, spores an old mushroom shed
    sprout into little mushrooms that grow over the next minutes through
    `pickFoot` and `roomFor`, within `MUSHROOM_SLOTS` — the first thing the
    reducer's `tick` grows.
15. **The map.** A map view and its button take the mute's circle, which
    anchors the layout; the mute and its `localStorage` memory go with it
    (sound off is the device's), `settle()` staying. It reads where the
    child stands and faces from `EyeInput`.
16. **Dusk.** The dark scheme is dusk: the sky, dimmer hills, windows
    glowing, fireflies waking, mice coming out of their doors, butterflies
    folded on the caps and flowers closed for the night.
17. **Around the canvas.** A way home as a pictogram; `prefers-reduced-motion`
    (idle loops off, the walk's bob off, short tweens without overshoot); a
    visually hidden row of HTML buttons beside the canvas dispatching the
    same actions, for assistive tech; a home-page link in the footer's
    `SEE_ALSO` if that list carries side projects, none otherwise. Then, the Artifact republished,
    `/relay /finalize`.

## DRY notes

The reuse calls the whole game stands on are in
[decisions.md](mushroom-game-syama/decisions.md) § "DRY notes"; a bite with a
reuse call of its own carries it in its own file.
