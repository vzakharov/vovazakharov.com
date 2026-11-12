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

- **2026-11-12 22:32Z, the sun's direction**, with a sketch over floor 1's room
  (`docs/remove-before-merging/cube-intro-j2wt34/frames/operator/sun-direction.webp`):
  two dashed rays from the top of the door running diagonally into the room and
  down to the floor near its middle, a parallelogram of light round the hole.

  > направление света солнца какое-то вот такое, наверное, должно быть

  Read at first as direction and steepness both, and the sun was raised to 17°;
  then, as a comment on the board's note about it (relayed by the board
  session):

  > я тут в основном про направление в двумерной плоскости говорил, 30 градусов
  > я там специально не отсчитывал :)

  So the sketch fixes the beam's direction across the floor and nothing else;
  the elevation went back to 9°.

- **2026-11-12 ~22:34Z, a comment on the board itself** (on the "one ocean"
  card, relayed by the board session): "no Russian in the board whatsoever". The
  board session translates every quote; the lead sends verdicts in whatever
  language they were said.

- **2026-11-12 ~22:50Z, randomness and the goal behind it**:

  > все же исполнители понимают, что всё что касается случайности должно
  > использовать наш `rolled`?

  > цель -- любая вещь, любое явление должно выглядеть абсолютно идентично в
  > один и тот же момент времени для двух игроков на разных машинах в одной
  > точке

  The contract named `src/dice` but not `roll` / `rollWith`; now it does, and
  every build session was told. Sand's pushed shape already rolled. The second
  sentence was the contract's first rule; it now also rules out anything that
  remembers earlier frames (accumulated foam, reprojected clouds, a stepped
  simulation), told to core, sky, sea and sand. Footprints are per-player
  history, so they are out unless the operator asks for them.

- **2026-11-12 ~22:50Z, on the footprints being dropped — a principle**:

  > да, где-то на борду большими буквами: Interactions come at a price. Это и в
  > фигуральном и в буквальном смысле: любое, что меняет состояние мира силами
  > одного игрока (вплоть до "пнуть мячик на полу") -- только покупкой.
  >
  > в более философском смысле, можно вспомнить про всяких
  > исследователей-первооткрывателей, у которых это первая заповедь; про sound
  > of thunder у бредберри, про эффект бабочки итдитп

  Written into `src/cube/CLAUDE.md` with the two rules it stands beside, into
  the contract, and sent to the board session for the board, in English, large.
  What it decides here: no footprints, no wake or ripples from the player's
  body, no sand disturbed; and the lead's reading for the pill — the shelf holds
  a pill for whoever comes next, the one taken being the taker's own. That
  reading was told to the operator in passing.

- **2026-11-12 ~22:55Z, on sea dropping its baked texture — a rule**:

  > это наверное стоило тоже обозначить: никаких текстур. все стены, полы,
  > потолки этажей куба отрисованы процедурно, здесь мы делаем то же

  Read as: nothing drawn is looked up from a stored image, baked or computed —
  no FFT maps, no sky map, no noise texture, no lookup table; the frame's own
  screen-space targets (scene, reflection, bloom, a layer's reduced-resolution
  pass) are what the renderer already has and stay. In `src/cube/CLAUDE.md` and
  the contract; core, sky and sea re-briefed. The reading of screen-space
  targets was told to the operator in passing.

- **2026-11-12 ~22:56Z, a comment on the board's rules zone, on the pill**
  (relayed by the board session):

  > упс, а таблетку ведь мы действительно берём. ну ладно, пока придумаем для
  > этого какой-то философский смысл ("таблетки на самом деле нет, это твоё
  > собственное воображение, представляющее необходимость принять решение как
  > физический, экстернальный объект и таким образом снимающее с себя
  > ответственность"

  So the taking is explained, not changed: the shelf keeps its pill for the next
  player, nothing stores "taken". Passed to pill.

- **2026-11-12 ~22:58Z, on the first frames**:

  > судя по картинкам, катсцены "заглянуть под куб" не надо, и так отчётливо
  > видно что он парит

  The look-under scene is cut; walk was told. The scenes left are waking, the
  climb and the climb back down.

- **2026-11-12 ~23:02Z, the ladder vanishes**:

  > давай лестница исчезает после того как ты забрался. без каких бы то там
  > анимаций, эффектов, звуков. просто поворачиваешься -- и нет. выбраться
  > можно, спрыгнув (и не пострадав), но забраться обратно уже нет. выбраться
  > можно и половинного роста, кстати, если выпьешь таблетку и не спустишься на
  > уровень ниже

  Decided: the ladder and its shadow are drawn until the body first crosses the
  doorway inward and never after; a game that starts inside has none. Stepping
  off the sill drops the body 3.6 m to the sand unhurt, at full or half height;
  no way back in. The climb-down scene is gone. Told to walk, shell, core,
  sound.

- **2026-11-12 ~23:03Z, lettering** (after learning the signs and posters are
  lettered on a canvas because WebGPU draws no text):

  > запишите на доску в todo, чтоб рисовал. так будет интереснее и их "распад"
  > по мере спуска на нижние этажи делать

  A todo on the board, sent to the board session: letters drawn in the shader,
  so their decay down the floors can be a procedure. Not part of this run.

- **~23:08Z, on the board's pill card**: «swallow а не drink наверное» — the
  prompt is "Press Y to swallow, N to put down". Pill is not told yet.
- **~23:10Z, on the price rule's card**, a musing and no decision: «навеяло: мы
  призраки? мы умерли? это "по ту сторону"?»
- **~23:10Z, to the lead**: «лимит кончается; пусть все приостановятся, я сожму
  контекст чтобы завтра продолжить». Every child was told to push `wip:`, report
  one line and wait for the word "resume"; the lead's check-in was deleted.

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
- **No textures: every surface is a procedure in the shader** — the operator's
  rule (§ "Steering since"). The sea is a displaced mesh whose waves are a
  rolled spectrum summed analytically (trochoids in the vertex stage, finer ones
  in the normal, each faded before it aliases); the sky is
  `skyRadiance(dir, lod)`, a pure function the backdrop, the sea's reflections
  and the fill light all call. Only the frame's own screen-space targets are
  textures. Lost to it: an FFT ocean with displacement maps and an
  equirectangular sky map the sea sampled — the lead's first design, which
  core's step 1 had already bound in group 0.
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

Child sessions, all on `claude-fable-5-2`, cut from this branch at 2026-11-12
22:18–22:30Z, each on `claude/cube-intro-<name>`, briefed from the contract.
Each reports by `send_message` to this session; a brief's full text is the
session's first event (`list_events`).

- **board** — `session_01DaohkDnTF1C1pccu6TcupR`. Coordinates the Cube design
  board (https://claude.ai/artifact/WbvwDqVtJzN8EBeuUffho3) with #275's session
  (`session_01DaohkFooQx3YpuSjFHqR59`, the live one of two). Takes "add this"
  from the lead: frames go to it through
  `docs/remove-before-merging/cube-intro-j2wt34/frames/` on this branch plus a
  message naming files and captions.
- **core** — `session_01DaohkBKqYztUdZYGkvzgus`. The seam; owns `renderer.ts`,
  `cube-scene.ts`, `programs.ts`, `lib/camera.ts`, `lib/shader.ts`,
  `lib/play.ts`. Steps: names in code, layers and the outside eye, the frame
  script, the outside lens. Stays on for integration asks.
- **sky** — `session_01DaohkCV3DtK2zJnjgNqmMD`. Also owns `aerial(…)`,
  `SUN_LIGHT`, `SKY_FILL`.
- **sea** — `session_01DaohkFaRFVjmDtAdAJo43m`. Owns `waterLevel`. Needs the
  name of sand's bed-colour function once sand reports.
- **sand** — `session_01DaohkFCm1Bfsbsruai7cEV`. Owns `islandHeight`; tells the
  lead the moment the walked-on shape is settled.
- **shell** — `session_01DaohkD4VsAVvL4tdwWWFoS`. Exterior, doorway, ladder,
  `cubeShadow`, the sunbeam in floor 1; may tune `SUN_DIR`'s azimuth; exports
  the ladder's facts for walk.
- **sound** — `session_01DaohkCEXbY3wSQqxH73yHK`. Owns `features/sound/**` and
  the cue names (`pill`, `swallow`, `rung`, `splash`, a ground on `step`, voice
  moment `waking`), pushed first for walk and pill.
- **walk** — `session_01DaohkCA5T6M6PFv7zXNegi`. Start routing, outside
  controller, the scene engine and four tracks, the legs; splits
  `cube-canvas.tsx`.
- **pill** — `session_01DaohkDoQ3zoiqrQVjXomhV`. Pill and shelf, articulated
  hands (owns `hands.ts`; exports a rung grip for walk), the floor-1 Y/N beat.

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

State at 2026-11-12 23:15Z, **paused on the operator's word** (limit running
out; he compacts and continues tomorrow); update this block, do not append.

- **On this branch**: all of the above plus core's step 2 (0e1081af, merged at
  420476f1): the page draws the outside — layers sky, sand, shell, rooms, sea,
  an outside eye with roll, a lens of its own (`OUTSIDE_LENS`: exposure 0.3,
  eyelids), `pnpm outside:cube --out <absolute>` shooting six named eyes
  (`wake-sea`, `wake-cube`, `under`, `ladder-foot`, `doorway-out`,
  `room-doorway`) or `--at x,y,z --yaw --pitch`, ~2 min for all six. Sand's
  layer and shader are the real ones; sky, shell and sea are core's stand-ins
  (`pages/cube/ui/<name>-layer.ts`, `pages/cube/lib/<name>-shader.ts`).
  Typecheck, 72 of 72 shaders and the seam's tests green; lint still red on
  shell's four errors in `shared/outside`.
- **First assembled frame** (`wake-cube`, in gitignored `tmp/cube-outside/`, so
  re-shoot): a believable low sun in a pale sky, wet sand mirroring it with
  glints, the island's back in blue shade. The cube reads as a small box sitting
  on the dune: the 1.1 m gap does not show from the waking spot, and the
  stand-in shell has no bands. Nothing was sent to the board from it.
- **Pushed heads at the pause** (none merged past the list above): core 6de69066
  (sky map out, ladder flag in the frame; its steps 3 and 4 at 2ac8a67d reported
  green), sky 85105b1c (pure functions: fitted clear sky, marched clouds), sea
  218db0f0 (still the FFT sea; **`claude/cube-intro-sea-fft` was not pushed** —
  ask for it first), sand 420476f1, shell 480f5650 (says lint clean), walk
  4385dc60 (waking plays end to end; still has a look-under scene and "E by the
  doorway goes back down", both cut — tell it), pill 1b31ed7d (plain swallow
  plays; prompt must say "swallow"), sound d3fed484, board 9fd5e233 (v57).
- **To resume**: send each child "resume" with what it owes (my last message to
  each before the pause is its list); read each one's pause report in the
  notifications first. Walk asks: core's `setEye` to take `moving` quads;
  shell's `LADDER` (rename pending) is on the lead for it to merge.
- **Next, in order**: (1) merge core, shell, sky as they report green and lint;
  re-shoot the six eyes after each; (2) sea's analytic sum beside its FFT frame,
  to the operator; (3) walk and pill in, the intro played end to end; (4) a fix
  round on what the frames show (the cube's size and gap from the shore first);
  (5) preview slot 2, checking the deployed commit before saying so; (6)
  `/polish`, `/pr` (base `claude/cube-review-perf`), then vet.
- No check-in is scheduled; schedule one on resuming.
- The context notices: at 330k start nothing big; at 350k bring this file
  current. The session compacts on its own near 370k; never `/relay`. This file
  is capped at 400 lines like any other: when "Steering since" grows, move its
  older entries to `brief.md` beside the brief.
