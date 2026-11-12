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

## The brief (the operator's words)

> хочу intro sequence для кубика [...] представь: ты открываешь глаза, немного
> стонешь, приподнимаешься, и понимаешь, что ты на крошечном песчаном
> необитаемом острове. о твои ноги хлещут волны.
>
> ты встаёшь (сначала видишь только море), оборачиваешься, и видишь: в
> нескольких десятках метров от тебя в воздухе висит куб 5х5х5 метров. в
> основном чёрный, но с серыми полосами, которые уменьшаются каждую половину
> оставшейся длины [...] Материалы otherworldly, издают какой-то звук и не
> привычным глазу образом играют в предзакатном солнце, насколько это может
> позволить чёрный/серый цвет.
>
> на верхней полосе -- дверной проём, и в него виднеется какая-то обстановка.
> что совершенно не вяжется со всем этим, к низу этого дверного проёма
> приставлена совершенно обычная приставная лестница.
>
> с этого момента можно ходить, управлять клавишами, пройтись по острову и тп,
> даже поплыть вдаль (пока -- без края). Как только ты приближаешься к кубу, ещё
> одна cut scene: ты наклоняешься, смотришь под куб -- под ним ничего нет, то
> есть он реально висит в воздухе (это нужно чтобы дать понять, что весь наш
> лабиринт действительно находится в одном кубе).
>
> После этого возвращается обычное управление.
>
> когда подходишь к приставной лестнице, ты можешь нажать E, и следующей
> кат-сценой ты забираешься наверх и, через дверной проём, оказываешься в нашей
> самой первой комнате на первом этаже.
>
> там где на скрине дверь, должен быть проём, и внутри не должно быть
> естественного освещения, куб изнутри должен освещаться предзакатным солнцем,
> которое светит ровно в эту щель. Остальное должно остаться, контраст между
> обыденностью внутри и видом куба снаружи. Единственное, не знаю что делать с
> деревом. Его расположение процедурное, поэтому просто "убирать" не хочется.
> Пусть будет, тем комичнее. Солнце должно играть "об него".
>
> Ну а дальше всё как было, с небольшим изменением: давай рычаг заменим на
> таблетку, лежащую на том же уровне на небольшой полочке. Анимация
> "берёшь-несёшь ко рту-звук глотания". Кроме первого раза -- первый раз ты её
> поднимаешь и как бы рукой немного проворачиваешь, разглядывая. При этом
> возникает подсказка: Press Y то drink, N to put down. Если пьёшь -- анимация
> довершается, ты уменьшаешься, дальше как обычно -- руки, взгляд вокруг.
>
> Что касается острова: он должен быть отрисован супер-пупер, прям супер-пупер,
> не отличишь от настоящего. И вода, с прибоем и шумом, и солнце и облака в небе
> -- всё, разумеется, процедурно-детерминированно, как мы любим.
>
> Вдохновляться можно рисунком с борды "острова" [...] через сколько-то итераций
> [...] это всё станет частью одного мира: наш остров посреди океана в том же
> мире, где остров Золтана и Сямы. Если поплывёшь -- через сотни километров
> доплывёшь до берега. А может и взлетишь. Но это потом :)

The three attached pictures are under `tmp/session-images/` (gitignored, die
with the container): the banded rectangle from the "Куб с уменьшалкой" artifact,
floor 1's room with the door, bench, plant and clock, and the island board's
ocean-at-sunset inspiration ("Noniv/web-ocean … Nothing copied").

## The one batch of questions

What was asked (1 lamps on floor 1 off, sun the only light; 2 branch from `main`
or stack on #275; 3 when the intro plays, skipping, the ladder both ways; 4 the
pill everywhere, "first time" per browser, the prompt's language; 5 the machine
and the frame rate; 6 preview slot and a ceiling on spend) and the answers,
verbatim, 2026-11-12:

> карт-бланш -- супер
>
> поясню, кривые руки -- украшать не надо; контраст между ослепительным
> реализмом предазкатного острова и недореализмом остального -- будем считать
> творческим выбором. вопросы:
>
> 1- да; конечно желательно чтобы при этом в комнате было хоть что-то видно
>
> 2- давай так, к слову возможно так будет проще и борду править поверх
>
> 3- урл сменяется на наш стандартный "запоминающий при обновлении страницы хеш"
> (честный, не cheated) при переходе дверного проёма. то есть если обновишь до
> этого -- сцена с начала, если после -- уже сразу внутри.
>
> 4- "первый раз" -- только на самом первом этаже. подсказка и вся игра только
> на английском
>
> 5- окей. пока у меня вся остальная игра где-то на 111 fps. У меня M2 Pro 16 GB
>
> 6- давай на 2, на 1м может быть #275, сообщи той сессии о разделении. потолка
> нет, лимиты остановят 🙂 ориентируйся на 500-1000 долларов по API cost-ам
> (затраты можешь посмотреть по cost ledger-у той сессии). ну или просто
> посмотри сколько было там и сколько нужно тебе чтобы сделать так же хорошо:
> кучи уровней нет, зато есть зверские требования к реализму.
>
> по твоим решениям: солнце наверное лучше всё-таки сзади или сбоку от куба,
> если смотреть на него с места "просыпания", потому что иначе ты сразу видишь
> дверь и лестницу in your face, это не так интересно
>
> > Солнце стоит
>
> ну ок, пусть пока так
>
> > Дерево остаётся
>
> не понял какое дерево, но пусть остаётся :)

How each is read:

1. Lamps off on floor 1, and the room must still be readable: the sun's patch
   lights the rest by bounce, tuned until the bench, the walls and the hole can
   be made out.
2. Read as "stack on #275" («править поверх»): `claude/cube-review-perf` is
   merged into this branch (34f30eac) and merged again as it moves; the PR's
   base is that branch. The reading was told to the operator; reverse it if they
   say so.
3. No `localStorage`, no skip key. The honest address fragment is first written
   when the body crosses the doorway inward; a refresh before that plays the
   intro from the start, after it starts inside. `?cheated_to=` as today.
4. The inspect-and-ask beat happens on floor 1 only, every game; every other
   floor's pill is taken and swallowed at once. English only.
5. The machine is an M2 Pro, 16 GB, where the game runs near 111 fps; the
   outside holds 60 there.
6. Preview slot 2; #275's session is told slot 1 is theirs. Spend to aim for:
   $500–1000 at API rates.

The stylised hands and body stay as they are — the contrast with the island is
the operator's creative choice («кривые руки -- украшать не надо»). "Дерево" was
the operator's own word for the potted plant in floor 1's room.

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

## Facts established

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
- **The cube hovers 1.1 m over the sand.** At 9° its shadow starts about 7 m
  behind it, so the sand right under the cube is in full sun: the look-under
  beat, coming from the shadow side, shows lit sand and the sea's glare through
  the gap.
- **Outside is the same frame as inside, the eye is not a pose**:
  `W = CUBE_AT + 5 · C` in metres, the page holds "inside (a `Pose`) or outside
  (an eye in W)", and the scene draws an outside eye with floor 1's room as its
  fixed mesh frame, so the real room shows through the doorway. A pose with
  `eyeAbove < 0` is re-read as the floor below today, which is why the eye
  outside is its own thing.
- **Sky, sea and sand join the cube's one scene pass** as layers into the same
  HDR target (alpha there is metres from the eye, so nothing blends), with a 20
  km far plane outside and a lens of their own. The sea is a displaced mesh from
  an FFT spectrum; clouds and atmosphere feed a sky map the sea reflects. The
  contract is `docs/remove-before-merging/cube-intro-j2wt34/contract.md`.
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

## Packages

Sketch; each becomes a child session on `claude/cube-intro-<package>` once the
fact sheets land and step 0 is in.

- **Step 0 (lead)** — the outdoor seam: shared frame uniforms (camera, sun,
  clock), the island's height function with a WGSL twin, how extra passes join
  the HDR target, and a way to shoot an outdoor frame headlessly.
- **sky** — atmosphere and clouds at pre-sunset, a sky map the ocean reflects.
- **ocean** — open water, sun glitter, foam, the shore: shoaling, swash, wet
  sand line.
- **sand** — the island's terrain and its material, wet band, footprints if
  cheap.
- **shell** — the cube's outside: bands, the otherworldly material, the doorway
  cut into floor 1's wall, the ladder, the sunbeam inside and the lamps.
- **walk** — moving outdoors: terrain walking, swimming, the three cut scenes
  (wake, look under, climb), the body seen from its own eyes.
- **pill** — the lever becomes a pill on a shelf, the first-time inspection and
  its prompt.
- **sound** — surf tied to the drawn swash, wind, the cube's hum, groan, ladder,
  swallow.
- **board** — the coordinator with #275's session for the cube board.

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

- 2026-11-12 22:10Z: skill saved (`.claude/skills/carte-blanche/SKILL.md`),
  branch renamed, readers launched, questions asked.
- 22:30Z: answers in; #275's branch merged in (34f30eac); contract written; nine
  child sessions running. Nothing built on this branch yet. A check-in is
  scheduled for 23:11Z (`send_later`), and each child's report wakes the lead.
- **Next, in order**: (1) when core's first push lands, confirm the others
  merged it; (2) pass on the owed facts listed under "The team"; (3) merge each
  branch as it reports green, look at its frames, send the good and the bad to
  the board session with captions; (4) when sky, sea, sand and shell are in,
  shoot the six standard eyes on the merged tree and run a fix round on what the
  seams show; (5) publish to preview slot 2 and check the deployed commit before
  telling the operator; (6) `/polish`, `/pr` (base `claude/cube-review-perf`),
  then vet. The session's human-hour estimate is set (300 senior-hours).
- The context notices: at 330k start nothing big; at 350k bring this file
  current. The session compacts on its own near 370k; never `/relay`.
