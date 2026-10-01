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

**Built so far** (each package's hand-over note under
`docs/remove-before-merging/bite-12/` names its API and departures; the
departures were taken):

- Step 0: the eye and pinhole view (`model/ground.ts` `Eye`, `viewOf`;
  `ui/scene/view.ts`), `model/cruise.ts`, the heading pan, `model/stride.ts`
  (`step0-eye.md`, `step0-cruise.md`).
- P1: the grass is a lawn again, every tuft a planting spot (81ffe900); the
  beds `follow(view)`, the retap restart, the haze queue (`p1b-beds.md`);
  the grass through the view (21d9fc8f, `p1c-grass-taps.md`).
- P2: clouds in lanes so no view is empty, the sun, glow and wash by
  azimuth, the live hills (measured: ~0.5 ms a frame against a baked
  strip's ~100 ms rebakes), the land in screen rows without mottles
  (`p2-panorama.md`).
- P3: `model/walk.ts` and `eye-input.ts`, ↑/↓, footsteps, keys only
  through flowers in view (`p3a-input.md`); the scene wired, the bob,
  things past the seam behind the hills (0dfbc9e7, `p3b-wiring.md`); the
  insects through the view (579c7312, `p3c-insects.md`).

**Where the relay at depth 8 left it** (each line's note under
`docs/remove-before-merging/bite-12/`): `pnpm type-overlap`'s groups fixed
(5c7a7b43, `type-overlap.md`); `decisions.md` rewritten (b2fb9fd1); the
fold done — `bite-12.md`, the summary, row 12, the elephant reworded
(181167e8, 34354853); item 4b built (d4028a5a, `key-plants.md`); the
opening, approach and seat plays (4fa8349a); a perched insect drawn where
its cap or flower draws the seat, 0.00 px through a turn on tabL and
phoneP (c8c32263, `seat-fix.md`); the keys play and the probe's seat read
(9ac52e0f, b0a652bb) — tabL passes every play at b0a652bb but the frame
budget. **The frame budget fails on an idle machine** (33.5 ms median
walking into the forest and turning at the closest approach, against 26;
21.4 ms over the whole screen). **Decided: spec §5's mitigation, raise
`V_NEAR` first**, measured until the forest walk holds 26 ms, then judged
on frames that a near mushroom does not vanish too early for a child;
beaten: relaxing the budget, which is the measure the game keeps. Left:
the released-insect fix (below), the `V_NEAR` fix, then the five-screen
run at the final HEAD with its frames (`play-final.md`: split each screen
by `--plays`, the full set takes ~9 min on tabL), the phoneL edge flower
judged; then the review subagent (§ "How this elephant
is eaten" step 2) and its fixes; delete this section; `/polish`, vet, the
Artifact, `/pr`. **Also, by a subagent:** the context-budget hook gives a
subagent its own notice at ~170k from its own transcript — commit what
passes, note current, report — instead of exiting on `agent_id`
(operator: «сделай, подагентом в следующей сессии»; see
`.claude/skills/megabeast/notes/subagents.md`). **Every build agent works
in its own `git worktree`** in the scratchpad (outside the repo, `pnpm
install --offline` there), committing and pushing to the branch from
there with `git pull --no-rebase` first, so the shared checkout stays
clean, the Stop hook's git check stays quiet, and no agent's half-done
edit reaches another's typecheck (operator, after a first «не надо»:
«пусть делают в worktree, мы же от этого ничего не потеряем?»). The
common brief's shared-tree rules change with it.
**From the operator's play at the relay: «пару раз нажал на бабочку --
кажется, она каждый раз появляется за пределами экрана».** The operator
had not moved: «никуда не ходил, просто нажимаю бабочку, и она
медленно-медленно вылетает из-за кадра к цветку. остальные тоже из-за
кадра, но разумеется быстрее». So it is the fly-in itself: a release
starts off screen and the butterfly's cruise (two thirds of bite 5's) is
slow over that distance. **Decided: a release is seen at once and lands
soon** — it enters at the nearer screen edge of the current view (not past
it), its arrival leg flies faster than its cruise so it reaches its first
perch, on screen, within ~1.5 s, at every heading, as "every tap answers
within a frame" asks. Measure the start point and the leg's length first.
Beaten: a faster butterfly overall (the slow cruise is what lets a finger
catch one).
**Also from the operator: «кажется насекомые не изменяют размера при
движении вперёд-назад».** Walking toward a perched butterfly, the cap
grows and the butterfly does not. **Decided: an insect is drawn at its
depth's scale** — perched, at its host's drawn scale (the seat fix's
`Host`); in flight, at the scale of the view's depth at its ground point.
If flight scale needs 12b's plane, build the perched half here, stop, and
report the rest as 12b's.
Built, both halves (69d7c5f, 8cd4f07, `insect-arrive.md`): a release enters
with its middle on the nearer edge and its first leg to a perch in view is
cut to at most `ARRIVAL` 1500 ms (measured before: butterflies 4.3–8.8 s
median, up to 15.3); in flight an insect's zoom blends between its two
hosts' by the seat fix's weights, so nothing jumps at take-off or landing.
Taken: a far insect's tap circle never shrinks under `TAP_RADIUS` (catching
them is the child's game; caps and flowers do shrink theirs). Facing past
the strip, a release still flies in unseen — 12b's accepted case below.
**Re-decided, the operator's idea: a release drops in from above** («может у
нас насекомые будут вылетать не сбоку а где-то сверху? тогда даже если она
потом полетит "за тебя", направление будет видно»). It enters at the top
edge of the screen, at an x between the screen's middle and its first
perch's, and comes down to that perch within `ARRIVAL`. With no open perch
in view it drops in at the middle and flies out by the side nearer its
perch in the world, at its arrival pace, so the child sees which way it
went. **Refined with the operator, told a screen row is a depth: it rises
from behind the brow in front** («ну тогда пусть вылезает "из-за холма"
спереди»). The release starts just past `D_SEE` along the heading, at an x
between the screen's middle and its first perch's, so it comes up over the
round brow as anything nearing it does, and flies in to the perch within
`ARRIVAL`, growing by the depth scale as it nears. With no open perch in
view it comes over the brow at the middle and flies out by the side nearer
its perch in the world. No height is needed: the depth model draws it.
Beaten: the side edge (half off screen, and an unseen leg's way lost), and
the top edge (a sky row is no depth, so it needed a height of its own
before 12b).
**From the operator, after the relay at depth 8: «субъективно кажется что
мухи и пчёлы стали перелетать слишком быстро».** Traced: 3ddb960 let
insects perch anywhere in a world twice a sideways tablet's screen, and
gave butterflies' `slowest` 2 → 4 for it but not flies' or bees'. A fly or
a bee past its `slowest` keeps the leg's time and dashes the rest
(`paced` in `flight.ts`), so its dash speeds up with the leg's length:
across the world it dashes ~2.3× (fly) and ~2.5× (bee) as fast as across
that tablet's screen (≈6 world units). **Decided: a dash is never faster
than the kind's dash across ≈6 units was**; a longer leg takes longer
instead, its last strides still at the kind's pace. Beaten: doubling
`slowest` as for butterflies (the dash still speeds up without bound with
distance, and mid legs slow too), and a slower pace overall (the dart is
what a fly and a bee are). Short and mid legs keep today's timing; the
catch tests and the arrivals' ~1.5 s first perch must hold.
Built (f736ec2, `dash-cap.md`) as one cap for every screen, `TABLET_ACROSS`
= 1180 / 60 ≈ 19.7 butterfly sizes (`paced` reads places in butterfly
sizes; "≈6 units" was ground units, and the ×2.3/×2.5 were computed in the
wrong unit — the real world-crossing gain is ×2.0–2.4). **Re-decided: the
cap is this screen's own width** in butterfly sizes, the longest leg each
screen allowed before 3ddb960. One tablet-wide cap left a portrait phone
(6.5 sizes across) dashing up to ~9 screen widths a second against ~2.6
before, and slowed a desktop (28.5 across) below what it ever had. Beaten:
the tablet's cap everywhere (above), and the cap in screen px (places are
already in each screen's butterfly size, which is what the eye reads).
Built (da93055, `dash-cap.md`): `Sight.across` set by `perchSight`; every
screen's fastest dash back to 2.5–3.1 screens a second. Left for the
review: `across` is optional and an absent one means no cap, which only
test fixtures rely on; `flight.ts` stands at 454 lines.

**Left, in order:**

1. P1 step 2 is built (86503fb, 9d637ea; `p1d-taps.md`): taps only where
   drawn, `+` judged in the current view, `pan-input.ts` gone. Left: the
   phone growth it broke, `mushroom-patch`/`meadow-rules`/`layout`
   re-run, `fliers.test.ts` once, `openingCrop` → `openingView`.
   **Decided: a grown mushroom's own patch scales with the drawn size.**
   With the pad gone, `GROWN_PATCH` 16 px of drawn body stops phones
   growing past the clump (41/20/20 of 120 to six). The patch is 16 px at
   a tablet's camera unit and shrinks in proportion to the screen's unit,
   floored at 8 px. Beaten: 8 everywhere (restores phones, but lets
   tablet forests crowd for no gain) and no growth on phones (breaks "the
   meadow only gets fuller"). If the scaled floor leaves a phone short of
   the old 120, the floor goes to 8 on that screen, measured.
   Built (d396ca72, `p1e-patch.md`): 120 to six on every screen. The
   clump's own patch follows the same rule — `CLUMP_PATCH` 12 at a
   tablet's unit, scaled, floored at 8 (the sideways phone's back cap
   kept a crescent too thin for 12; 0 failures at ≤9). Left, red since
   86503fb: `layout.test.ts` "grows 12 over the world" on the sideways
   phone (3 of 200 stop at 5–8, not for the patch), and
   `clump-layout.test.ts` "wider cap farther in" (tablet 318 → 589 of
   2250 pairs) — each traced to its cause and judged against the rule it
   stands for before anything is tuned.
   Traced (2758d677, 5d6f8d88, `p1f-reds.md`): the lost back rows were
   the patch, not the view's `+` — a back-row mushroom is drawn at 0.65
   of a front one and could not hold the screen's one patch size. The
   patch now also shrinks with depth (`× min(1, scaleAt(z))`): tablet,
   phone and small phone grow behind the clump again (70/67/59 → 131/
   129/120 of the first 20 visits), clump-layout's tablet pairs 589 → 303. **Set (45d9cce4): `LEAST_PATCH` 8 → 6.** The sideways phone's scaled
   patch is 7.6–4.9 px, so the 8 floor kept its back rows shut and both
   reds red; at 6, `layout` "grows 12" 200/200, clump-layout 358/2250,
   57% behind the clump (pads: 66%). Beaten: 5 (66%, but the farthest
   cap's patch gets hard for a finger) and relaxing the tests (they
   state the rule the meadow keeps). Left: set it, re-run
   `mushroom-patch`, `layout`, `clump-layout` and `fliers`.
2. Done (fff4e84, e9a6f995, `split.md`): `insect-view.ts` 349,
   `meadow-scene.ts` 408. `pnpm type-overlap` fails on 5 groups that
   predate the split (`Shown.bob` / `Stepped.bob` among them) — the
   bite's end fixes them before vet.
3. P4: the long press, the flower picker with the cross, the ring
   (below). Built (6ce6e395, 13f5a80a, 7a3a3d53; `p4.md`), with the
   `hold` play. **Decided for the fix round:** a pulled seeded flower
   leaves a tuft where it stood, since every planting spot is a tuft and
   the plan's "its tuft coming back" is about the spot, not the record
   (beaten: bare grass, which hides where the child can plant again); a
   press on the flower the picker is already open on keeps it open
   (beaten: shut then reopen, a flicker); a press through a resting
   insect is a long press too; the sun keeps off the cross as it does
   off the colour row. Then flowers' paling (`brow-flower-pale.patch`).
   Built (560e0db2–422c373b, `p4-fix.md`). **Re-decided: the cross
   yields to the sun, not the sun to the cross.** Moving the sun for the
   cross moved it on every screen at all times (tablet lower, small phone
   r 24 → 16) for a button shown only while picking, and broke
   `mushroom-light`'s small-phone case; so `placeSun` goes back to
   reading the button rows only, and the cross takes the first of its
   spots that keeps off the sun's disc and rays (on tabL, before the
   colour row's first button). Also: startling an insect does not shut a
   picker open on a flower, so a press through a resting insect does not
   flicker.
4. The rest of the play run. The probe reads the eye, and the walk play
   with its `walk-*.png` frames is in (002b560, d14e506, e8e4e79;
   `play-walk.md`). The species, tufts and insect plays read the view now
   (b3254511, 608fbcfc, adfe6fc6, 3c07c7b9; `play-rest.md`): every screen
   passed all five plays, though not in one run at one commit. Left: one
   full five-screen run at the final HEAD, one screen per call, its
   frames committed; spec §4's opening identity, the walk to a back-row
   mushroom and a tap on its drawn cap, an insect after 180°, the frame
   budget walking into the forest. The footstep level (`STEP_PEAK`,
   ~10 dB under a C5) for the operator's ear. Build the probe in a
   scratchpad worktree when another agent's edits sit uncommitted in the
   tree.
   **Fixed (c3acaa50, `seam-cover.md`): past the seam a thing sinks under
   the ground, never onto a far hill.** The walk frames showed a back-row
   flower past `D_SEE` standing whole on the far hill wherever the near
   crest dipped below its foot. Covering it "from the crest down" cannot
   hold: the crest never comes lower than 0.4 of the near band (32 px on
   tabL), about a flower's height at `D_SEE`, so the plan's cover hid
   whole flowers at the seam at once — a pop. Instead, past `D_SEE` a
   thing is drawn below the ground's top row by as much as its foot would
   stand above it (`view.ts` `sunk`/`buried`), between the near hills and
   the ground, which covers it from the foot up; walking away, it slides
   over the meadow's brow. Left from it: a sunk thing's last sliver reads
   as a speck at the seam (`tabL-walk-rim.png` ≈(240, 850)) — hide it
   once less than a recognisable head shows; a buried flower must count
   neither for the keys' `inView` nor for taps (`flower-bed.ts`, with P4).
   The haze test is green again (0613c525: it now plants its own
   back-row mushroom). The sliver rule is in (fe149c59, `seam-tail.md`):
   past the seam a thing is hidden once under 0.2 of its drawn height
   shows above `groundTop + seamReach`; tufts follow it. Left: flowers
   (`seam-tail-flowers.patch`, one line in `flower-bed.ts`), mushrooms
   and the house (`mushroom-bed.ts` passes no height), and the walk
   play's `checkPops`, which must not count a vanish under the ground's
   cover as a pop — all three in one package once the play agent is out
   of `scripts/`.
   Built (d5bbaf85, 1efc4d07, `seam-end.md`): flowers, mushrooms and the
   house hide their last sliver; `checkPops` reads the cover, its
   allowance `SHOWN_LEAST` of the drawn height plus 2 px.
   **Decided, from the operator's play: the seam is a horizon you can
   see.** Sinking under a ground with no edge drawn reads as burying
   («выглядит как будто они просто прячутся в землю»). The world reads as
   a small round planet — on a sphere the horizon is a brow in every
   direction, and a far thing goes under it foot first, as a ship does —
   so the cover row gets a visible brow: a lighter crest line with a
   fringe of blades along it, standing in front of what sinks, and what
   nears the brow pales a little into the haze before it goes under. The
   operator: «ок, давай попробуем». Beaten: shrinking into fog alone (the
   spec's fade mists the opening's back rows, and pushed farther it
   pops), and leaving it as a style.
   **Decided, from the operator's second play: the brow is round.** A
   far flower stood with its foot above the straight brow, higher at the
   middle of the screen than at its side, and rode up and down as the
   child turned (screenshots in `bite-12/brow-round.md`): what sinks is
   keyed on the distance along the ground (turn-invariant, kept), but a
   screen row is the depth along the heading, so the line where things
   go under is the projection of the circle `D_SEE` round the eye, not a
   row. The brow is drawn along that curve — highest at the screen's
   middle, lower toward its edges — and each thing sinks relative to the
   brow at its own x, so a far flower slides along the curve as you turn.
   The operator: «закруглить горизонт?». Beaten: keying the sink on the
   depth along the heading (a straight brow, but a far flower would
   vanish as the child turns toward it). Also found: a flat pale band
   across the hills at some headings — traced and fixed in the same
   package.
   Built (3157cfb7–06a7c0b8 and the patches' landing; `brow-round.md`):
   HEAD sank by depth along the heading, the beaten option, and from
   `groundTop` rather than the drawn brow; now things sink by distance,
   the brow is the `D_SEE` circle's row at each x (`browRow`), flowers
   pale by distance. The band was Phaser's 1 px path skip dropping a hill
   band's corner (`PATH_SKIP` in `skyline.ts`, a test through Phaser's own
   skip). Left: at the opening on phoneL one edge flower starts partly
   sunk (desktop: one thing 28 px) — the world frame reaches past the
   circle near the sides; judge it in the five-screen run.
   Built (99f2007d, ca991f66, 651e48f2, db4e08e3; `brow.md`): the brow in
   `brow.ts`, a crest with clumped blades at compass headings, redrawn
   only on a turn; past `D_SEE` mushrooms pale up to 0.2 more haze
   (`browPale` in `repaint-queue.ts`). Left: flowers' paling,
   `brow-flower-pale.patch`, applied once P4's `flower-bed.ts` lands.
   **Found on the way: since 86503fb the forest on four screens grows
   nothing behind the opening clump** (every grown mushroom 7.8–9.8
   ahead, haze 0). The forest must still grow into the misty back rows;
   traced with the two reds in item 1.
   4b. **A key plants (operator, playing the round brow).** While the picker
   is open on a tuft, a note or drum key plants the flower that sounds it
   there at once — its colour and shape are the key's, by `soundOf`'s law
   (`seedSounding`) — sounding as a planting does, in view of a matching
   flower or not, and the picker shuts («нажатие на "клавишу" этого цветка
   будет сразу его сажать, без необходимости выбирать цвет-форму… сто лет
   буду запоминать где там например фа диез»). Either stage of the picker
   takes it. The same holds for the picker open on a flower: the key
   replaces it, the picker being one picker. Beaten: keys planting only at
   the colour stage (the child would still have to find the colour).
   Octave keys still only shift the octave.
5. The bite's end: `decisions.md` rewritten where the spec names, the
   fold into `## Eaten so far`, `/polish`, vet, the Artifact, `/pr`.

6. **Walking.** The player really walks the meadow: turns on the spot
   through 360° and steps forward and back along the heading — a camera
   with a heading on the flat ground, not the strip's sideways slide, nor
   a ring of the strip joined at its ends, where the player could only
   lean toward what is in front («ходить мы хотим. иначе как он "карту"
   засеивать будет?»). The sun, its wash and the clouds belong to a
   heading, so the sun is the compass and no compass is drawn (the
   operator: a compass was the first thought, then the sun, «солнце у нас
   всегда на месте, что makes no sense»).

   **The contract is `docs/remove-before-merging/bite-12/step-spec.md`
   (2ace9d5), its recommendation taken on every open call** — read it
   whole before briefing. What it settles, in a line each: today's
   projection is already a pinhole written per row (`model/ground.ts`), so
   the true pinhole derived from its constants reproduces the opening
   frame exactly (a unit test and a play check); the walk's state lives in
   the scene as pure state like `pan.ts`, not in `Meadow`; bite 12's
   bounds are a glade disc, centre (0, 8), radius 12, sliding along its
   rim; no collisions — nearer than 2 units is hidden, farther than 13.33
   fades in at the hills' foot; keys turn 0.38 rad/s on every screen, a
   finger turns 1:1 with the glide, a walk is 1.6 units/s eased over
   0.25 s, the pan's cruise maths shared through `model/cruise.ts`; a drag
   locks its axis at the 24 px slop's crossing (within 45° of horizontal
   turns, else steps), a vertical drag chasing the finger no faster than a
   step, with no glide; hills drawn live from a 360° crest, redrawn only
   while turning; the sun its own small bake placed by heading, the wash
   on the sky only, one dip in the hills under the sun, clouds at
   headings; ground bands and grain fixed to the screen, mottles back as
   objects in 12b; haze by distance through a repaint queue capped at two
   a frame; a mushroom answers only where drawn (`fingerPad` goes, by the
   operator's idea-1 ruling); insects keep flying in the opening view's
   frame, drawn through a conversion, the sight rule down to the world
   edge; `+` grows only inside the wedge and on screen; a 3 px bob by
   distance walked and one soft step per 0.8 units, alternating sides.
   Packages: step 0 (pure model and types) alone, then P1 the ground on
   the plane, P2 the panorama, P3 walking in, disjoint by files, P3's
   wiring step after P1's and P2's first. **Bite 12 ends** with a child
   turning all the way round and walking anywhere in the glade, the sun as
   compass, the current meadow standing and tapping as before inside the
   wedge, bare ground behind.

   **Past the seam a thing goes behind the hills, not into a fade.** The
   spec's alpha fade from 12.3 would mist back-row mushrooms at the
   opening (the frame reaches D = 13.24; tablet seed 42 has one at alpha
   0.57), and a fade squeezed into 13.24–13.33 pops. A thing whose foot
   lies beyond `D_SEE` is drawn under the near hills instead, so they
   cover it from the foot up as it recedes, as a crest does; `fade`
   retires.

   **Two fixes from the operator's play, folded into the packages that
   own the files.**
   - **The planting spots are grass again (P1).** Bite 10 drew each bare
     tuft as a sprout round a closed pink bud, and capped them at
     `TUFTS_PER_1000PX` 6, so the ground's grass thinned and the meadow
     went noisy («заменил травинки "недоцветками"… выглядит так себе…
     слишком noisy… травинки были ок, и ок когда их было больше»). A bare
     tuft is drawn as a plain grass tuft, the seam's blades, and the
     ground carries plain tufts again at the density it had before bite
     10, **every one of them a planting spot** («ребёнок должен мочь
     посадить цветок где хочет… сделать каждую травинку потенциальным
     местом для цветка»): a tap nothing else takes lands on the nearest
     tuft in reach, which opens the picker. No tuft stands where no flower
     fits by bite 10's rules — beside a flower, under a cap — and one goes
     when something grows beside it («лучше просто убрать травинки где
     нельзя»), so no tuft ever refuses. The tuft the picker is open on keeps its cream glow;
     a planted flower takes its tuft's place. No bud anywhere.
   - **The keyboard plays only the flowers in front of you (P3).** A note
     or drum key sounds only through a flower in the current view with
     that pitch class or drum, and that flower answers as to a tap; with
     none in view the key is silent («"пианино" с клавиатуры не должно
     играть, если перед тобой нет подходящего цветка»). The note keeps
     the keyboard's octave, and the octave keys stay («передо мной 12
     цветков, по ноту на каждому, я хочу играть и переключать октавы»).
   - **A retap restarts a flower's answer (P1b).** A tap on a flower
     whose bounce is still playing starts it again from the top, as the
     sound already does («если второе нажатие до завершения анимации,
     анимация начинается заново»).
   - **A flower can be changed or removed (P4, after P1b and P3).** A
     tap on a flower only plays it; a long press — held ~0.45 s without
     moving past the slop, the note sounding at the press as a tap's does
     — selects it and opens the picker on it («да, давай так»: a picker
     on every tap would jump from flower to flower through a melody).
     The selected flower is marked by a small ring on the ground where
     its stem enters it, plainer than the mushroom's selection («попроще,
     чем гриб — например кружочком под цветком»). The picker: the colour row
     plus one button with a cross, then the shape row once a colour is
     picked; the pick replaces the flower in place, the cross removes it,
     its tuft coming back («при нажатии на цветок возникают снова кнопки
     цвета… плюс к кнопкам цвета одна кнопка с крестиком»). Seeded
     flowers too, so the model remembers the replaced and removed ones.
     The picker shuts, and the ring with it, on a tap on the meadow, as
     on a tuft; a long press on another flower moves it there.

   The decisions this rewrites — the one-drag pan, "every mushroom is a
   finger's target", the sight rule, bite 11's fixed sun, hill parallax,
   wash rule and hard ends — are rewritten in `decisions.md` at the
   bite's end, as the spec names them.

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
