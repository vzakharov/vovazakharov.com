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

1. A session takes a bite (`/go`), builds it, folds it into `## Eaten so far`
   as its own `mushroom-game-syama/bite-<nn>.md` and an index row, and
   rewrites the summary above the index rather than appending to it
   (`.claude/skills/plan/elephant.md` § "The plan's shape"; split at 1001
   lines on the operator's «ого его раздуло. надо разбивать»), runs `/polish` and `/pr`, publishes the Artifact (below), pauses the plan,
   then runs `/relay оставь код ревью на последний кусок`.
2. The review session reviews **that bite's commits** as the operator would —
   `writing/notes/the-five-percent.md` is the reading list: the frame taken as
   given, an account standing in for running it, reasoning written into the
   artifact, the copy edited instead of the fact, the render checked against
   intent rather than the page. It opens and plays the page (`/preview`,
   screenshots and tap sequences at phone and tablet sizes) before judging
   the look. It posts one PR review with inline comments, each specific enough
   to act on, then runs `/relay /handle`.
3. The `/handle` session answers every comment (reply on GitHub, never
   resolve), pushes the fixes, then takes the next bite in the same session
   when its context is still under ~140k tokens — otherwise it pauses and
   runs `/relay /go`. Either way the bite ends at step 1.
4. After the last bite and its review is handled: `/relay /finalize`. No
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
misting toward the air, lit ground whose grass sways in a travelling gust.
Two spotted fly agarics stand as one clump, feet close and caps leaning
apart, and the meadow is a world twice a sideways tablet's width with the
screen a crop onto it: a drag past a 24 px slop, or a held `←`/`→`, pans it,
the far and near hills scrolling slower. Every mushroom, flower and insect
grows from its own seed, so no two visits match. No text, no goal, no
failing; every tap answers at once with motion and sound.

**What a child can do.** A tap wobbles a mushroom, puffs spores and selects
it. `+` opens a picker of four species — fly agaric, porcini, chanterelle,
russula — and grows the pick where it has room inside the crop, up to
twelve; where none does, `+` shakes its head with a "nuh-uh". `−` sinks the
selected or the newest. The house button furnishes a cap with windows from
Syama's row and its stem with a door, where a mouse now and then peeks out,
or comes at once to a tap with a squeak. The butterfly, fly and bee buttons
fly one in from the nearer screen edge (4/3/3 at most, the oldest leaving):
butterflies drink at flowers and rest on caps, flies favour the fly agarics,
bees carry pollen and plant a flower in a ring round one they visited. A tap
on a resting insect sends it off and goes through to what it sat on. Every
flower is a note or a drum, darker being lower, played by a tap, by several
fingers at once as a chord, or by the keyboard; a tap on a bare grass tuft
opens a two-stage picker (colour, then shape) whose exact flower grows
there (bite-10.md). A mute pictogram sits top left.

**Pure model, reconciling scene.** `model/` is Phaser-free and under
`node:test`. `game.ts`'s `reduce` over the `Meadow` (growing, selecting,
furnishing, planting, releasing, startling, `tick`) is the only way the
state changes: the scene calls `dispatch`, diffs what comes back by id, and
skips reconciling when the same `Meadow` returns. Randomness enters only as
an injected `random.ts` generator. `motion.ts` (seconds) and
`insect-motion.ts` (ms) make every movement a pure function of the clock,
so a resize repaints into the objects on screen and never interrupts one.
`MUSHROOM_SLOTS` (12) caps the forest and `INSECT_LIMITS` the fliers; a
flower grows wherever one has room. `meadow-scene.ts` only orchestrates the
beds — `mushroom-bed.ts`, `flower-bed.ts`, `insect-view.ts`,
`house-view.ts`, `controls.ts`, `hud.ts`.

**The world, the crop, the pan.** One world `WORLD_ACROSS` (5.764) ground
units across on every screen (`ui/scene/meadow-camera.ts`), in
`model/ground.ts`'s `Ground {x, z}`, seen from one angle (`UP_PER_Z`). The
zoom is the screen's, capped to show the opening clump and floored where
its narrowest cap is a finger wide (`ZOOM_FLOOR`); `layout.ts` computes the
layout once per screen size for the whole world, in CSS px. `model/pan.ts`
is the crop's pure state — slop, 1:1 follow, a glide timed by the events'
timestamps, hard ends, an eased key turn, keys and fingers adding up — and
`pan-input.ts`'s `Crop` the one screen↔world conversion; the crop is
`cameras.main.scrollX`, so a pan builds no new layout. A turn changes the
zoom and the crop, never the ground. Fixed on screen: sky, sun, its wash,
clouds, every control and picker; the hills scroll at 0.3 and 0.6
(`parallax.ts`), everything else with the ground (bite-11.md).

**Placement and fingers.** A grown mushroom's foot is `pickFoot`'s best of
32 candidates by its seed (`model/placement.ts`), which `roomFor` in
`mushroom-room.ts` checks — inside the crop, off the controls, cap and stem
cover (`cap-cover.ts`), door in sight — and `keptRoom` finds again when the
meadow changes. Hit areas are at least `TAP_RADIUS` 32 (`tap-reach.ts`):
a mushroom's is what is drawn (`model/mushroom-outline.ts`) plus a finger
pad round a head narrower than a finger (`mushroom-tap.ts`), the front-most
taking the tap, and every grown one keeps a tappable patch
(`mushroom-patch.ts`). Flowers stay put: the seeded bed is fourteen, each
half of the world sounding C D E G A, a kick and a hat (`flower-layout.ts`),
and bees and the child plant through `flower-plots.ts` and
`flower-sight.ts`; the bare tufts are `tendTufts`'s (`tufts.ts`). An insect
perches only on what is in sight (`perch-sight.ts`), never two to a perch
(`perch-room.ts`), its first perch on screen (`model/flight-in.ts`), each
kind's habits in `model/flight-habits.ts`. Pickers unfold from their button
(`picker.ts`) in finger-sized rows (`picker-rows.ts`), hiding the buttons
they cover where the sky is short (bite-10.md).

**Generators and painting.** Genes and drawing are two modules per
creature. `model/`: `mushroom-genes.ts` (a gene table per species,
`HEAD_KIND` dome or trumpet), `mushroom-pose.ts`, `mushroom-profile.ts`,
`chanterelle-outline.ts`, `flower-genes.ts`, `insect-genes.ts`
(`INSECT_KINDS`, `GenesOf<K>`), `fly-genes.ts`, `bee-genes.ts`, `house.ts`.
The scene paints with `draw-*.ts`, `paint-dome.ts`, `paint-trumpet.ts` and
`paint-backdrop.ts` (`paint-sky.ts`, `paint-land.ts`, `skyline.ts`), the
backdrop baked once a paint (`baking.ts`) in bands and one grain texture,
no filters or gradient fills. One light, `sunLight` (`model/light.ts`),
reaches every bed and painter; every ink comes from `inkFor` (`ink.ts`);
`palette.ts`, `palette-backdrop.ts` and `palette-creatures.ts` hold every
colour literal (bite-07.md, bite-08.md).

**Sound.** All synthesized: `sound.ts`'s `MeadowSound`, built on the first
tap's release and playing what was asked before it, with `synth.ts` and
`insect-voices.ts`; the mute is remembered in `localStorage`.
`instrument.ts`'s `Instrument` plays `instrument-voices.ts`'s twenty voices
(`model/flower-sounds.ts`, `model/notes.ts`) through a compressor on master,
levelled by `part-loudness.ts` (bite-10.md).

**The play run, the sweep, the suite.** `pnpm play:mushrooms` builds a probe
export (`NEXT_PUBLIC_MUSHROOM_PROBE`) and drives every control over the
DevTools protocol on tabL, tabP, phoneP, phoneL and phoneS
(`scripts/lib/play-*.ts`, the probe and its schema in
`scripts/lib/mushroom-probe.ts`), converting through the crop
(`__probe.toScreen`, `toWorld`). It fails on a page error, a wrong effect,
a flier turning or relit too fast (`flier-watch.ts`) or a median frame past
26 ms (`frame-budget.ts`); frames land in `tmp/play/`, about 8.5 min a
screen (`--screens`, `--no-build`). `pnpm sweep:mushrooms` grows all 2000
visits on every `VIEWPORTS` screen. The suite runs a file at a time,
`fliers.test.ts` alone (~354 s).

**The Artifact.** `pnpm artifact:mushrooms`
(`scripts/build-mushroom-artifact.ts`) esbuilds the scene into one HTML
under `tmp/mushroom-artifact/`, Phaser from jsDelivr at the lockfile's
version, republished in place at the URL on the PR.

**What the next bites stand on.** Rain falls from clouds fixed on the
screen onto ground that scrolls, so a drop lands through the `Crop`; its
weather is model state the reducer's `tick` advances, the sprouting spores
grow through `pickFoot` and `roomFor` under `MUSHROOM_SLOTS`, sheltering is
a perch in `flight-habits.ts`, and closing flowers and swelling caps are
clock functions in `motion.ts`. Dusk is a second set of `palette*.ts`
colours through the baked backdrop and `sunLight`, lit windows in
`draw-house.ts`, mice from the house's peek motion, and fireflies a fourth
`INSECT_KINDS` entry. Around the canvas: reduced motion switches the clock
functions' idle loops off; the hidden HTML buttons dispatch the same
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

## Rest of the elephant

In order.

**Bite 11's review (5373085053) is handled**: every thread answered, the
play run green on all five screens, its frames in
`docs/remove-before-merging/frames/bite-11/`, the Artifact at version 12.
A held arrow on phoneL starts from the far end, since the opening crop
leaves less room than the key's ease-in needs (`play-pan-keys.ts`).

**The rest of idea 1 is bite 12 and item 15.** Bites 9 and 11 built its
left half (the ground, the wide world, the pan, the keys, a turn as a
crop). The operator wants walking now, ahead of the rain, and the map after
the rain's aftermath («всё-таки я хочу чтобы шагать можно было уже сейчас…
поставим 14 до 12. карту можно отложить до после после дождя»).
`docs/remove-before-merging/ideas/idea-1-walking-meadow.md` is the spec of
both, its «Что ты решил» section overriding the body.

**Open:** review 5360733525 is handled, every thread answered; one miss it
left stands: on phoneL, visit 12733755's clump back cap keeps a 22 px patch,
not 24, because phoneL stands the clump under the zoom floor and growth does
not place the clump. Near-square windows of ~320–360 px each way (no phone has one)
fit no finger-sized picker row: it overlaps `−`, and `+` stands below the
ground; no test covers them. The play run shoots no 568×320 screen, so the
tests alone hold it. The play run's world-end drag check skips where
no cap or flower at an end has bare ground beside it — both ends on tabL
in the keys run, whose right-end frame shows grass round every cap. On tablets the front mushroom's stem can run to the bottom edge. On phoneP one planted flower
reads larger than its neighbours at the same depth. The play run shoots
no refused `+` and no bees planting in a full forest.
The sky may read a little plain since bite 7 tamed the halo.
Carried from bite 6: fliers are kept apart where they sit and hover, not in flight, so a flier crossing
the meadow is drawn straight over one seated on a cap (frame
`phoneL-butterfly-crosses-one-on-a-cap.png`); a flight in
from off screen still takes up to 5 s for a butterfly; a butterfly making
way for a bee leaves its flower moments after landing, which may read as a
twitch; a flier holding an air spot is drawn still, with no hover bob.

12b. **The meadow has no edge** («ну да, бесконечный»): bite 12's glade
rim goes here, and the field runs on wherever the child walks. **Nothing
grows on it but grass until the child plants it**: the opening clump and
its seeded flowers are the whole of what the game sows, and every other
mushroom and flower is his («ничего кроме стартовых двух грибов и
скольки-то там цветков быть не должно, всё остальное ребёнок засевает
сам… там пустое поле пока он туда что-то не посадит»). The grass is the
field's, laid as the child walks, every tuft a planting spot. The map
(item 15) shows the surroundings rather than a whole world, and helps the
child find his way back to his own mushrooms; the twelve-mushroom cap
becomes a cap per area. The operator plays only the finished game, so
bite 12's rim is never something a child meets.
**Walking, the whole glade.** Stored positions move onto the plane
(anything behind the starting point needs it), `+` and planting work
anywhere in front of the child, light follows the heading, the insects fly fully on the plane,
the glade's radius is set for it (`step-spec.md`). **Open for the
operator:** what replaces the twelve-mushroom cap once the whole glade
can be sown. 13. **Rain** — the shower itself; what it leaves behind is item 14. Cut
there because item 12 as written was four packages (weather, the
shower's look and sound, shelter, sprouting), and a bite past two runs
into the budget notice (`.claude/skills/megabeast/notes/pickup-and-relay.md`).

    **Behaviour.**
    - **A tap on any cloud starts the rain.** The tapped cloud darkens
      first and the others follow within ~0.6 s; the sky and land dim under
      a slate wash; rain falls across the whole screen, densest under the
      tapped cloud. The weather is the meadow's, not a cloud's: one shower
      at a time, so flowers everywhere close at once, a cause a child reads
      without a word.
    - **It lasts `RAIN_MS` 10 s; a tap on a cloud while it rains restarts
      the 10 s** and gives that cloud a wobble and a gush of drops under
      it, so the tap always answers (decisions: "No tap is ever answered
      with a shrug"). A cloud tap is a tap on the meadow, so it shuts the
      flower picker, as a flower tap does.
    - **Drops** are short slanted streaks, screen-fixed like the clouds, at
      most ~120 at once. Where one lands it splashes as a small ring
      (decisions: mandala ornament): on a cap's top where the drop's column
      crosses a cap in sight, otherwise on the ground at a depth picked from
      the crop. Splashes are drawn through the `Crop`, so they sit on the
      ground under a pan.
    - **Sound**: a soft hiss of filtered noise with a patter of tiny ticks,
      fading in over ~1 s and out with the rain; a cloud tap answers with a
      low soft whoosh. Synthesized in `synth.ts`'s manner, silent under the
      mute; level above ~300 Hz checked by rendering (play-run note "Sound
      is reviewed by rendering it").
    - **While it rains** every flower closes — petals folded up toward the
      centre over ~1.5 s, reopening as it stops — and stays playable as an
      instrument; every mushroom's cap swells ~6% and settles back. Both
      are clock functions of the shower, so a resize or a pan never
      interrupts them. Insects carry on as before this bite.
    - **When it stops** the wash lifts and a rainbow fades in over the sky,
      screen-fixed, as concentric bands, holds ~8 s and fades over ~3 s. A
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
    staying under ~450. Cloud hit areas are the cloud's circle, at least
    `TAP_RADIUS`, the lowest priority: a control, a mushroom, a flower or an
    insect over a cloud takes the tap. Closing petals in `draw-flower.ts`,
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
    cap (a perch in `flight-habits.ts`, in sight by the same rule); when it
    stops, spores an old mushroom shed sprout into little mushrooms that
    grow over the next minutes through `pickFoot` and `roomFor`, within
    `MUSHROOM_SLOTS` — the first thing the reducer's `tick` grows.
15. **The map.** A map view and its button take the mute's circle, which
    anchors the layout; the mute and its `localStorage` memory go with it
    (sound off is the device's), `settle()` staying.
16. **Dusk.** The dark scheme is dusk: the sky, dimmer hills, windows
    glowing, fireflies waking, mice coming out of their doors, butterflies
    folded on the caps and flowers closed for the night.
17. **Around the canvas.** A way home as a pictogram; `prefers-reduced-motion`
    (idle loops off, short tweens without overshoot); a visually hidden row
    of HTML buttons beside the canvas dispatching the same actions, for
    assistive tech; a home-page link in the footer's `SEE_ALSO` if that list
    carries side projects, none otherwise. Then, the Artifact republished,
    `/relay /finalize`.

## This bite

12. **Walking.** The player really walks the meadow: turns on the spot
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
