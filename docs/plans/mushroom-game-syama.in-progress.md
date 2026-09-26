# Syama's mushroom game

The whole game at `/mushrooms`, from Syama's drawing and voice notes (spec in
issue #65): a meadow of fly agarics, each with a mouse house, where a press
grows another mushroom and a press on a bug button flies one in — every
mushroom and every insect grown from its own seed, so a forest of them is all
different trees. No goal, no text, no failing: the player is six, and the
point, in his words, is to watch the butterflies, flies and bees.

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
  `Scale.RESIZE`, a full-bleed canvas at `100dvh`, `touch-action: none`. No
  physics engine; tweens and particles carry motion.
- **A pure model decides, the scene reconciles.** `model/` holds the state, a
  reducer and the generators, all Phaser-free and under `node:test`; the scene
  diffs states by id and animates the difference. Randomness enters the model
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
- **`palette.ts` is the one file on the site holding colour literals.** A
  canvas is out of the CSS tokens' reach; `.claude/rules/styling.md`
  § Colours says so in one sentence scoped to that path.

## This bite

**The meadow, still** — a page at `/mushrooms` that paints a sunny meadow and
two fly agarics grown from the visit's seed, with nothing moving yet.

- **Route and page.** `pnpm add phaser` (4.x). `apps/vova/app/mushrooms/page.tsx`
  re-exports `MushroomsPage` and `mushroomsMetadata` from `@/pages/mushrooms`;
  `PAGE_ROUTES.mushrooms` feeds the sitemap; `lib/mushrooms-metadata.ts` calls
  `constructMetadata` with title "Mushrooms - <site name>" and description "A
  meadow of fly agarics, from a drawing by Syama.".
- **The slice** `src/pages/mushrooms/`: `index.ts`; `ui/mushrooms-page.tsx`
  (server) renders `ui/meadow-canvas.tsx` (`'use client'`), whose `useEffect`
  dynamically imports `ui/scene/start-game.ts` and destroys the game on
  unmount; `ui/mushrooms.module.scss` pins the host `fixed` over the viewport
  at `100dvh` with `touch-action: none`. `assets/reference/syama-drawing.webp`
  moves in from `docs/remove-before-merging/`.
- **Model**, Phaser-free: `model/random.ts` — `Random` (a `() => number` in
  `[0, 1)`), `mulberry32(seed)`, `between`, `pick`, `chance`;
  `model/mushroom-genes.ts` — `CAP_KINDS` (`spotted`, `plain`, `dark-top`,
  `dark-bottom`), `Seeded`/`WithId` bases, `Mushroom = WithId & Seeded &
  { cap }`, `mushroomGenes(mushroom)` (stem height, width and foot bulge, lean,
  cap width, height and dome power, spots for `spotted` only, a hue nudge — all
  in units of the mushroom's size), `firstMushrooms(random)` for the two the
  meadow opens with. `mushroom-genes.test.ts`: same seed same genes, every gene
  in its range over many seeds, spots inside the cap and off the rim, no two
  spots overlapping.
- **Scene**: `ui/scene/palette.ts` (every colour of the game),
  `ui/scene/layout.ts` (pure: viewport → horizon, hill bands, sun, where each
  mushroom stands and how big, landscape and portrait),
  `ui/scene/draw-mushroom.ts` (genes → `Graphics`: outline, flat fill, shade,
  highlight, the two-tone caps split along a dome level),
  `ui/scene/meadow-scene.ts` (sky in bands, sun with a glow, a few clouds, far
  and near hills, a ground band with tufts, the two mushrooms; redrawn on
  resize), rendered at the device pixel ratio so a tablet's retina screen is
  not blurred.
- **Rules.** `.claude/rules/styling.md` § Colours names `palette.ts` as the
  one file holding colour literals.
- **Done when** `/preview` frames at tablet landscape and phone portrait show
  the meadow as described, and `./scripts/vet.sh` is green.

## Rest of the elephant

In order; the **MPP** line — every control in the drawing working — is after
the insects.

2. **The meadow alive, and heard.** Idle motion: clouds drift, grass sways,
   mushrooms breathe. A tap on a mushroom wobbles it (squash and stretch) and
   puffs spores. `ui/scene/sound.ts`: a Web Audio synth, started on the first
   tap (autoplay policy), with pop, boing and a soft ambient bed; a mute
   pictogram remembered in `localStorage`.
3. **More mushrooms: `+`, the cap picker, `−`, a forest.** `model/game.ts`
   gains the reducer and its tests. `+` opens the four-cap picker as big
   pictograms; a pick grows a fresh-seeded mushroom out of the ground. Tap
   selects (soft glow); `−` shrinks the selected one back into the ground.
   The layout turns a growing count into a forest: rows in depth, back rows
   smaller and hazier; a cap on the count set by what still reads on a phone,
   decided in this bite by frames. HUD pictograms drawn by code.
4. **The mouse house.** Syama's window row — `⊕`, `○`, `□`, the tall `▯` —
   and the door, as pictograms; a pick puts it on the selected mushroom
   (windows on the cap, the door on the stem, slots from the genes). A mouse
   peeks out of a door now and then.
5. **The butterfly.** `model/insect-genes.ts` (body, two wing pairs, pattern,
   colour nudge), `draw-insect.ts`, the button; a press flies one in from
   off-screen along a curve, wings beating, and it settles on a mushroom with
   a bob, opening and closing its wings at rest. Tap one and it flutters to
   another mushroom. Insects on a removed mushroom fly off.
6. **The fly and the bee.** The same generator family; fast small flights,
   jitters and hops at rest, a buzz each; an oldest-leaves limit.

   — **MPP** —

7. **Dusk.** The dark scheme is dusk: the sky, dimmer hills, windows glowing,
   fireflies.
8. **Around the canvas.** A way home as a pictogram; `prefers-reduced-motion`
   (idle loops off, short tweens without overshoot); a visually hidden row of
   HTML buttons beside the canvas dispatching the same actions, for
   assistive tech; a home-page link in the footer's `SEE_ALSO` if that list
   carries side projects, none otherwise.
9. **The artifact.** A single self-contained HTML of the game — esbuild over
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
