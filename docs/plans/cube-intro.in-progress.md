# The cube's intro: an island, the cube from outside, the way in

Run under `/carte-blanche` (`.claude/skills/carte-blanche/SKILL.md`). This file
is the lead's memory: read it whole after any compaction, before anything else.
It stays `.in-progress` for the whole run and is not shown to the operator.

Lead session: `session_01DaohkEr63nSs6fbnbbEpGd`, branch
`claude/cube-intro-j2wt34`, working directory
`docs/remove-before-merging/cube-intro-j2wt34/`.

## Standing rules (the operator's words)

The opening message, 2026-11-12, the parts that govern how the run goes:

> суть, кратко: ты делаешь, что хочешь, создаёшь каких хочешь подагентов и
> подсессии, они НЕ создают свои пиары, но полируют свои ветки, потом ты их
> забираешь. Спрашивать меня не останавливаешься, но сейчас, после первого
> сообщения, можешь задать мне вопросы, которые считаешь самыми важными, и на
> которые я один раз отвечу. На самом деле я потом ещё много буду встревать,
> чтоб steer-нуть туда или сюда, но, так сказать, спорадически.

> предупреждения о пределе релея игнорируешь, у тебя тут автокомпакт на 400к (на
> самом деле на 370к, 30к харнесс берёт запас -- зачем-то); трактуй два
> предупреждения (330к и 350к) как соответственно "с этого момента лучше не
> начинать чего-то большого" и "с этого момента нужно заканчивать большое, чтобы
> после автокомпакта не забыть, о чём речь".

> кажется, ещё имеет смысл на 350к обновлять файл плана, НЕ снимая его с
> .in-progress. -- так ты сможешь не потеряться даже если память после
> многократных сжатий сжатого сжатого контекста начнёт шалить. План -- только
> для твоей инфы, мне его представлять не надо.

> запускай свободно сколько угодно подсессий и подагентов. Смысл "не делать вот
> этого пока не будет сделано вот то" есть только если "вот то" реально
> блокирует "вот это". Во всех остальных случаях ты, скорее всего, замечательно
> справишься с мердж-конфликтами.

> над кубиком сейчас работает другой агент по рефакторингу (см. #275), и он
> занял борду. Заведи отдельную подсессию, единственной целью которой будет
> координировать работу с тем и черипикать борду с той ветки так, чтобы у нас
> потом получился линейный таймлапс в результате. То есть ты ей будешь
> передавать типа "добавь вот это и это", а администрирование механику будет
> обеспечивать она.

Second message: «про /task и остальной луп: руководствуйся ими как guidelines,
не как жёстким требованием.»

The operator's voice entry (`.claude/voice/operators/vzakharov.md`) applies to
every reply: Russian, «ты», «Вова», banter welcome, no "load-bearing", no
"quietly".

## The brief and the answers

The operator's brief and the answers to the one batch of questions, both
verbatim with how each was read, are in
`docs/remove-before-merging/cube-intro-j2wt34/brief.md`. Re-read it after a
compaction before deciding anything about what is being built.

## Steering since

- **2026-11-12 22:32Z–23:10Z** — the sun's direction, no Russian on the board,
  `rolled` and identical frames, "interactions come at a price", no textures,
  the pill as imagination, no look-under scene, the ladder vanishing once
  climbed and the jump out, lettering as a todo, "swallow" not "drink", the
  ghosts musing, the pause: verbatim with their readings in `brief.md` beside
  the brief, § "Steering on 2026-11-12". Their outcomes are in the contract.

- **2026-11-13 09:05Z–09:27Z** — the restart with new sessions, the pill's
  colours, cheaper models for readers, "no textures" narrowed to "nothing
  authored" (the FFT ocean stays), the children's English, the ocean explainer:
  verbatim in `brief.md`, § "Steering on 2026-11-13, morning".

- **~09:33Z, asked in shell's session**: «а тень от нас будет? или это часть
  "никакого взаимодействия с окружением (кроме таблетки)"?» **Decided yes**: a
  shadow marks nothing and remembers nothing, it is a function of where the body
  stands, like the hands. Core adds `body` to the frame (foot in W, height; 0 =
  none), walk writes it, shell draws a soft capsule `bodyShadow` beside
  `cubeShadow` — after shell's three material verdicts.
- **~09:41Z, a board comment on the ladder's frame**: «я нигде не говорил про
  материал, не имею ничего против дерева, и, кажется, это будет больше подходить
  фразе "откуда она там вообще взялась". НО если он уже переделал на алюминий,
  пусть будет». Aluminium was the lead's pick, and it read as wood in the frame
  anyway. **Decided: the ladder is wood** — weathered, sun-bleached, round
  rungs; shell's material and sound's `LADDER_MATERIAL` follow (sound: done,
  357d9e94).
- **~09:43Z, in core's session, on the doorway seen white from the room**:
  «нужно тогда динамическое привыкание и отвыкание, пожалуй». Core built the
  seam (8a4fb806): `pages/cube/lib/adaptation.ts` — `settled`, `adapted` (~0.5 s
  toward light, ~2.5 s toward dark), `lensAdapted`; `OutsideLens` has `indoors`
  0…1. The adaptation is the body's own state, never the world's. **Walk wires
  it** in `ui/walk.ts` and `lib/lit-stage.ts`; core's recipe was passed on.

## Facts established

- **The seam (core step 1, 1a311efa, merged into this branch at faedd71d)**: the
  outside is the shared segment `src/cube/shared/outside/` (barrel
  `@/cube/shared/outside`), one file per name, each package replacing its own:
  `island-height.ts` (sand), `water-level.ts` (sea), `cube-shadow.ts` (shell),
  `sky.ts` + `aerial.ts` (sky), `frame.ts`, `sun.ts`, `outdoor-frame.ts`,
  `stage.ts` (core). WGSL pieces moved to `@/cube/shared/lib/wgsl`, the hash to
  `@/cube/shared/lib/wgsl-hash`. The eye is `Whereabouts = Pose | Outside` in
  `@/cube/entities/world`. A layer is `pages/cube/ui/<name>-layer.ts`, a
  `LayerMaker` from `outdoor-layer.ts`, its shader roots in
  `pages/cube/lib/outdoor-shaders.ts`. Every package was told to merge it.
  Core's steps 2–4 (renderer takes layers and an outside eye, the frame script,
  the outside lens) are in flight; `sun.ts` still held 8° toward +z at that
  head.
- **Sand's first frames (457ccb4d, merged at 4f4d4480, not yet drawn by the
  page)**: `frames/sand/`. The lead's verdicts, sent to sand and to the board:
  `down` reads as a photograph; `stand` and `shadow` do not — ripples like
  corduroy at 5–40 m, beige with no low sun in it, glints turning to noise. They
  also showed `SKY_FILL` twice too bright against a 9° sun; core was asked to
  set [0.65, 0.87, 1.2] (the sky's share on flat ground about equal to the
  sun's) until sky's model gives its own. Still owed by core: step 2, `sun.ts`
  at 31° toward −z, the sky map removed.
- **The island (sand, `claude/cube-intro-sand` @ 04a800ac)**: the cube's centre
  is over W xz = (0, 0), the crest, sand 1.6 m; `CUBE_AT = (−2.5, 5.2, −2.5)`,
  underside y = 2.7, the doorway at x = 2.5, z −2.226…−1.256, sill y = 5.2.
  Shore from the crest: east 23.7 m, west 64.4, north 27.5, south 22.4. The
  waking spot is the still waterline at (−20.98, 20.98). `islandHeight(x, z)`
  and `ISLAND_HEIGHT_WGSL` live in `src/cube/shared/sand/island-shape.ts` until
  core names the slice; the bed's colour is `sandBed(xz, depth) -> vec3f`.
- **The sea's design (sea)**: `waterLevel` is a swell train of 420 waves an hour
  arriving by a baked arrival-time field (one `r32float` texture, so the shared
  outdoor bind group carries piece-owned bindings — asked of core); it also
  exports `shoreWetness(xz, t)` for sand and TS `seaHeightAt` for walk. One
  WGSL-in-Node test kit, sea's, lands in `src/cube/shared/lib/`; sand switches
  to it.
- **Cue names (sound, `claude/cube-intro-sound` @ b836c3ae)**: `step` with
  `ground`, `pill`, `swallow`, `rung`, `splash`, `say: 'waking'`;
  `LADDER_MATERIAL` in `shared/lib/acoustics.ts`. Passed to walk, pill, shell.

- Floor 1 is one room: `roomsAcross(1) = 1`, side 5 m, height 2.5 m
  (`ROOM_HEIGHT` 0.5 of a side), and it is the cube's top slab. Each floor down
  halves room side and height, so the slabs sum to 5 m: the bands on the cube's
  outside are the floors' own heights.
- The eye's frame is floor `n`'s room sides, origin the north-west corner of the
  eye's room on its slab, x east, y up, z south
  (`src/cube/entities/world/model/frame.ts`).
- The renderer is hand-written WebGPU (`src/cube/pages/cube/ui/renderer.ts`): a
  scene pass into an HDR target with depth, a reflection pass, bloom, then a
  per-floor "lens" pass to the canvas. Each floor has its own WGSL program.
- The hands are smooth stylised hands in grey sleeves
  (`src/cube-board/app/config/cube/beauty-08-hands.webp`); the body outside
  keeps that look — grey office clothes.
- PR #275 (`claude/cube-review-perf`, base `review-base/cube-liminal`) differs
  from `main` by 26 files, +1258 lines: a frame-rate meter and pass timer in
  `src/cube/pages/cube/ui/`, and `content:` commits on `src/cube-board/`.
- Fact sheets, written by reader agents, in the working directory:
  `facts-render.md`, `facts-play.md`, `facts-island-board.md`.

## Design decisions

Each with its reason; a later decision that overrides one rewrites it here.

- **The doorway is where floor 1's decor door stands**: the east wall, z from
  0.274 to 1.244 m (by the north-east corner), 0.97 m wide, 2.1 m tall — read
  off the planted world by running the decor's own placement. The potted plant
  stands in that corner, 0.07–0.9 m in from the wall, half across the doorway,
  and stays there. The decor door is dropped from floor 1's theme alone (15
  other floors list it).
- **The sun looks in through the doorway on a diagonal; the player wakes on the
  far side.** The azimuth is the operator's sketch (§ "Steering since"): the
  east wall's outward normal (+x) turned 31° toward −z, the line from the pill's
  shelf (west wall, z = 3.75 m, 1 m up) back through the doorway's middle. The
  elevation is 9°, the lead's: the doorway's light lies along the whole diagonal
  of the floor and stands on the west wall up to about 1.18 m, so the beam ends
  on the pill, and outside it is a true golden hour. `SUN_DIR` ≈ (0.847, 0.156,
  −0.509). Lost to it: 8° toward +z (the first design, before the sketch), and
  17° up (a half-hour detour that read a steepness into the sketch the operator
  never drew).
- **The player wakes about 30 m to the cube's south-west**, at W (−20.98,
  20.98), facing the sea with the sun behind them, turns, and sees the cube with
  the sun low to its right, level with its upper half, its sunlit east and north
  faces, door and ladder hidden: the operator's steer («солнце … лучше всё-таки
  сзади или сбоку от куба … иначе ты сразу видишь дверь и лестницу in your
  face»). The cube's shadow, some 38 m long, runs west-south-west and lies on
  the beach a few metres north of the waking spot, its tip near the water. The
  first choice, waking in front of the doorway, lost to this.
- **The cube hovers 1.1 m over the sand, and no scene shows it.** At 9° its
  shadow starts about 7 m behind it, so the sand right under the cube is in full
  sun and the gap reads from anywhere on the beach. The look-under cut scene of
  the brief is cut on the operator's word (§ "Steering since").
- **Outside is the same frame as inside, the eye is not a pose**:
  `W = CUBE_AT + 5 · C` in metres, the page holds "inside (a `Pose`) or outside
  (an eye in W)", and the scene draws an outside eye with floor 1's room as its
  fixed mesh frame, so the real room shows through the doorway. A pose with
  `eyeAbove < 0` is re-read as the floor below today, which is why the eye
  outside is its own thing.
- **Sky, sea and sand join the cube's one scene pass** as layers into the same
  HDR target (alpha there is metres from the eye, so nothing blends), with a 20
  km far plane outside and a lens of their own. The contract is
  `docs/remove-before-merging/cube-intro-j2wt34/contract.md`.
- **Nothing authored: every surface is a procedure, and its maps are computed at
  run time** — the operator's rule as he narrowed it (§ "Steering since",
  2026-11-13). The sea is the first team's FFT ocean: a rolled spectrum turned
  into wave fields on the GPU each frame. The sky is `skyRadiance(dir, lod)`,
  which the backdrop, the sea's reflections and the fill light all call; a
  per-frame sky map may back its cheap lods. Lost to it: the lead's day-one
  reading that banned every map, under which the sea was to be rebuilt as an
  analytic sum of trochoids — never started.
- **Every motion is periodic in the hour**, since the shared clock is seconds
  into the hour: wave frequencies are multiples of 2π/3600, clouds drift whole
  tiles.
- **One function says where the water is**: `waterLevel(xz, t)`, read by the
  sea, the sand's wetness, the surf's sound and the waves on the player's feet.
- **Eternal golden hour**: the sun does not move; waves, clouds and surf do, as
  functions of the clock, so a frame is a function of pose and time.
- **Ocean, sky and sand are written to be lifted into `scene` for the island
  game**, their world-neutral parts free of anything the cube names. Where they
  live today waits on `facts-island-board.md`.

## The team

The second team, started 2026-11-13 09:15–09:17Z, each on its package's branch
`claude/cube-intro-<name>` as the first team pushed it (`source_revision` and
`outcome_branch` both that branch). Every brief is the session's first event and
opens with `briefs/restart.md` in the working directory; each package's first
brief is `briefs/<name>.md` there, and `pause.md` holds where the first team
stopped. Builders run on `claude-fable-5-2`; sound and board on
`claude-sonnet-5-5`. Every session was sent the roster and may ask a peer for a
name or a signature directly; a decision comes to the lead.

- **core** — `session_01DaohkCDdGLyRAp2Yux9jAB`. The seam: `renderer.ts`,
  `cube-scene.ts`, `programs.ts`, `lib/camera.ts`, `lib/shader.ts`,
  `lib/play.ts`, `shared/outside/{frame,sun,outdoor-frame,stage}.ts`. Jobs: the
  flag as `ladderGone`, `masd:clusters`, gates, the `Pose` ↔ `Outside` handover
  at the doorway, `setEye` taking `moving` quads.
- **sky** — `session_01DaohkBFtfJ3LB6ENrHeTER`. First frames ever of the
  pure-function sky; settle the light on frames (its fill against the lead's);
  disc at lod 0 only, a cheap lod for reflections.
- **sea** — `session_01DaohkDD34tV9S8mR3o9S3o`. The FFT ocean into the renderer
  (cascades in its own layer's `prepare`), phases and constants rolled, then
  what sand, walk and sound wait on. Its start brief asks for an analytic sum;
  two later messages replaced that.
- **sand** — `session_01DaohkFqNfZaGgSSE9bfE4h`. Judges and fixes the sand on
  frames; owns the staging question (does the gap show from the waking spot, how
  big is the cube in view) and proposes before changing `WAKE_AT` or the crest.
- **shell** — `session_01DaohkDRoXkash4Q7kfmQ8Q`. Its layer into the renderer
  first (the lead merges it at once), then the look, an aluminium ladder, floor
  1 under the real sun.
- **walk** — `session_01DaohkE74S5ZqiB98XpJ7Cy`. Takes out the two cut scenes,
  writes `ladderGone`, the way out off the sill at either height, retimes the
  waking.
- **pill** — `session_01DaohkFTr7K29Yvof56czQp`. The pill's colours (the cube's
  black and grey; the fallback one hue in two values), the prompt's "swallow",
  lint, frames on floors 1, 2, 5, the rung grip.
- **sound** — `session_01DaohkD7uFNoFfFbz9RLaYq`. Two overlap renames, the
  outside eye from the page, the seed audit, the landing cue for walk.
- **board** — `session_01DaohkC6bqy1HmL5Nbbm66J`. Recovers the protocol agreed
  with #275's session (`session_01DaohkFooQx3YpuSjFHqR59`) from its
  predecessor's transcript into `board-protocol.md`, takes over the artifact's
  comment watch (https://claude.ai/artifact/WbvwDqVtJzN8EBeuUffho3), takes "add
  this" from the lead: frames under `frames/` on this branch plus a message
  naming files and captions. English only on the board.

The first team (archived 2026-11-13, all but board's, which is archived once its
successor has the protocol): core `session_01DaohkBKqYztUdZYGkvzgus`, sky
`session_01DaohkCV3DtK2zJnjgNqmMD`, sea `session_01DaohkFaRFVjmDtAdAJo43m`, sand
`session_01DaohkFCm1Bfsbsruai7cEV`, shell `session_01DaohkD4VsAVvL4tdwWWFoS`,
sound `session_01DaohkCEXbY3wSQqxH73yHK`, walk
`session_01DaohkCA5T6M6PFv7zXNegi`, pill `session_01DaohkDoQ3zoiqrQVjXomhV`,
board `session_01DaohkDnTF1C1pccu6TcupR`.

To pass on when they come in: sand's bed-colour function → sea; sound's cue
names → walk, pill (they merge sound's branch themselves); shell's ladder facts
→ walk; core's "how to shoot a frame" → everyone (they merge core themselves).

The preview is slot 2 (`preview.yml`, site `vova`, slot 2). #275's session was
told slot 1 is theirs.

Reader agents (done): the first run's transcript digest, and the fact sheets
`facts-render.md`, `facts-play.md`, `facts-island-board.md`,
`facts-sound-floor1.md`; `facts-frames-gates.md` still running when the children
were launched. Each reader filled its ~200k context before finishing a brief of
seven sections; a reader's brief is three sections at most.

## DRY notes

- The outdoor world reuses the cube's renderer, HDR target, bloom and lens
  rather than a second pipeline; the room through the doorway is the room the
  game already meshes.
- The pill reuses the lever's placement, reach test and shrink sequence; only
  what is drawn, the hand's act and the cue change.
- The body outside reuses the hands' meshing; legs are new.
- Ocean, sky and sand have no counterpart in `src/island` yet (to be confirmed);
  they are written once, here, in a shape the island can take.

## Progress

State at 2026-11-13 09:40Z, **the second team running**; update this block, do
not append.

- **On this branch (ba9210cc, 2026-11-13 09:55Z)**: the page draws the outside
  as layers — sky (core's stand-in), sand (real), shell (real cube and ladder),
  rooms, sea (the real FFT ocean, sea's 9d3c0184, merged at 01f776ea; the
  stand-in is gone) — from an inside or outside eye, with core's `ladderGone`,
  the `tanh` fix (`eased`) and the eye's adaptation (core 8a4fb806:
  `pages/cube/lib/adaptation.ts`, `OutsideLens.indoors`, eye `doorway-down`,
  `--indoors`). Gates at ba9210cc: typecheck, 72/72 shaders, `type-overlap`,
  `masd:clusters`, cycles green. `pnpm outside:cube --out <absolute>` shoots the
  named eyes; with the FFT sea a frame takes ~2.5 min on SwiftShader.
- **The black blocks had one cause**: `islandHeight`'s `tanh` going NaN
  kilometres out on the GPU (found by core and, separately, by shell; shell's
  earlier "half-float inf" reading was wrong, but the contract's "no non-finite
  value, alpha at most `SKY_METRES`" line stays). Gone in the frames at
  ba9210cc.
- **What `wake-sea` and `wake-cube` show at ba9210cc** (in `tmp/eyes-sea/`, not
  committed, not yet on the board; `under` and the rest were still shooting):
  **the waking spot is under water** — a flat brown-grey mirror with foam lace
  from the frame's bottom to the dune; the lace cells are 1–3 m and even; no
  ripple near the eye; the far sea and the sun's streak look right. Sent to sea
  as four verdicts, the flooded waking spot first. The cube still reads small (a
  tenth of the frame) with the gap a slit; its bands now read bluish-grey.
- **Children's heads, not merged**: sky 5c70ff27 (fill fixed: sun [8, 4.88,
  2.14], sky [0.32, 0.46, 0.76]; page frames take 160 s until its lod work lands
  — do not merge before); walk 1fcf79fc (cuts, `ladderGone`, `stepsOut`, scale;
  to do: real ladder and pill's `grippingHand`, wire the adaptation, write
  `body`, shoot the jump); sound 357d9e94 (wood ladder voice, follows the real
  sea, is cutting `heardFrom`'s cost); pill 7d8accc0 (black and pale grey pill,
  rung grip; shooting floors 1, 2, 5, then merge); shell e70b4bbd (must merge
  the lead and take `eased` over its own `levelled`; then wood ladder, bands,
  specks, `bodyShadow`; has eyes `shelf-door`, `door-shelf`); core 8a4fb806
  merged — owes the `body` slot, the east wall opening at the doorway,
  `ladderGone` on the play hook, a non-finite guard in the reflection pass; sand
  — **no report since the restart; check it at the 10:01Z check-in**.
- **Board** (session of its own, Sonnet): version 61; cards for the horizon bug,
  the shadow, the wooden ladder, the narrowed rule. Owed to it: the frames of
  the real sea once all six exist, with the flooded waking spot named as a
  failure.
- **Decided 10:03Z — the waking spot moves inland** (sea measured `WAKE_AT` on
  the still waterline, bed −0.0001 m; swash reaches bed +0.24 m, 4.7 m up): to
  dry sand at bed ≥ 0.45 m on the same line, about (−15.2, 15.2). Sand moves it
  (`shared/outside/frame.ts`) and tells core, walk and sound. Sound (1292e08b):
  surf tied to the sea's crests; no surf in the lee at the ladder's foot — kept.
  Sea 419cc2fd (`waterLevelAt`) is next on ripples in the shallows and the lace.
  All nine sessions have reported; every old session is archived. The six frames
  at ba9210cc are in `tmp/eyes-sea/`; four were not yet looked at.
- **~10:10Z, the operator in core's session** (steering, quoted here for want of
  room above): «мне кажется не надо так спешить. это не игра на скорость» —
  adaptation toward dark is 6 s now (core d82585e4); and «я бы поигрался с
  направлением луча. если он будет освещать ровно таблетку и спуск вниз, это
  слишком быстрый reveal, а так человек секунд эндцать будет ходить вообще не в
  понятках». **Decided: the sun stays; pill moves the shelf (and the way down's
  mark, if its own) out of the beam into the dim**; shell keeps the beam off
  them. Core d82585e4 also has `frame.body` (`Standing`), `ladderGone`/`body` on
  `setEye`'s third argument (an object now), the reflection guard. In sky's
  session he asked for truer clouds (sky 0ab7c024, gates not run).
- **~10:20Z, the beam again — the ruling above is WITHDRAWN**: «итого у нас три
  пути: (а) переместить полку и/или дыру (если процедурность позволяет), (б)
  повернуть солнце, (в) повернуть куб. какой из них правильный сходу не скажу,
  надо смотреть и сравнивать». Nothing is decided until frames of all three
  stand side by side on the board: shell shoots the comparison (inside from the
  doorway at `--indoors` 0 / 0.5 / settled, and outside from the waking spot,
  since (b) and (c) change the outside too), on throwaway overrides, nothing
  committed to shared constants; pill supplies how shelf and hole are placed.
  Core's adaptation now goes by the gaze (merged, b4058398). A second explainer,
  on the clouds, is being made by `session_01DaohkFroEeZ7ybMvAY9JoV` (Opus).
- **10:35Z, an incident on Claude's side** (the operator: «things may go weird
  esp. wrt inter-session messaging, try to let everyone know»; the container
  restarted at 10:30Z). `briefs/notice.md` on this branch is the fallback
  channel: undelivered messages are listed there, children are to read it on
  every fetch and write reports that will not send to `reports/<package>.md` on
  their own branches — **fetch the nine branches and read those**.
- **All nine were told at 10:42Z** of the incident, the notice file and (shell,
  pill) the withdrawn ruling with `briefs/beam-comparison.md`; every message
  delivered once the connector came back.
- **State at 10:50Z — lead 7c831056** has shell 12d16667 (cooled grey bands,
  wooden ladder with 3 cm round rungs, `bodyShadow` folded into
  `cubeShadow(p, { ladderGone, body })`, the specks as a night sky with parallax
  — shell's choice, put to the operator), sand (`WAKE_AT` = [−15.174, 0.5,
  15.174], 5af0ca79; the lead then asked for the head at bed ≈ 0.33–0.35, ~23.5
  m out, toes at the swash's reach — sand to answer; `sandWetness` on sea's
  `shoreWetness`) and sea d92ecc65 (shallows damped by the real water column,
  finer lace, `skyRadiance` at lod ≥ 1). Gates green. Shooting `wake-cube`,
  `ladder-foot` into `tmp/eyes-3/` — **two eyes a run; five killed a
  container**. Walk baa08847 has ladder, grip, adaptation, shadow, the sill;
  merge when its own type-overlap is clean and its strips are judged. Shell's
  next: the beam comparison. Not merged: sky (gates not run), pill (shooting),
  sound ce6078e4 (waits for the final waking spot), walk.
- **10:40Z**: sound merged whole (lead 8ab425d7; shell-mesh's `Rect.at` renamed
  `onFace` for type-overlap); sound's session is idle — archive once walk is in.
  The operator approved a frame in sand's session («это прямо топчик, можно на
  доску») — sand commits it under `frames/sand/`, board makes it a big card; it
  is the reference. Beam facts (pill's `reports/pill.md`): the hole is rolled
  when the world is planted, the shelf derived from it (`shelfOf()`), both in
  the beam today. The comparison is split: pill shoots the doorway's place along
  the face (corner / a third / middle — the operator mused on a centred door and
  a turned cube); shell shoots the sun and the cube turned, and (a). Pill adds a
  decor clear zone at the doorway (a plant stood on the sill).
- **The explainer** «Два океана» was amended on the operator's comment (how many
  waves "good" takes); answered in its thread.
- **Next, in order**: (1) merge core, shell, sky as they report green and lint;
  re-shoot the six eyes after each; (2) sea's FFT ocean in the renderer, its
  frames to the operator and the board; (3) walk and pill in, the intro played
  end to end; (4) a fix round on what the frames show (the cube's size and gap
  from the shore first); (5) preview slot 2, checking the deployed commit before
  saying so; (6) `/polish`, `/pr` (base `claude/cube-review-perf`), then vet.
- The context notices: at 330k start nothing big; at 350k bring this file
  current. The session compacts on its own near 370k; never `/relay`. This file
  is capped at 400 lines like any other: when "Steering since" grows, move its
  older entries to `brief.md` beside the brief.
