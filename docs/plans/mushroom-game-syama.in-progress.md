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

1. A session takes a bite (`/go`), builds it, folds it into `## Eaten so far`,
   runs `/polish` and `/pr`, publishes the Artifact (below), pauses the plan,
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
- **`.claude/skills/megabeast/notes.md` is filled at the end of every
  session, before its relay**: what the session found that would make this
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

- **No text anywhere in the game**, so a child of any age can play; every
  control is a pictogram drawn by code. Hence **no locales**: one route,
  metadata in English like the rest of the site.
- **No sprites, no asset files — everything is drawn and voiced by code.** A
  mushroom or an insect is a pure seeded generator (seed → genes: proportions,
  lean, spots, wing shape, a hue nudge) plus a routine that paints the genes
  with Phaser `Graphics`: outline, flat fill, a highlight, a shade — cartoon
  shading as layered shapes. The seed is the state; the genes are derived.
  Sound is synthesized with Web Audio, no files.
- **Phaser 4**, loaded on this route alone: dynamic import inside a
  `'use client'` component's `useEffect`, the game destroyed on unmount.
  `Scale.NONE` with the host sizing the buffer in device pixels, since
  `Scale.RESIZE` sizes it in CSS pixels and blurs every retina tablet; a
  full-bleed canvas at `100dvh`, `touch-action: none`. No physics engine;
  tweens and particles carry motion.
- **A pure model decides, the scene reconciles.** `model/` holds the state, a
  reducer and the generators, all Phaser-free and under `node:test`; the scene
  diffs states by id and animates the difference. A resize reconciles too: it
  repaints into the objects already on screen, never destroying one, so a
  rotation or a collapsing toolbar leaves every tween running. Randomness enters the model
  only as an injected seeded generator, so every test is deterministic.
- **Made for a six-year-old's hands.** Every target at least ~64 CSS px, taps
  only (no drags, no double taps, no long presses), nothing to lose, nothing
  to read. Every tap answers within a frame with motion and sound; anything
  tappable in the meadow does something when tapped. Tablet landscape is the
  primary layout, phone portrait the second, desktop the third.
- **Juice is the product.** Squash and stretch on every arrival, `Back.Out`
  overshoot, a puff of particles on pop-in, idle motion everywhere (grass
  sway, mushroom breathing, drifting clouds, wing beats), depth from layered
  hills and scale. Checked by frames, not by reading code: each bite ends
  with `/preview` screenshots and a scripted tap sequence captured frame by
  frame at tablet and phone sizes.
- **The meadow is a small ecosystem — the twist.** The operator asked for
  one: "не должна быть прямо competitive игра, но какие-то экологические
  штучки должны прослеживаться -- взаимодействия разных сущностей в природе и
  с самой природой". So each creature wants something from the meadow and
  gives something back, and a child sees the cause and its effect without a
  word: bees carry pollen from flower to flower and a new flower opens where
  they have been; butterflies drink from flowers and rest on caps; flies are
  drawn to the fly agarics; rain, from a tapped cloud, closes the flowers,
  sends the insects under the caps and makes the mushrooms swell, and once it
  stops, spores an old mushroom shed sprout into little ones and a rainbow
  comes out; at dusk the mice come out and the fireflies wake. **Shown,
  never taught** ("это не должно быть в виде назойливого научения, всё
  должно быть перед глазами, а не на объяснениях"): no hint, arrow, counter,
  reward or lesson points at a rule — each is simply what happens in plain
  sight, slow enough to be noticed and left to be discovered. Nothing
  starves, dies or is lost — the meadow only ever gets fuller and livelier,
  within the caps the layout sets. These rules are the model's, so they are
  tested like the rest: a `tick` in the reducer, driven by the scene's clock.
- **Every mushroom is a finger's target, on every screen.** A slot's size
  never falls below the floor at which the narrowest cap the genes allow is
  `2 × TAP_RADIUS` wide, and a phone keeps all six slots, placed to fit under
  that floor, rather than fewer: a slot count that changed with the screen
  would strand a mushroom whenever a phone is turned. The controls stand clear
  of every slot's farthest cap reach and of the sun.
- **No tap is ever answered with a shrug.** `−` with nothing selected sinks
  the newest mushroom, so `−` always takes something away and a selection
  only chooses which. A control that truly cannot act — `+` on a full meadow,
  `−` on an empty one — shakes its head, side to side, with a low two-note
  "nuh-uh" of its own, instead of the press it gives when it acts. Neither is
  dimmed while it can act.
- **A door belongs to its mushroom; a flower belongs to the meadow.** A flower
  tap is a tap on the meadow too, so it closes an open picker; a door tap
  calls the mouse and leaves an open picker open, as a tap on a mushroom leaves
  the house picker open.
- **A tap on a resting insect goes through it.** The insect flies off and the
  tap carries on to whatever it sits on — a mushroom is selected, a flower
  blooms — so a creature never costs the child the thing under it. An insect
  in flight takes the tap alone. Buttons stay above every insect.
- **An insect perches only where it can be seen.** A flower is a perch only
  while its head stands clear of every control's tap circle and the screen's
  edge by the wingspan, and no nearer mushroom covers it; the scene hands the
  model the flowers that qualify, by id. Two insects never share a perch: a
  leg's next perch skips any another flier sits on or is heading to, and any
  the scene marks as too close to one of those. A flier with no free perch
  roams the open air and tries again, so a butterfly is never lost for want
  of a perch; only the limit, a startle or its own leaving takes one away.
  At a flower a butterfly sits on the head's upper rim and drinks through a
  proboscis curled down into the centre, leaving the flower in sight; a fly
  sits on the centre, and a bee on the head's rim, facing in, so at least
  half of the head stays in sight under it. Two perches crowd each other by
  the wingspans of the kinds actually on them, never the widest for all. The
  air holds at least as many spots as all the kinds' limits together on
  every screen, so a flier leaves only by eviction, a startle or its own
  leaving.
- **Flowers stay put.** A rotation or a growth never moves a flower, so a
  floored forest mushroom may stand in front of one; such a flower is out of
  sight by the rule above, so no insect is sent to it. Bite 6's bees plant
  through the same in-sight test, on this screen only: a planted flower a
  turn hides is out of sight there as a seeded one is. A seeded flower is
  placed on the visit's opening screen and its turn.
- **A tap on fliers in the air reaches the one whose body is nearest the
  finger**, not the one drawn on top, so the child gets the one they aimed
  at.
- **Butterflies are a meadow, not siblings.** Base colours are many enough
  that four on screen rarely repeat, each still derived from its seed alone.
  They cruise at about two thirds of bite 5's speed, so a child's finger can
  catch one. A perched butterfly keeps its size and may overhang a small cap:
  its tap goes through (above), and the overhang reads as a butterfly on a
  button mushroom. The fore wings' near-closed quarter of the beat stays —
  it blurs at 6 Hz, and only a still shows sticks.
- **Mandala-inspired ornament** — Leysan's ("не прямо чтобы рисовал
  мандалы, а именно inspired"). Radial symmetry and concentric rings are the
  meadow's ornamental language, and nothing in it is a drawn mandala: the
  sun a rosette of rays in layers; each flower an n-fold ring of petals over
  another, the fold and the rings being genes; the butterflies' wings
  carrying concentric eyes; the spore puff and the rain's splashes opening
  as rings; the flowers the bees plant opening around the ones they came
  from, so a well-visited bed grows round; the fireflies at dusk circling.
- **No module past ~450 lines** (CLAUDE.md § "Key principles"; the operator
  repeated it: "помни чтобы не было слишком больших (>450 строк) модулей").
  The scene is the one that would grow, so painting splits by layer
  (`paint-backdrop.ts`, one `draw-*.ts` per creature) and behaviour by
  creature, the scene class only orchestrating.
- **The `palette*.ts` modules are the one place on the site holding colour
  literals** — `palette.ts` with its two sections, `palette-backdrop.ts` and
  `palette-creatures.ts`. A canvas is out of the CSS tokens' reach;
  `.claude/rules/styling.md` § Colours says so in one sentence scoped to those
  paths.

## Eaten so far

1. **The meadow, still.** `/mushrooms` (in `PAGE_ROUTES`, so in the sitemap)
   paints a sunny meadow and two spotted fly agarics, fresh on every visit
   and the same across a resize. What the next bites build on:
   - `model/` (Phaser-free, under `node:test`): `random.ts` (`mulberry32`,
     `between`, `nextSeed`), `geometry.ts` (`Point`, `Circle`),
     `mushroom-genes.ts` (`CAP_KINDS`, `Mushroom`, `mushroomGenes` for all
     four caps, `domeHeight`, `firstMushrooms`).
   - `model/mushroom-pose.ts`: where a mushroom's parts stand — the stem a
     quadratic curve bending over by the `stemBend` gene, the cap following
     its turn, `splayed` for a placement that faces a mushroom one way,
     `capReach` and `maxReach` for how far a cap gets from its foot. The
     painter and the layout both read it; `layout.test.ts` runs 2000 visits
     through it on five screens and holds every opening cap inside
     `EDGE_MARGIN`, and the sun's glow on screen.
   - `ui/meadow-canvas.tsx` imports `ui/scene/start-game.ts` after mount and
     rethrows a failed load into the error boundary. `start-game.ts` sizes
     the buffer in device pixels itself (Phaser's `RESIZE` would blur a
     retina tablet) and writes the ratio to the registry; the scene's camera
     zooms back to CSS pixels, which `layout.ts` is written in.
   - The opening pair is one clump, as in the drawing: feet close, stems
     crossing, caps leaning apart in a V (`CLUMP_SPLAY`); stems run longer
     than the caps are wide, as Syama drew them.
   - `meadow-scene.ts` repaints on resize into the objects it already has —
     `paintBackdrop` takes and returns its layers in painting order, the
     mushrooms and flowers are kept by id — so a rotation moves them and
     leaves them.
     `paint-backdrop.ts` paints the sky, the rosette sun with a many-ringed
     soft glow, clouds one `Graphics` each so they can drift, two hill
     ranges, and ground opening on the near hills' shade. `draw-mushroom.ts` paints genes in ink, flat fill, tapered shade
     crescents (spots over the cap's, each with its own) and a shine, the
     dome sampled by angle and its rim rounded; `shapes.ts` holds `sample`,
     `petal`, `crescent`, `rounded`, `fillShape`, `strokeShape`;
     `palette.ts` every colour, the canvas's pre-paint background included.
   - Frames come from `pnpm play:mushrooms` (below), with `Math.random`
     seeded so two builds compare frame for frame; Chrome's bare
     `--screenshot` leaves a false strip at the bottom of a canvas page.

2. **The meadow alive, and heard.** Clouds drift, the grass sways in a gust
   seen travelling across it, mushrooms breathe; a tap wobbles a mushroom
   (squash and stretch that keeps its volume, and a rock, over about two
   seconds) and puffs two rings of opaque spores that shrink away. Seven seeded flowers sway and bloom open when
   tapped, each chiming its own note. A breeze, the odd bird, pop, boing and
   chime are synthesized; a mute pictogram sits top left. What the next bites
   build on:
   - `model/motion.ts`: every movement a pure function of the clock —
     `breath`, `sway`, `wobble` and `bloom` of the time since a tap, `drift`,
     `widthFor`. The scene's `update` sets every scale, rotation and drift
     from the layout and the clock, so a resize never interrupts a movement;
     a new creature's idle loop and its tap reaction go there, tested.
   - Bases: `Seeded` (`random.ts`), `Bent` (`geometry.ts`), `Phased`
     (`motion.ts`), `Footing` (`layout.ts`: a foot and a size). A creature's
     loop phase comes from its seed (`phaseOf` in the scene).
   - `model/flower-genes.ts` and `draw-flower.ts`: a flower is a container on
     its foot holding a stem graphics and a head graphics, so sway turns the
     container and bloom scales the head. `meadowLayout` takes the visit seed and
     places flowers by it: each jittered off a slot by its own stream (so a
     resize keeps it), kept only where `clearOfFeet` holds, sized off the
     clump's unit so a flower is always shorter than a stem — bite 6's bees
     plant through the same check. A mushroom's shadow is its own graphics,
     never rotated. `colour.ts` holds `mix` and
     `nudgeHue`; `grass.ts` grows the tufts once per paint and redraws them
     each frame; `spores.ts` puffs; `hud.ts` draws the mute button.
   - `sound.ts`: `MeadowSound`, built on the first tap's release (a browser's
     activation rule) and playing then whatever was asked before it; the
     scene's field is `voice`, since `Phaser.Scene` owns `sound`. A mute suspends
     the whole synth once faded, and `settle()` keeps it suspended while muted
     or hidden. The mute is
     remembered in `localStorage` and falls back to unmuted where storage
     throws — the one silent fallback in the game, awaiting the operator's
     approval on the PR.
   - Taps land on hit areas no smaller than `TAP_RADIUS` (32 CSS px); the
     front-most object takes the tap, depth being where its foot stands.

3. **More mushrooms, and a forest.** A `+` and a `−` sit on the right, as
   Syama drew them, each a fly agaric with its sign; `+` opens the picker
   across the top, four big buttons each holding a mushroom with that cap,
   coming up one after another, and a pick grows a fresh-seeded mushroom out
   of the ground with a puff and a bloop. A tap selects a mushroom (a soft
   glow behind its cap and a ring of light round its foot); `−` sinks it
   back; a tap on the bare meadow lets go. The meadow holds six: the clump
   and a forest round it, the back row smaller and hazed toward the sky.
   What the next bites build on:
   - `model/game.ts`: the `Meadow` state and `reduce` over `pick`, `grow`
     (its seed carried by the action), `select`, `deselect` and `remove`;
     the scene changes the state only through `dispatch` and reconciles the
     screen with what comes back. `MUSHROOM_SLOTS` is the cap, and each
     mushroom keeps its `slot` for life, so nothing else moves when one
     comes or goes. A grown mushroom is selected, so bite 4's house goes on
     it without another tap. The clump can be thinned like any other pair.
   - `layout.ts`: one `Placement` per slot (`haze` included); the forest's
     slots per orientation, each facing the middle and held under
     `sizeToFit`, which the clump shares. Flowers stand clear of every
     slot's foot, taken or not, placed against the meadow as it would stand
     with no edge margin, so neither a growth nor a resize moves one. The
     controls' circles (`mute`, `plus`, `minus`, `picker`) are placed here
     and tested for reach and overlap.
   - `motion.ts` gains `emerge`, `sink` and `phaseOf`. `mushroom-bed.ts`
     owns the mushrooms on screen (grow, sink and destroy, the tap, the
     glow); `controls.ts` owns every button (press-in by `wobble`, dimmed
     when it would do nothing); `hud.ts` draws the pictograms through
     `drawMushroom` over fixed upright genes; `hit-areas.ts` holds the hit
     tests. The scene orchestrates, the flowers and the backdrop still its
     own.
   - A mushroom's tap area is exactly what is drawn — cap, gills and stem,
     unpadded — built in `model/mushroom-outline.ts`, which the painter reads
     too; the front-most drawn part takes the tap, held by a clump sweep in
     `layout.test.ts`. `setInteractive` takes a non-geometry hit area only in
     its config form: Phaser reads any other plain object as a config.
   - Every slot's size is floored so its narrowest cap is `2 × TAP_RADIUS`
     wide; the controls and the sun (`sky-layout.ts`) stand clear of every
     slot's tap area; no cap is more than ~25% covered by a nearer one. Each
     is a 2000-visit sweep on every screen, phone landscape included.
   - `−` with nothing selected sinks the newest mushroom; a control that
     cannot act shakes its head (`shake`) with a "nuh-uh". The picker unfolds
     from `+` and folds back into it on the clock; `remove` and a flower tap
     close it, a flower tap counting as a tap on the meadow. The selected
     mushroom carries a traced outline that follows it (`beckon`); buttons
     are opaque discs.
   - `pnpm play:mushrooms` builds a probe export (`NEXT_PUBLIC_MUSHROOM_PROBE`
     hands the game to the page), plays every control on four screens over
     the DevTools protocol, stepping the sleeping loop, and fails on any page
     error or wrong effect; frames land in `tmp/play/`. Every bite's last
     frames come from it, after its last source commit.

4. **The mouse house.** A house button under `−` (a fly agaric with two
   windows and a door) opens a picker of Syama's window row — `⊕`, `○`, `□`,
   the tall `▯` — and the door, sharing the top band with the cap picker; a
   pick furnishes the selected mushroom, or the newest, and the picker stays
   open for the next. Windows sit in a row along the cap's lower band, each
   taking the place of any spot it touches; the door stands at the lowest
   station on the stem that the mushrooms in front leave in sight
   (`door-sight.ts`), and now and then it swings open and a mouse looks out,
   blinks and ducks back. A tap on a door calls the mouse at once with a
   squeak. What the next bites build on:
   - `model/house.ts`: `WINDOW_KINDS`, `FURNISHINGS`, `House`, `PANE`,
     `windowSlots` (three or five, never four, so a full row balances;
     centre first, then mirrored pairs, in the cap frame) and `doorStations`
     (the mushroom frame). `house` lives on `Planted` in `game.ts`, which
     gains `house` (toggles the picker, `Meadow.furnishing`) and `furnish`;
     `canFurnish` is the can-act check. The pickers close each other, and one
     opening hides the other at once rather than folding it.
   - `motion.ts` gains `peek`, `peekAfterTap`, `mouseOut` (the one the scene
     reads), `lookAbout` and `blink`; `geometry.ts` gains `clipToConvex`,
     which clips the mouse to its doorway.
   - `button.ts` (a button's press and shake) and `picker.ts` (unfold and
     fold on the clock) serve both pickers; `house-view.ts` keeps a graphics
     per mushroom that copies its pose every frame, so the house follows
     every breath, wobble, emergence and sinking; `draw-house.ts` and
     `draw-mouse.ts` paint. `sound.ts` gains `knock` and `squeak`.
   - Placement per screen: five in a row under the sky on tablets, desktop
     and phone portrait; on phone landscape the house button stands left of
     `+`; on a 320 px phone four in the row and the fifth beside the mute,
     the house button top right. `layout.test.ts` sweeps them all.
   - `scripts/lib/play-house.ts` plays the house: every kind, a full row and
     a second door shaking with no change, a door tap bringing the mouse out
     without changing the selection, the pickers closing each other. A full
     run takes ~8 minutes: build once, then `--no-build`.

5. **The butterfly.** A butterfly button heads a column on the left, as the
   drawing has it; a press flies one in from off screen on a curve, and it
   goes between flowers and caps, drinking at a head, resting on a cap facing
   up the screen with its wings slowly opening and closing, bobbing as it
   lands. A tap on one at rest sends it off with a trill. A butterfly on a
   sinking mushroom flies off; past four, the oldest flies away. What the
   next bites build on:
   - `model/insect-genes.ts` (`Insect = WithId & InsectSeed`, `insectGenes`;
     `Nudged` is the hue-nudge base mushroom and insect genes share, in
     `random.ts` with `pick`), `model/insect-outline.ts` (the shapes and
     `wingspan`, read by painter and layout alike).
   - `model/flight.ts`: `Perch` (a flower or a cap by id, `away` by side,
     built from `PerchKind` and `SIDES`, which the probe's schema derives
     from), `Leg`, `Flight`; the next leg a pure function of seed, leg count
     and what the scene can see — the flowers in sight and the perches too
     close together, from `ui/scene/perch-sight.ts` — skipping perches other
     fliers hold. `model/insects.ts`: `Flier`, `INSECT_LIMITS` and the
     reducer helpers; `evicted` counts the releasing kind only. `game.ts`
     gains `insects`, `released` and `release`, `startle`, `tick`; `tick`
     and `startle` hand back the same `Meadow` when nothing changed, and the
     scene skips reconciling then.
   - `model/insect-motion.ts` (ms, where `motion.ts` is seconds):
     `flightPoint`, `heading`, `tilt`, `wingBeat`, `landingBob`; the body's
     turn (`bodyTurn`, continuous across ±π), a leg cut short mid-air
     carrying its lift and speed on, `drinking` and `proboscis`, and
     `drinkDip`, which the scene applies to the flower's head. A tap on a
     resting butterfly goes through to what it sits on.
   - `draw-insect.ts` paints hind wings, fore wings and body into three
     graphics in one container; `insect-view.ts` owns the butterflies on
     screen, starting each leg from the last drawn point as a screen
     fraction and following its perch each frame (`MushroomBed.capTop`).
     Butterflies draw above the meadow and under the buttons, and take the
     tap first; `hit-areas.ts` gains `TappedFigure`. `sound.ts` gains
     `trill`; `hud.ts` `drawButterflyButton`.
   - Placement: level with `+` on tablets, desktop and phone portrait; beside
     the mute on phone landscape and a 320 px phone. `insect-layout.test.ts`
     holds the butterfly's size (at least 52 px, narrower than any clump
     cap). `scripts/lib/play-insects.ts` plays releases, the limit, taps and
     a sinking perch on every screen; a step draws only its last frame, so a
     full run takes ~2.5 minutes.

6. **The fly and the bee — the MPP line.** Fly and bee buttons join the
   butterfly's column on the left; a press flies one in with its own buzz.
   Flies zigzag fast and settle mostly on the spotted fly agarics, where they
   jitter, rub their legs and hop; bees bob from flower to flower with
   pollen specks in their baskets, and a bee leaving a flower it pollinated
   plants a new one in a ring round it, which grows out of the ground and
   blooms with a chime. Every control in the drawing now works. What the
   next bites build on:
   - `model/`: `insect-genes.ts` (`INSECT_KINDS`, `InsectBody`, `Buzzing`,
     `GenesOf<K>`), `fly-genes.ts`, `bee-genes.ts`; `insect-outline.ts`
     `buzzWing`. `flight.ts` `FLIGHT_HABITS[kind]` (a bee is never offered a
     cap, and never settles back on the flower it leaves); `Perches` carries
     `spotted`, `Sight` a `Plot` (`room`, `seededFlowers`). `insects.ts`
     `INSECT_LIMITS` 4/3/3. `pollen.ts`: `FLOWER_LIMIT` 14, `Sown`,
     `Meadow.planted`, a bee's `pollen`, `specksAt`. `insect-paths.ts` holds
     the per-kind path (`PATH_SHAPES`); `buzz-rest.ts` the rest fidgets, in
     the insect's size units, cut off where they stand on a startle.
   - `ui/scene/`: `flower-bed.ts` owns every flower, seeded and planted;
     `flower-plots.ts` places them, a planted one in one of six ring slots in
     its parent's size; `flower-sight.ts` offers a slot only when it is on
     the ground, clear of feet and heads and in sight on this screen and the
     same screen turned. `draw-fly.ts`, `draw-bee.ts`, `draw-buzz.ts` (wings
     as their own graphics, a translucent fan aloft); `insect-look.ts` per
     kind's parts and fidgets; `insect-voices.ts` and `synth.ts` the buzzes.
     A body's turn is capped at 10.8 rad/s; a landed flier keeps the heading
     it landed on (the fix for bite 5's head-down butterfly). Air spots
     nearer than the widest wingspan are crowded pairs.
   - Placement: a column under the mute on tablets and desktop, a row beside
     the mute on phones; on a 320 px phone the fly and bee buttons share the
     pickers' band and hide while one is open.
   - The play run has a fifth screen (`phoneS`, 320 px) and `--screens`;
     `play-buzzers.ts` and `flier-watch.ts` fail it on a turn over 0.2 rad a
     frame, a settled flier not facing up, overlapping hoverers or a drawn
     span under the floor.
   - Its review (5331309763, T50–T59) is handled: fliers crowd by their own
     kinds' seats and spans, and give way to waiting bees (`perch-room.ts`);
     the air grid seats every limit where the screen allows and a flier with
     nowhere to go hovers; a long flight is capped per kind (`slowest`) and
     darts, then comes in at its kind's pace; a flier faces the way its
     moving perch carries it (`insect-steering.ts`); a released cap settles
     over 1.3 s and a reselect swells on from where it stands (`motion.ts`);
     the sun stands whole in the sky over a valley in the far hills. The play
     run's heading watch is over one bob and passes on every screen.

7. **Atmosphere.** The meadow has air between its layers and one light.
   The sky pales from a softer blue through near-white to a warm cream at
   the hills, and the sun sits in a clean gold halo; three hill ranges
   recede toward a shared `air`, each misting at its foot and lit on the
   slopes that face the sun; the ground runs lit and yellower far to deeper
   near under soft seeded patches and a grain, meeting the hills on a
   wavering seam; grass is toned by distance. Every creature is inked in the
   dark of its own fill pulled toward an indigo (Syama's pen), heavier in
   shade and thinner toward the light, legs and feelers tapering; shade,
   shine, rim light and cast shadows come from where the sun actually is,
   warm lights over cool shadows. The fly agaric stays red with white spots;
   the HUD discs keep their even ring. What the next bites build on:
   - The colour table is three modules: `palette.ts` (shared: `air`,
     `inkCool`, `ink`…; merges the other two into `PALETTE`),
     `palette-backdrop.ts` and `palette-creatures.ts`.
   - `model/light.ts`: `sunLight(layout)` (a unit vector toward the sun,
     screen axes) and `PICTOGRAM_LIGHT`; the scene hands the light to every
     bed and painter, and a resize repaints, so a turn moves it.
   - `ink.ts`: `inkFor(fill)` takes the fill as drawn, haze included; the
     ink or the fill stands 3:1 off every ground down to `groundDeep`, the
     ink always stands off its fill — a darker line round a light or mid
     fill, the fill's own hue a little lighter round one dark enough to
     stand off every ground itself — and no ink is darker than
     `INK_LEAST`; `lineInk` strokes feelers; `innerInk`, `weightedOutline` (an underlay pushed out by the
     light), `taperedLine`, `facingArc`, `shadowFall`; `colour.ts` is
     Phaser-free, with `darken`, `luminance`, `contrast`. A new creature
     (bite 8's species) is inked and lit through these.
   - The backdrop is `paint-sky.ts` and `paint-land.ts` behind
     `paintBackdrop`'s layer contract; `backdrop-tones.ts` the derived
     colours, `grain.ts` one seeded canvas texture under the grass. No Phaser
     filters and no gradient fills: bands and that one texture.
   - Insects are lit from the sun whatever their heading: each is painted
     in its own frame with the sun turned to match (`turnedLight`), and its
     lit parts are painted again whenever it turns past π/8 (`litTurn`);
     clear wings keep a plain edge. The house stands on its
     mushroom's shadow.
   - The spec and the references' reading are in
     `docs/remove-before-merging/atmosphere/look.md`.
   - Its review (5340556382, T60–T73) is handled: the backdrop and the
     button faces are baked once a paint, and the play run fails a screen
     past a 26 ms median frame (`scripts/lib/frame-budget.ts`) and a flier
     turning past its `TURN_RATE` or lit past `LIGHT_STEP`; the halo fades
     to nothing in four smoothstep layers painted as shaded cells, the hills
     parting wider than it; the wash stops short of every slot's foot; each
     mushroom and flower takes its light from where it stands, the side
     shade scaled by how sideways the sun is; the shine goes down before
     the spots; the stem's foot stands level and rounded over a centred
     contact shadow.

8. **Real mushrooms.** The cap picker's four buttons are four species, each
   a real mushroom a child knows: the fly agaric as before, red with white
   spots; the porcini, a brown bun cap on a short barrel of a pale stem over
   a heavier contact shadow; the chanterelle, an upright egg-yolk-orange
   trumpet, its mouth open over a rim waving in lobes and its ridges running
   down the stem; the russula, a flat cap dished at its middle, in red, rose,
   violet, ochre or green on a white stem. Only the look changed: flies still
   favour the fly agaric (the one `spotted` cap), and the meadow still opens
   with two of them. What the next bites build on:
   - `model/mushroom-genes.ts`: `MUSHROOM_SPECIES`, `Species`,
     `Mushroom.species`; `MushroomGenes` a union on `species`, one gene
     table per species drawn in one order so a seed's stream stays aligned
     (`ChanterelleGenes` with `lip`, `hollow`, `flare`, the rim's wave,
     `lobes`, `ridges`; a russula's `hollow` and `tone` from
     `RUSSULA_TONES`). `HEAD_KIND` gives each species its head's shape, dome
     or trumpet: what is drawn, lit and housed by shape asks it
     (`hasTrumpet` narrowing to the trumpet's genes, `DomeGenes` derived
     from it), what is a species' own colour or genes asks the species.
   - The clump stands each species' foot by its own shift (`CLUMP_SHIFT`,
     `ui/scene/clump-layout.ts`), so over 2000 visits × all 16 back/front
     pairs × every screen the back cap stays ≥ 45% in view and the back
     doorway ≥ 80% in sight, and the porcini reads stout by a short barrel of
     a stem (visible stem ~0.58 of its cap, the fly agaric's ~0.8). The
     opening clump of two fly agarics stands as before.
   - `model/mushroom-profile.ts` (each species' stem width, `capSurface`,
     `capBase`, the russula's dish, the chanterelle's `rimWave` in `lobes`
     whole crests, `frontSag`, `funnelHeight`, `funnelEdge`),
     `mushroom-outline.ts` (`headOutlines`, `capOutlines`, `tapArea` — the
     chanterelle's lip, funnel and stem are its cap, gills and stem —
     `inkWidth`, and `gillLines`: a porcini's sponge and a russula's gills
     hang as a band under the dome, drawn up round the stem) and
     `chanterelle-outline.ts` (`trumpetOutlines`, `ridgeLines`, `mouthEdges`,
     `MOUTH_LINE`). The painter stays inside the layout's bound
     (`speciesReach`, `maxReach`), swept per species over the drawn, turned
     cap. Butterflies sit on `capSeat`, on the real surface.
   - `doorStations(genes, turn)` follows the levelled, turned stem as drawn,
     each door sized by its own stem (at most `DOOR_MOST`); a chanterelle
     takes one window, on its funnel face, the others three or five. A door
     refuses a tap only to a nearer door whose tap area also holds it
     (`tappedDoor`, `ui/scene/door-tap.ts`).
   - Painting: `mushroom-paint.ts` (the stem and cap light every species
     shares), `paint-dome.ts` (fly agaric, porcini, russula) and
     `paint-trumpet.ts` (the chanterelle, both inks before either fill);
     `mushroom-tints.ts` the fills, the colours in `palette-creatures.ts`:
     a chanterelle's every fill at hue 20–30°, the porcini browns, shaded
     and hazed, held out of the weak-edge band a sweep of `inkFor` finds
     (0.021–0.050 today). A chanterelle takes 0.55 of the haze (`heldHaze`)
     so a far one stays orange; `HEAVY_FOOT` darkens a foot at least 0.37
     of its cap across; a house's frames take a pale edge on a dark cap.
     `icon-genes.ts` holds the pictograms' genes and size, Phaser-free, the
     picker's chanterelle the meadow's trumpet, its mouth fill at most about
     half the lip's depth.
   - The selection's ground ring is as wide as the foot (`footWidth` at the
     drawn turn), meeting the band at its corners; `strokeShape` closes each
     outline itself, and the play run checks the band for gaps
     (`scripts/lib/play-band.ts`).
   - Flowers live in `ui/scene/flower-layout.ts`, placed against the union
     of both meadows' feet (the margined, floored forest and the unmargined
     one); a seeded flower stands clear of every control's drawn circle and
     at most half hidden by the clump the visit opens with
     (`clump-shade.ts`), on the screen it opens on and on it turned, and is
     kept only where both have room, the flowers per visit that survive
     reported; later sizes map it by proportion. Bees keep clear of the feet
     standing now and of every species' place in free slots
     (`claimedPlaces`).
   - The layout's 2000-visit sweeps and the house's tests run every species
     in every slot. The play run grows each species from the picker and
     shoots it (`scripts/lib/play-species.ts`). Median frames 16–19 ms. Its
     review (5344789171, T74–T92) is handled.

9. **The operator's two ideas weighed, and the meadow on the ground.** A
   grown mushroom takes a foot of its own on the ground, picked where it
   fits, and the seeded flowers stand on that ground too. The two Russian documents are in
   `docs/remove-before-merging/ideas/` (`idea-1-walking-meadow.md`,
   `idea-2-flower-keyboard.md`), posted on the PR (comment 5889105662),
   waiting for the operator's call. What the next bites build on:
   - `model/ground.ts`: `Ground {x, z}` in the clump's units, `Camera`,
     `project` (screen position, scale, haze, depth), `depthScale`, `hazeAt`,
     `COMMON_FRAME`, `inFrame`, `fitCamera(screen, lens)` — the lens carries
     the reach, edge margin and floor that live in ui code. A rotation or
     resize builds a new camera and moves nothing on the ground.
   - `clump-layout.ts` stands the opening clump on one ground table
     (`standOn(camera, foot, size, splay)`); `layout.ts` exposes
     `ZOOM_FLOOR`, `meadowCamera`, `MeadowLayout.camera`. Landscape screens
     show the clump about half its old size with meadow round it (tabL 361 →
     171 px), accepted: one world while there is no pan, and in line with
     "объекты великоваты".
   - `ui/scene/mushroom-tap.ts`: a mushroom's tap area is what is drawn
     until its head is drawn narrower than `FINGER_ACROSS` (60.8 px); then
     it also holds a `TAP_RADIUS` circle round the head's middle, which never
     takes a tap from another mushroom's drawn body. A finger's target rests
     on this pad, not on a raised zoom floor.
   - **The rules hold on this screen and on it turned**, not on every
     screen: a meadow never leaves its browser, so a turn or a small resize
     is all that can happen to it. `frameFor(screen, lens)` and
     `meadow-camera.ts` derive the common frame as the overlap of this
     screen's camera and its turn's, and the camera fits it.
     `FORESHORTENING`'s span is derived from the screens the play run
     covers (0.252–0.765).
   - `model/placement.ts`: `pickFoot` takes the best of `ROUNDS` (32)
     candidate feet by the new mushroom's seed; `Planted.foot`, and the
     `grow` action carries it. `ui/scene/mushroom-room.ts` `roomFor` checks
     a foot on the screen and its turn, `cap-cover.ts` how much of a cap
     is hidden, and `+` shakes its head when no foot passes. The meadow
     holds up to six as far as there is room: every screen reaches six in
     ≥ 99.5% of 2000 visits except the small phone, at 69%, accepted (a 320
     px phone stopping at five is the room it has; K 48 reached only 85% at
     four times the cost). Feet keep a 0.2 foot distance from flowers
     rather than `clearOfFlowers`, which rejected ~13× more feet than every
     other rule together. On the small phone upright a widest-gene cap on
     the frame's near corners stands up to 20 px past the edge margin,
     accepted and named in `ground.test.ts`.
   - Seeded flowers (`seededBed`, `flowersOn`, `flowerFeet`) spread over
     the frame, so a turn loses none. A bee sits no nearer a flower's
     middle than `FACE_REACH`. The bees' slots are two rings in ground
     steps, the second of twelve at 2.3 of the parent's size, so a full
     forest plants a median of 5–6; the small phone reaches 3 with any
     ring, so its full forest asserts `LEAST_IN_A_FOREST` 3 and
     `LEAST_PLANTED` 4 holds everywhere else.
   - `placeSun` shrinks the sun until its rays clear each opening mushroom's
     reach — 24 → 16 px, on the small phone sideways only.
   - Shared bases `Layered`, `Framed`, `Screened`; `Camera.midline`. The
     mushroom suite runs 48 files in ~212 s, none over 60 s (run in chunks:
     one call exceeds the tool limit); `layout.test.ts` and
     `meadow-rules.test.ts` sweep placed meadows on the screen and its turn.
   - Waiting for the operator (the first document's list): pan and pinch,
     the world's edges, a panorama wider than the screen, insects in world
     coordinates, the mute.

## Rest of the elephant

In order.

**Open:** the sky may read a little plain since bite 7 tamed the halo.
Carried from bite 6: fliers are kept apart where they sit and hover, not in flight, so a flier crossing
the meadow is drawn straight over one seated on a cap (frame
`phoneL-butterfly-crosses-one-on-a-cap.png`); on a 320 px phone the air
seats eight of ten fliers apart, two holding overlapping spots on 33% of
ticks with the opening clump (`AIR_UNMET`, two `todo` tests); a flight in
from off screen still takes up to 5 s for a butterfly; a butterfly making
way for a bee leaves its flower moments after landing, which may read as a
twitch; a flier holding an air spot is drawn still, with no hover bob.

10. **The flowers as an instrument.** The operator's second idea, placed
    here on their word (review 5354936232, "да, ок" to "сразу после текущего
    байта 9, до пунктов 10–12"). The design is
    `docs/remove-before-merging/ideas/idea-2-flower-keyboard.md`, its
    § «Что ты решил» overriding the rest:
    - Five flower colours stay. Three colours × four shapes (`petal` ×
      `rings`) are twelve pitch classes, played by the nearest-note rule
      over three octaves; the other two colours × four shapes are eight
      drums — kick, snare, hat, three toms, shaker, rim — soft and
      synthesized, downtempo/trip-hop, never an acoustic kit ("Это не
      должно звучать как акустическая установка").
    - Every flower's hue is nudged from its seed, bounded so its class
      still reads by eye ("чтобы розовый два раза не получался абсолютно
      одинаковый"). Colour blindness is not designed for yet ("давай туда
      пока не будем идти, это всегда успеется").
    - Seeded flowers are pentatonic, C D E G A, plus a kick and a hat
      ("пусть будет пентатоника"); bees bring the other notes and drums.
    - **The child plants flowers too.** A tap on a grass tuft (only there)
      opens a two-stage picker — one of five colours, then one of four
      shapes, no stage over five buttons, no words — and the chosen flower
      grows on that tuft ("не случайный, а именно тот который потом в две
      стадии пикера выберет ребёнок"; "сажать можно не везде, а только там
      где есть травка"). Bees still bring their own.
    - **Darker is lower**, one law for notes and drums, never random:
      blue C–D♯, pink E–G, yellow G♯–B; within a colour the shapes rise
      round-one-ring, round-two, pointed-one, pointed-two. Violet is the
      skins (kick, then the toms low to high), white the ticks (snare,
      rim, hat, shaker — pointed for the noisy two). The keyboard's drum
      rows follow the same order: `a s d f` violet, `q w e r` white. The
      agent's proposal, standing unless the operator redraws it.
    - Chords: several fingers at once, a compressor on `master` ("нужно,
      да, особенно с учётом барабанов"). Item 11 takes no pinch: the
      operator's call on the first idea is one finger (review 5355192406,
      «давай однопальцевые жесты»).
    - Keyboard on the canvas host: `g h j k l ; '` the white keys C–B,
      `y u o p [` the sharps, `a s d f` and `q w e r` the eight drums,
      `z`/`x` the octave.

11. **A wider meadow, cropped and zoomed.** The ideas in the operator's
    comment 4131492133 stay out of this plan ("Не вноси их пока ни в какой
    план, но подготовь отдельные два документа (по одному на идею) … Исходя из
    этого будем думать. Документы на русском."); what of this item waits on
    the first of them is left for the operator's call. The meadow is a world wider than
    the screen, and the screen a window onto it: a rotation or a smaller
    screen changes the crop, not the layout, and the child pans left and
    right and pinches to zoom, a gesture known from photos ("если мы сделаем
    более широкое поле, то можно делать не ресайз а просто кроп, а там уже
    ребёнок сам будет водить влево-вправо"; "кажется, что экран слишком
    маловат — или объекты великоваты — чтобы было прямо интересно"). It
    starts from the meadow as it stands. It revisits the rules that exist
    only because a rotation re-lays the world — the turned-screen planting
    guard, flowers placed against the feet of both meadows, the slot
    floors per screen — and the taps-only rule for a two-finger pinch and a
    one-finger pan. Walking through the meadow, as a spectator or a
    participant the insects fly from, stays out of scope for now.

12. **Rain.** A tap on a cloud darkens it and it rains, falling as drops that
    splash on caps and ground, with its own sound. While it rains, flowers
    close, insects shelter under the nearest cap, and mushrooms swell a
    little. When it stops, the sun comes back with a rainbow, and spores an
    old mushroom shed sprout into little mushrooms that grow over the next
    minutes, within the forest's cap.
13. **Dusk.** The dark scheme is dusk: the sky, dimmer hills, windows
    glowing, fireflies waking, mice coming out of their doors, butterflies
    folded on the caps and flowers closed for the night.
14. **Around the canvas.** A way home as a pictogram; `prefers-reduced-motion`
    (idle loops off, short tweens without overshoot); a visually hidden row
    of HTML buttons beside the canvas dispatching the same actions, for
    assistive tech; a home-page link in the footer's `SEE_ALSO` if that list
    carries side projects, none otherwise. Then, the Artifact republished,
    `/relay /finalize`.

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
