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
   runs `/polish` and `/pr`, pauses the plan, then runs
   `/relay оставь код ревью на последний кусок`.
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
- **The result is also an Artifact** (last bite), and its link is posted on
  the PR, so the operator can open it the moment they are back.

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
- **`palette.ts` is the one file on the site holding colour literals.** A
  canvas is out of the CSS tokens' reach; `.claude/rules/styling.md`
  § Colours says so in one sentence scoped to that path.

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

## Rest of the elephant

In order; the **MPP** line — every control in the drawing working — is after
the insects.

4. **The mouse house.** Syama's window row — `⊕`, `○`, `□`, the tall `▯` —
   and the door, as pictograms; a pick puts it on the selected mushroom
   (windows on the cap, the door on the stem, slots from the genes). A mouse
   peeks out of a door now and then.
5. **The butterfly.** `model/insect-genes.ts` (body, two wing pairs, pattern,
   colour nudge), `draw-insect.ts`, the button; a press flies one in from
   off-screen along a curve, wings beating, and it goes between flowers and
   caps, drinking at a flower and resting on a cap with a bob, opening and
   closing its wings. Tap one and it flutters on. Insects on a removed
   mushroom fly off. `model/game.ts` gains `tick`, which carries what each
   creature wants next.
6. **The fly and the bee.** The same generator family; fast small flights,
   jitters and hops at rest, a buzz each; an oldest-leaves limit. The fly is
   drawn to the fly agarics. The bee visits flower after flower, a speck of
   pollen on it after each, and a new flower opens near the ones it has
   pollinated, up to the layout's cap on flowers.

   — **MPP** —

7. **Rain.** A tap on a cloud darkens it and it rains, falling as drops that
   splash on caps and ground, with its own sound. While it rains, flowers
   close, insects shelter under the nearest cap, and mushrooms swell a
   little. When it stops, the sun comes back with a rainbow, and spores an
   old mushroom shed sprout into little mushrooms that grow over the next
   minutes, within the forest's cap.
8. **Dusk.** The dark scheme is dusk: the sky, dimmer hills, windows glowing,
   fireflies waking, mice coming out of their doors, butterflies folded on
   the caps and flowers closed for the night.
9. **Around the canvas.** A way home as a pictogram; `prefers-reduced-motion`
   (idle loops off, short tweens without overshoot); a visually hidden row of
   HTML buttons beside the canvas dispatching the same actions, for
   assistive tech; a home-page link in the footer's `SEE_ALSO` if that list
   carries side projects, none otherwise.
10. **The artifact.** A single self-contained HTML of the game — esbuild over
    the scene entry, Phaser from `cdn.jsdelivr.net/npm/`, built under `tmp/`
    and not committed — published with the Artifact tool, its link posted on
    the PR. Then `/relay /finalize`.

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
