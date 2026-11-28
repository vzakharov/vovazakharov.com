# Wave 2 — the scenes

The shared brief for the three sessions that draw the scenes of the «Хорошо!»
music video. Each session's own message names its package (A, B or C below);
everything else it needs is here.

## What is being made

A two-minute music video drawn entirely in code, at `/music/clips/horowo` on the
vova site. Canvas 2D on a 1280×720 stage; the whole picture is a pure function
of the playhead. Look: Gorillaz and 90s television, flat-colour ink cartoon with
fat boiling outlines. It must be funny and frightening, colourful and grim at
once. The singer and all four musicians are the same robot-masked man (the
"puppet"); the antagonist is a paper-flat ghost bunny with button eyes that
comes nearer as the song goes on.

Two layers, told apart by their picture:

- **The broadcast** — channel «ГБ», 4:3 inside the 16:9 frame, seen through a
  worn VHS tape. Drawn through `broadcast(pen, scene, options)`.
- **Reality** — full 16:9, clean ink, dark: whoever is watching the channel.
  Drawn through `reality(pen, scene)` or straight on the stage.

Wave 1 built and merged everything a scene is drawn with — the ink kit, the
tape, the puppet and band, the bunny and props, the engine. Every section is a
placeholder card today. **Wave 2 replaces the placeholders with scenes.**

## The budget, which shapes how you work

The account's weekly limit is nearly spent: a package has about **$12 at API
rates**, and the run can be cut off at any moment. So:

- **Push each scene the moment it is wired into its section's shot list** and
  passes `tsc` — a cut-off must lose nothing. A scene that exists but is not in
  the shot list does not count.
- **Read only the index files named below** and the one or two files behind a
  function you are unsure of. No tour of the repository.
- **One still per scene, looked at once, at 1280×720.** Fix what is wrong, look
  once more, move on. No contact sheets, no frame-by-frame study.
- **Gates once per pushed step, and only the quick ones**: `pnpm exec tsc
--noEmit -p sites/vova`, `pnpm lint:files <your files>`, `pnpm exec prettier
--write <your files>`. At the very end add `pnpm check:masd` and `pnpm
type-overlap`. **Skip `/dry`, `/tend-prose`, `pnpm build` and
  `./scripts/vet.sh`** — the lead runs them once over everything.
- **Breadth before depth.** Every shot of your package drawn simply beats one
  shot drawn richly. Go back and enrich only with budget left.
- Write in English, in the session and in the code.

## Rules of the tree

- Work on your own branch, never open a PR, never touch `main`.
- Files are read and changed with the `Read`/`Edit`/`Write` tools. `Read` one
  file in a directory before creating a file in it.
- No lint-suppression comments of any kind. No `interface` (type aliases only).
  No file over 400 lines. Colour literals live only in `palette*.ts` files.
- A member two named types both declare needs one shared base
  (`pnpm type-overlap`); `src/clip/shared/ink/figure.ts` and the kernel typings
  hold the bases in use.
- The frame is pure: no clock, no `Math.random` (use the kit's `rng`/`noise`),
  no `ctx.filter`.
- **No full-frame flash faster than three a second.**
- Comments state the code's lasting contract, never the change.
- Scenes are **widgets**: `src/clip/widgets/<scene>/index.ts` plus `ui/*.ts`,
  importing from `@/clip/entities/*`, `@/clip/features/*`, `@/clip/shared/*`.
  A widget exports `Drawing`s (or functions returning one); the section's shot
  file under `src/clip/pages/horowo-clip/ui/` lists them as `Shot`s.
- Each entity slice carries a `masd-disable insignificant` marker naming the
  scene that removes it. When your scene is that consumer, delete the marker.

## The song, by the operator's map

The operator's map of the sections is the authority; the picture's pace is the
drummer's, so it halves when he does. «ритм должен чувствоваться в видеоряде --
не перебарщивая, конечно, но нет-нет да бочка/ведущий должны совпадать со
сменами кадра или ещё какими-то ощутимыми движениями»: cuts and the big moves
land on the score's pulse and kicks, not on every one of them.

| Song time   | Section             | Feel                                                  |
| ----------- | ------------------- | ----------------------------------------------------- |
| before 0:00 | `ident`             | pre-roll: snow, test card, the channel's ident — done |
| 0:00–0:19   | `intro`             | one hit on each bar's first beat, nothing between     |
| 0:19–0:28   | `double`            | double time, the band comes in, instrumental          |
| 0:28–0:36   | `verse` first half  | four on the floor, almost a dance                     |
| 0:36–0:43   | `verse` second half | straight punk time                                    |
| 0:43–1:00   | `chorus`            | half time                                             |
| 1:00–1:17   | `prebridge`         | quarter time, «Хорошо» chanted, building              |
| 1:17–1:35   | `bridge`            | quarter time, melodic, the one tender stretch         |
| 1:35–end    | `breakdown`         | a new slow tempo, stabs and holes, glitches           |

The words are in `sites/vova/public/music/songs/` (the `horowo` song); `wordAt`
in the score gives the word being sung at a time.

## The shot list

- **Intro — broadcast (package A).** A children's show. The host (puppet in the
  `suit` outfit) sings the first stanza to camera on the meadow set; nothing
  moves between the hits and everything jolts on one: the cardboard sun's eyes
  snap to him, the bunny rises a notch behind the hill, the camera punches in.
  On «Как, сука, хорошо» (about 0:16) the jaw drops all the way; the set falls
  into static.
- **Double time — broadcast (package B).** The band live in a TV studio at full
  tilt: a cut on every beat or two between the four players and a wide shot,
  the studio audience a row of bunny ears (`studioAudience`, `earFireworks`).
- **Verse — reality with broadcast inserts (bedroom: package C; channels:
  package B).** The bedroom at 3 am, bunny wallpaper, the TV in the corner
  pulsing on every quarter, the man in the bed (`pajama`) nodding along against
  his will. Each of the seven «(Хорошо!)» calls (`VERSE_CALLS`) is the TV
  full-frame on a new channel for a beat; the line that answers it plays in the
  bedroom. Second half, rawer: a bunny-shaped hole in the wallpaper, the bunny
  by the window, then at the foot of the bed; the channels have him in them.
- **Chorus — broadcast, cut with reality (meadow: package A; inserts: B and
  C).** The operator: «припев такой faux-счастливый должен быть, понимаешь, типа
  все веселятся и скачут по этому creepy лугу (но конечно это должно
  перемежаться с выскребанием надписи в дурдоме)», and «врезки группы тоже можно
  делать». Back on the kids' show meadow and everyone is having a wonderful
  time: the four of the band hop about with their instruments, bunnies dance,
  the cardboard sun bobs and grins, the letter blocks bounce — all landing
  together on the half-time pulse, smiles a size too wide, serotonin coming
  down like confetti. Between the hops, hard cuts for a beat or two to the ward
  (a fingernail gouging the next strokes of «КАК, СУКА, ХОРОШО» into the paint,
  further along at each return, finished by the chorus's end) and to the band
  live in the studio.
- **Pre-bridge (package B).** The zapping slows to a crawl: one channel a bar,
  each held long enough to read, the bunny on every one a step nearer the
  glass. Dread by patience.
- **Bridge — reality (package C).** The ward: the scratched words are on the
  wall, the tallies spread past every edge, the bunny sits down beside the man
  (`strait`) and they watch the TV snow together.
- **Breakdown and ending (package C).** The tape itself breaks down: each stab
  a picture at full colour torn by tracking errors (`wear` near 1), each hole
  the silent ward. Then the pull back through the window — the hospital is a
  snow globe in the bunny's paws, serotonin falling only inside — and the
  picture collapses to a CRT dot (`tubeOff`). The channel's address
  `T.ME/FKNBALL` in the dot face may close the last frame before the dot.

## The packages and their seams

Each package owns its widgets and the shot files of its sections. Where a
section mixes packages, its owner leaves a **named placeholder shot** at the
insert's time range (`placeholder('<name>', wash)`), and the lead swaps it for
the other package's drawing at merge.

- **A — the kids' show.** Widget `kids-show` (intro) and `meadow-party`
  (chorus). Owns `shots-intro.ts` and `shots-chorus.ts`. In the chorus, leaves
  placeholders named `ward insert` and `gig insert` in the rotation (a beat or
  two each, on the half-time pulse; roughly meadow 60%, ward 25%, gig 15%).
- **B — the gig and the channels.** Widget `gig` exporting the studio
  performance as drawings (a wide shot and one per player), and widget
  `channels` exporting `channel(n)` — at least eight distinct channels in the
  dot-face/tape idiom (teleshop spoon, weather, a quiz board with the three
  words, a village postcard, the news, a test card with the bunny in it, an
  aerobics show, a station clock), each taking the bunny's nearness. Owns
  `shots-double.ts` and `shots-prebridge.ts`. Exports from `gig` a `gigInsert`
  drawing for the chorus and from `channels` the `channel(n)` the verse cuts to.
- **C — the bedroom, the ward and the end.** Widget `bedroom` (verse), `ward`
  (bridge, and exporting `wardInsert(progress)` — the scratching at a given
  progress — for the chorus), `ending` (breakdown, snow globe, switch-off). Owns
  `shots-verse.ts`, `shots-bridge.ts` and `shots-breakdown.ts`. In the verse,
  leaves placeholders named `channel 1`…`channel 7` on the `VERSE_CALLS`.

Do not edit another package's files, the entities, or `shared/*`. If one of
them needs a change, make the smallest one that unblocks you, and name it in
your report.

## What a scene is drawn with

Import paths are slice roots; read each slice's `index.ts` for exact
signatures before the first call.

- **Kit — `@/clip/shared/ink`**: `penAt, STAGE, ink, limb, at, path, polygon,
ellipse, noise, reseed, rng, INK_PALETTE, clipped, inLayer`, type
  `Figure = Place & Partial<Seeded>`, and point math `add, sub, times, lerp,
mix, distance, clamp, turned, heading, smoothstep`. `Pen = { ctx, playhead,
boil }`.
- **Tape — `@/clip/shared/tape`**: `broadcast(pen, scene, { wear, zap,
unbranded, osd })`, `zapState`, `staticScene`, `snow`, `tubeOff`, `reality`,
  `dotText(pen, text, [x, y], { dot, color, shadow, align })`,
  `testCard(pen, lines)`, `SCREEN` (960×720). `wear` 0.2 is a calm broadcast,
  0.9 tears the picture.
- **Puppet and band — `@/clip/entities/puppet`**: `puppet(pen, { place, pose,
reach, build, outfit, look, grips, held, behind, front, tucked, legless,
mark })` — poses `stand, wide, cheer, sing, welcome, point, shrug, cower,
sit`; outfits `jacket, strait, suit, pajama, toy`; `mark` tells two puppets'
  boil apart. `head(pen, look, seed)`; `Look = { jaw, gaze, brow, lid, led,
eyes, hair, sweat, turn, nod }`. `player(pen, role, { beats, jaw, place,
outfit, look, mark })` plays an instrument in time; `castSheet(pen, beats,
jaw)` is all four on one stage. Pose tools: `lerpPose`, `reaching(pose,
hands, palm, elbows?)`, `carried(pose, { sway, dip, lean })`, `fitted`;
  props `guitar`, `micStand`, `thump(phase)`. There is no ready hop cycle or
  joy face: build them from `carried`, `lerpPose` and `Look`. The bass's
  headstock reaches up and right — leave room beside the drum kit.
- **Bunny — `@/clip/entities/bunny`**: `bunny(pen, { x, y, nearness,
bunnyScale, eyes, grin, arms: 'down'|'up'|'reach'|'hold'|'conduct'|'hop',
beat, hop, held, rendering: 'paper'|'shadow', swaying, seed })`, `hopAt`,
  `lookAt`, `conductingPaw`, `studioAudience(pen, { area, rows, headWidth,
liftOff, seed })`, `bunnyWallpaper(pen, { area, cell, offset, hole, seed })`.
  `nearness` runs 0 (a drawing on the wallpaper) to 1 (a grin filling the
  frame); by section: intro 0.1, double 0.2, verse 0.3→0.5, chorus 0.5,
  pre-bridge 0.6→0.85, bridge 0.7 seated, breakdown 0.9→1.
- **`@/clip/features/ear-fireworks`**: `earFireworks(pen, audience, palette)`.
- **`@/clip/entities/tally`**: `tallies(pen, { width, height, x, y, progress,
markHeight, seed })` — five-bar gates past every edge.
- **`@/clip/shared/lettering`**: `writePlain/writeBubble/writeScratched(pen,
text, { letterHeight, x, y, progress, alignment, weight, seed, … })`,
  `nailAt(text, writing) → { nailTip, strokeHeading, pressing }` — where the
  scratching nail is at that progress.
- **`@/clip/entities/serotonin`**: `serotoninFall(pen, { width, height,
density, wind, period, seed, palette })`, `flecks`.
- **`@/clip/entities/meadow`**: `cardboardSun`, `rollingHills`, `cloud`,
  `alphabetBlock`, `bounceAt`.
- **`@/clip/entities/snow-globe`**: `snowGlobe(pen, { x, y, domeRadius, inside,
plaque, shaking, seed })`.

Reference frames of all of these are under `docs/remove-before-merging/frames/`
(`cast-*.jpg`, `props-*.jpg`, `tape-*.jpg`) — look at one only when a call's
result surprises you.

## The engine

ENGINE-SECTION

## The report that ends the package

When every shot of your package is in its shot list (or the budget is spent),
commit one or two stills per scene as JPEG, 1280×720, quality 78, under
`docs/remove-before-merging/frames/scene-<name>.jpg`, push, and send **one**
`send_message` to the lead's session `session_01MZoAKCKwqeVGKcCw6iKKPs` with:
your branch and head; each scene and its exported names; what is left; anything
you changed outside your files. Then stop.
