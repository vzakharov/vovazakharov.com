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

Asked in the first reply; answers go here verbatim when they come. Until then
each default below is what gets built.

1. Floor 1's ceiling lamps — default: off in floor 1's room only, the sun
   through the doorway the only light there.
2. Base — default: branch from `main`, merge `claude/cube-review-perf` in as it
   moves, one PR of its own.
3. When the intro plays — default: a bare `/cube` wakes on the beach; a URL with
   an address fragment or `?cheated_to=` starts inside as today; the wake-up is
   skippable once seen (remembered in `localStorage`); the ladder works both
   ways.
4. The pill — default: replaces every lever on every floor; "first time" is once
   per browser (`localStorage`); the prompt follows the page's locale.
5. The bar and the machine — default: 60 fps on an M-series MacBook with a
   render scale that adapts, full detail on a stronger GPU.
6. Preview slot and ceiling on spend — default: slot 1, no ceiling.

## Facts established

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

- **The doorway faces the sun, and the player wakes between them.** The player
  wakes on the shore looking out to sea at the low sun on the water (the board's
  inspiration frame), turns round, and sees the cube lit head-on in gold, the
  doorway and the room behind it lit by the same sun. The sun's azimuth is the
  doorway wall's outward normal, its elevation about 9°, so through a 2 m
  doorway the beam crosses the whole 5 m room and ends on the far wall.
- **The cube hovers about 1 m over the sand.** At 9° the cube's shadow starts
  some 6 m behind it, so the sand right under the cube is in full sun: the
  look-under beat shows lit sand, the horizon beyond and a shadow lying apart.
- **Outside is the same frame as inside**: metres are floor 1's room sides times
  5, the outdoor eye is a pose of floor 1 whose `u`, `v` leave `[0, 1]`, so the
  real room shows through the doorway with no second copy of it. To be confirmed
  against `facts-render.md`.
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

- Transcript digest of the first cube run (`session_01DaohkEZGmfg7XD5wRftBnA`) —
  background agent, report pending.
- Readers for the three fact sheets — background agents, reports pending.

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

- 2026-11-12: skill saved (`.claude/skills/carte-blanche/SKILL.md`), branch
  renamed, readers launched, questions asked.
