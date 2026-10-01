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
   (`.claude/skills/plan/elephant.md` § "The plan's shape"; split at 1001
   lines on the operator's «ого его раздуло. надо разбивать»), runs `/polish` and `/pr`, publishes the Artifact (below), pauses the plan,
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
caps leaning apart, in a glade the child stands in and walks: the sun, the
clouds and the hills go round as she turns, the sun her compass, and at the
far edge a round brow with a fringe of blades, behind which far things sink
foot first and pale as they go. Behind the opening view the glade is bare
grass. Every mushroom, flower and insect grows from its own seed, so no two
visits match. No text, no goal, no failing; every tap answers at once with
motion and sound.

**What a child can do.** A drag past a 24 px slop turns her (within 45° of
horizontal) or steps her along the heading; held `←`/`→` turn and `↑`/`↓`
walk, eased, with a bob and soft alternating footsteps. A tap wobbles a
mushroom, puffs spores and selects it. `+` opens a picker of four species —
fly agaric, porcini, chanterelle, russula — and grows the pick where it has
room in the current view, up to twelve; where none does, facing bare ground
included, `+` shakes its head with a "nuh-uh". `−` sinks the selected or the
newest. The house button furnishes a cap with windows from Syama's row and
its stem with a door, where a mouse now and then peeks out, or comes at once
to a tap with a squeak. The butterfly, fly and bee buttons fly one in from
the nearer screen edge (4/3/3 at most, the oldest leaving): butterflies
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
`MUSHROOM_SLOTS` (12) caps the forest and `INSECT_LIMITS` the fliers; a
flower grows wherever one has room, and `Meadow.pulled` remembers every
flower pulled up or replaced. `meadow-scene.ts` only orchestrates the beds —
`mushroom-bed.ts`, `flower-bed.ts`, `insect-view.ts`, `house-view.ts`,
`controls.ts`, `hud.ts` — with `arrivals.ts` and `perches.ts` beside it.

**The world, the eye, the view.** One world `WORLD_ACROSS` (5.764) ground
units across on every screen (`ui/scene/meadow-camera.ts`), stored in
`model/ground.ts`'s `Ground {x, z}` and laid out once per screen size for
the opening eye (`layout.ts`, CSS px); the zoom is the screen's, capped to
show the opening clump and floored where its narrowest cap is a finger
wide (`ZOOM_FLOOR`). The layout stands on a plane (`planeOf`) seen through a
pinhole from an `Eye {x, y, heading}` (`viewOf`), which at `OPENING_EYE`
reproduces the opening frame exactly. The eye is the scene's pure state,
not the `Meadow`'s: `model/pan.ts` is a wrapping heading (`TURN_CRUISE`
0.38 rad/s), `model/stride.ts` the step (`STRIDE_CRUISE` 1.6 units/s inside
the `GLADE` rim, centre (0, 8) radius 12), both through `model/cruise.ts`,
and `model/walk.ts` the axis-locked drag and the keys over them, with
`eye-input.ts`'s `EyeInput` the one screen↔eye home. Each frame every bed
`follow`s the `View` (`view.ts`, `bed-place.ts`): position, scale by
`zoom`, depth by screen row, culled nearer than `V_NEAR` 2; the camera never
scrolls across, its `scrollY` only the walk's bob (`walking.ts`). Past
`D_SEE` (13.33) a thing sinks under a round brow by its distance (`brow.ts`,
`browRow`) and pales; haze follows distance through `repaint-queue.ts`, at
most two repaints a frame. The sun, its glow and wash and the clouds stand
at azimuths (`panorama.ts`), the hills are drawn live round 360° and the
ground is screen-fixed rows; controls and pickers stay on the screen
(bite-12.md).

**Placement and taps.** A grown mushroom's foot is `pickFoot`'s best of 32
candidates by its seed (`model/placement.ts`), which `roomFor` in
`mushroom-room.ts` checks — the meadow's rules at the opening eye, cap and
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
flower (`flower-hold.ts`, `flower-ring.ts`). The grass is a lawn of tufts,
every one a planting spot, none standing where no flower fits (`tufts.ts`,
`grass.ts`). Insects fly in the opening eye's layout px and are drawn
through the view at a foot row; an insect perches only clear of the world's
edge (`perch-sight.ts`), never two to a perch (`perch-room.ts`), its first
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
species, tufts, hold — each start on a fresh meadow (`--plays` picks them).
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

**What the next bites stand on.** Rain falls from clouds at their azimuths
onto the ground, so a cloud is tapped where the view draws it and a drop
lands through the view (`ofGround`); the rainbow stands opposite the sun.
Its weather is model state already built (`model/weather.ts`,
`Meadow.rain`); the sprouting spores
grow through `pickFoot` and `roomFor` under `MUSHROOM_SLOTS`, sheltering is
a perch in `flight-habits.ts`, and closing flowers and swelling caps are
clock functions in `motion.ts`. Dusk is a second set of `palette*.ts`
colours through the baked backdrop and `sunLight`, lit windows in
`draw-house.ts`, mice from the house's peek motion, and fireflies a fourth
`INSECT_KINDS` entry. The map reads the eye from `EyeInput`. Around the
canvas: reduced motion switches the clock functions' idle loops and the
walk's bob off; the hidden HTML buttons dispatch the same
actions from `ui/meadow-canvas.tsx`; the home pictogram is a `hud.ts`
drawing placed by `layout.ts`.

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

## Rest of the elephant

In order.

**Bite 11's review (5373085053) is handled**: every thread answered, the
play run green on all five screens, its frames in
`docs/remove-before-merging/frames/bite-11/`, the Artifact at version 12.

**The rest of idea 1 is 12b and item 15.** Bites 9, 11 and 12 built the
ground, the wide world and walking it; the map comes after the rain's
aftermath («карту можно отложить до после после дождя»).
`docs/remove-before-merging/ideas/idea-1-walking-meadow.md` is the spec of
both, its «Что ты решил» section overriding the body, and
`docs/remove-before-merging/bite-12/step-spec.md` § 3 sketches 12b.

**Open:** near-square windows of ~320–360 px each way (no phone has one)
fit no finger-sized picker row: it overlaps `−`, and `+` stands below the
ground; no test covers them. The play run shoots no 568×320 screen, so the
tests alone hold it. On tablets the front mushroom's stem can run to the
bottom edge. On phoneP one planted flower reads larger than its neighbours
at the same depth. The play run shoots no refused `+` and no bees planting
in a full forest, and of bite 12's checks it does not play the walk up to a
back-row mushroom (its haze cleared, a tap on its drawn cap), an insect
after a 180° turn, or the frame budget walking into the forest. The
footstep's level (`STEP_PEAK`, ~10 dB under a C5) wants the operator's ear.
At the opening, a thing laid past the brow near a screen's side starts
partly sunk (phoneL, desktop). A flower still drawn past the brow takes a
tap on the covered part of its head. The sky may read a little plain since
bite 7 tamed the halo. Carried from bite 6: fliers are kept apart where
they sit and hover, not in flight, so a flier crossing the meadow is drawn
straight over one seated on a cap (frame
`phoneL-butterfly-crosses-one-on-a-cap.png`); a flight in from off screen
still takes up to 5 s for a butterfly; a butterfly making way for a bee
leaves its flower moments after landing, which may read as a twitch; a
flier holding an air spot is drawn still, with no hover bob.

12b. **The meadow has no edge** («ну да, бесконечный»): bite 12's glade
rim (`GLADE` in `model/stride.ts`) goes, and the field runs on wherever the
child walks. **Nothing grows on it but grass until the child plants it**:
the opening clump and its seeded flowers are the whole of what the game
sows, and every other mushroom and flower is his («ничего кроме стартовых
двух грибов и скольки-то там цветков быть не должно, всё остальное ребёнок
засевает сам… там пустое поле пока он туда что-то не посадит»). The grass
is the field's, laid as the child walks, every tuft a planting spot by
bite 12's rules (`tufts.ts`), judged where the child stands rather than at
the opening eye. The map (item 15) shows the surroundings rather than a
whole world, and helps the child find his way back to his own mushrooms;
the twelve-mushroom cap becomes a cap per area. The operator plays only
the finished game, so bite 12's rim is never something a child meets.
What it takes:

- **The store on the plane.** `Ground {x, z}` cannot write a point behind
  the opening eye, so stored positions (`Planted.foot`, the flower feet,
  `pickFoot`'s candidates) become plane points, the layout keeping the
  opening frame for the clump only; `+` and planting work anywhere in front
  of the child (`roomFor` already judges the screen by the view), and the
  patch and room rules judged at the opening eye move to the current one.
- **Light by heading** through bite 12's repaint queue (a high sun, side
  component `sin(heading − α_sun)`), and the ground's **mottles back as
  objects on the plane**, gone since bite 12 made the ground screen-fixed
  rows.
- **The insects on the plane.** Legs with height, air spots round the eye,
  entry from the view's edge, take-offs panned by azimuth; the layout-px
  adapter in `insect-view.ts` retires, and with it bite 12's accepted cases
  (a leg ending behind the eye hidden for that stretch, a release facing
  away flying in unseen, `onscreenOf`'s x-only test).
- **Clear-outs bite 12 left:** `parallax.ts` and `skyline.ts`'s
  `groundSeam`, alive only for `ground-seam.test.ts`; `sun-layout.ts`'s
  `nearestTheSun`, alive only for `meadow-rules.test.ts`; `visit-play.ts`'s
  `openingCrop`, which returns a `View`; `model/motion.ts`'s `rebloom`, dead
  since a retap restarts.
- **Open for the operator:** what replaces the twelve-mushroom cap once the
  whole field can be sown.

13. **Rain** — the shower itself; what it leaves behind is item 14. Cut
    there because item 12 as written was four packages (weather, the
    shower's look and sound, shelter, sprouting), and a bite past two runs
    into the budget notice (`.claude/skills/megabeast/notes/pickup-and-relay.md`).

    **Behaviour.**
    - **A tap on any cloud starts the rain.** The tapped cloud darkens
      first and the others follow within ~0.6 s; the sky and land dim under
      a slate wash; rain falls across the whole screen, densest under the
      tapped cloud, which turns with it as the child does (a cloud stands at
      an azimuth, `panorama.ts`). The weather is the meadow's, not a
      cloud's: one shower at a time, so flowers everywhere close at once, a
      cause a child reads without a word.
    - **It lasts `RAIN_MS` 10 s; a tap on a cloud while it rains restarts
      the 10 s** and gives that cloud a wobble and a gush of drops under
      it, so the tap always answers (decisions: "No tap is ever answered
      with a shrug"). A cloud tap is a tap on the meadow, so it shuts the
      flower picker, as a flower tap does.
    - **Drops** are short slanted streaks across the screen, at most ~120
      at once. Where one lands it splashes as a small ring (decisions:
      mandala ornament): on a cap's top where the drop's column crosses a
      drawn cap, otherwise on the ground at a distance picked from the view.
      Splashes are placed through the view (`ofGround`), so they sit on the
      ground as the child turns and walks.
    - **Sound**: a soft hiss of filtered noise with a patter of tiny ticks,
      fading in over ~1 s and out with the rain; a cloud tap answers with a
      low soft whoosh. Synthesized in `synth.ts`'s manner, silent under the
      mute; level above ~300 Hz checked by rendering (play-run note "Sound
      is reviewed by rendering it").
    - **While it rains** every flower closes — petals folded up toward the
      centre over ~1.5 s, reopening as it stops — and stays playable as an
      instrument; every mushroom's cap swells ~6% and settles back. Both
      are clock functions of the shower, so a resize or a walk never
      interrupts them. Insects carry on as before this bite.
    - **When it stops** the wash lifts and a rainbow fades in over the sky
      opposite the sun (at `α_sun + π`, so the child turns her back to the
      sun to see it), as concentric bands, holds ~8 s and fades over ~3 s. A
      new tap on a cloud while the rainbow shows starts a new shower and
      fades it out.

    **Model — built (5c9f2e9), before walking took bite 12.** `Meadow`
    has `rain: Rain | undefined`, `{ startedAt, stopsAt }` in the insects'
    ms clock (not `start`, which `pan.ts` holds as a position);
    `{ kind: 'rain' } & Timed` starts it or pushes `stopsAt` to
    `now + RAIN_MS` and shuts the flower picker. `model/weather.ts` gives
    `raining`, `wetness`, `downpour` (drops, on over 0.6 s, off at
    `stopsAt`) and `rainbow` as pure functions of the span and the clock;
    `tick` is untouched. Left to the scene: the rainbow a new shower
    starts under drops to 0 at once, so its fade-out is the scene's to
    hold; drops in the air finish falling after `stopsAt`.

    **Scene.** A rain bed module (`rain-view.ts` and what it needs beside it)
    owns the cloud hit areas, the darkening, the wash, the drops, the
    splashes and the rainbow; `meadow-scene.ts` (429 lines) only wires it,
    staying under ~450. Cloud hit areas are the cloud's circle where the
    view draws it, at least `TAP_RADIUS`, the lowest priority: a control, a
    mushroom, a flower or an insect over a cloud takes the tap. Closing petals in `draw-flower.ts`,
    the swell where the caps are scaled; colours in `palette-backdrop.ts`
    (wash, dark cloud, rainbow bands). The probe exposes the shower
    (`__probe`), and `pnpm play:mushrooms` taps a cloud on every screen,
    steps through the rain and the rainbow, checks `rain` is set, the
    flowers closed mid-shower and open after, and holds the 26 ms frame
    budget with the drops falling.

    **DRY notes.** The weather's clock functions join `motion.ts`'s
    pattern (pure functions of seconds or ms) in their own module, since
    `motion.ts` is per-creature motion and weather is the meadow's. Splash
    rings reuse `spores.ts`'s particle manner where it fits rather than a
    second particle helper. The rain's sound is built from `synth.ts`'s
    primitives; no new audio graph beside `MeadowSound`.

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

## Rest of the bite

Built: steps 0–P4, the seam and the round brow, a key planting, the
arrivals and the dash cap, the subagent notice, the panoramic lens and the
items it carried — each with its sha, its note under
`docs/remove-before-merging/bite-12/` and what it beat, in
`docs/plans/mushroom-game-syama/bite-12-log.md`. Every build agent works in
its own `git worktree` (`brief-common.md` § "Your own worktree").

**Re-decided, from `lens-carry.md` round 3: insects fly and are sized on the
plane, not in the layout.** The past-the-edge start did not hold: every leg
is flown in the layout (the opening eye's screen), and looking back the
screen shows only the layout's two far ends with the no-row wedge between,
so a leg across the screen runs through the meadow in front of the opening
eye and is drawn on 0 of 201 samples; and an insect is sized by its row's
distance from the opening eye, which falls to 0 looking back, so every
insect, a perched one too, shrinks toward the screen's middle (zoom 0.05–0.6
at π) while its cap keeps its size. Both are the layout standing in for the
world, which the lens and walking made wrong away from the opening; the
0.76% release was the symptom. So a leg's points are plane points, and an
insect's drawn size is its own size over its distance from the eye.
Beaten: sizing by distance alone (fixes the size, not the legs through the
meadow); a zoom floor (the bound beaten in the log's round-2 decision, a tenth-size insect); the
past-the-edge patch alone (`lens-carry-round3.patch`, never seen with no
perch shown). A spec first (`insect-plane.md`), then build packages.
**Decided, with the operator: an insect's size at the opening goes by its
distance too** («ну да, а звучит хорошо»), so the opening's equal sizes go:
a release over the brow at 0.65× today's, perched insects 0.65× on the back
caps to 1.1–1.5× near the front, each in scale with its cap and the brow.
Beaten: sizing by distance from the plane's origin (today's sizes at the
opening, but a perched and a flying insect at one distance differ, and
sizes drift as the child turns).
**Decided, with the operator: a leg veers round the eye** («да, 1 — ок»)
at the distance where an insect's zoom reaches today's `V_NEAR` value
(~1.7×), so a fly passes the child's ear rather than through his head and
never fills the screen. Beaten: a zoom cap on a straight leg (a flat sticker
sliding across the screen).
**Open with the operator's play: flies and bees still fly «неприлично
быстро» on a long leg.** `dash-cap.md` caps a dash at the kind's dash
across the screen it flies on, which is still ~3 screens a second for a
fly and ~1.8 for a bee on the tablet, and a long leg always reaches the
cap. The cause is `paced` (`flight-timing.ts`): a leg's time is the kind's
`flying` time stretched with its strides only up to `slowest`, so past that
every longer leg takes the same time and flies faster. The operator: «а
почему они вообще должны летать тем быстрее, чем больше путь? вроде в жизни
муха летит себе и летит». **Decided: a leg's time is its length at the
kind's own pace** (a `stride` per `flying` time), with no ceiling, so a
long leg simply takes longer; a fly's darting stays a shape within that
time (bursts and hovers that average to its pace), never a speed-up for
distance. Measured as the speed seen on screen under the plane's sizes.
Beaten: halving the dash cap (still faster the longer the way, only less);
leaving it (the complaint stands).

**Left, in order:**

1. The insect-plane spec (`docs/remove-before-merging/bite-12/insect-plane.md`),
   then its build packages: the three decisions above.
2. The five-screen play run at the final HEAD, one screen per call, its frames
   committed (`play-final.md`; ~9 min on tabL): spec §4's opening identity, the
   walk to a back-row mushroom and a tap on its drawn cap, an insect after
   180°, the frame budget walking into the forest; the phoneL edge flower
   judged (`brow-round.md`).
3. The footstep level (`STEP_PEAK`, ~10 dB under a C5), for the operator's ear.
4. The review subagent (§ "How this elephant is eaten" step 2) and its fixes.
5. Delete this section; `/polish`, vet, the Artifact, `/pr`.

## DRY notes

- **Metadata reuses `constructMetadata` wholesale**, as the music page does;
  with no locale there is no `hreflang` map to build.
- **The route is one line and the sitemap one key**, `PAGE_ROUTES` already
  feeding `sitemap()`.
- **The game shares nothing below the page with the rest of the site, on
  purpose.** No other page has a canvas, an engine or a generator, so a
  `shared/game` segment or `features/` slice would have one consumer and fail
  Steiger's `insignificant-slice`; `Mushroom` and `Insect` are not
  `entities/` slices for the same reason.
- **Genes and drawing are two modules per creature** — one is tested, the
  other looked at. `random.ts` is shared by every generator, which is why it
  is its own module from bite 1.
- **`Seeded = { seed: number }` and `WithId` are the bases** `Mushroom` and
  `Insect` both intersect, so `pnpm type-overlap` holds as the second
  creature arrives.
- **Numbers and colours have one home each**: `layout.ts` positions and sizes
  everything, `palette.ts` holds every base hue; a per-instance nudge is a
  gene.
