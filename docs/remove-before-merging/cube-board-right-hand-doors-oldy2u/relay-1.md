# Relay 1 — doors through the cube's maze walls

## Standing constraints

- Every artifact comment is answered in its own thread, plus one short line in
  the session; no thread is resolved unless the operator asks.
- The board is not tied to iterations: «не нужно привязываться к итерациям,
  просто: идеи».

## The conversation

1. «хочу сделать, чтобы двери (случайные объекты, расставляемые по этажу)
   открывались и вели на другую сторону
   1- надо посчитать не схлопнет ли это сложность (по интуиции -- нет; лабиринт
   сложен не потому что не знаешь как пройти из точки А в точку Б, а потому что
   не знаешь где выход)
   2- дверь на одной стороне всегда должна дублироваться дверью на другой
   3- в одной стене не должно быть двух дверей
   4- дверь НЕ должна ставиться на периметр куба, или если между этой комнатой и
   комнатой "через дверь" меньше какого-то количества (надо подумать, какого)
   комнат на кратчайшем пути.
   что думаешь? сделай артефакт сразу чтоб наглядно поразмышлять»
   → Built the artifact (a port of maze.ts and the world's hole seals, three
   explorer models). The verdict: doors leave the lock alone, because a search
   hashes room addresses and never walks. I also asked whether an opened door
   stays open.
2. «платное -- про изменение долговременного состояния. открыть-закрыть -- не
   изменение (дверь закрывается после прохода)»
   → Accepted: opening is free and nothing persists.
3. Artifact comments, in order, each answered in its thread and the artifact
   republished:
   - «добавь ещё просто переключатель "с дверьми/без дверей"» → toggle added.
   - Doors bunching along one group of walls when both sliders are maxed; asked
     for a criterion → the "one door per partition" rule (`armOf`).
   - «очередная баг-ставший-фичей. надо добавить на борду» (the right hand
     circling an island) → board sticky.
   - «давай до 100 доведём ползунок…» → density max 100.
   - «какой квадрат?» / «а, ну да, норм, и на каком из квадратов считается
     "крест"? на любобм?» → explained: the block whose cut holds the wall.
   - «лучше здесь чем в галочке…» → the game toggle moved into the buttons row.
   - «почему, вроде вполне справляется? … откуда число 48?» → conceded that the
     threshold alone holds difficulty and only wastes doors; 48 is empirical.
   - «а тут почему без процента в последнем столбце?» → ratio added.
   - «а напомни различия? (забавно что картографу двери помешали тоже)» → the
     wanderer, the router and the mapper.
   - «инетерсно… он какой-то известный или ты сам догадался?» → my own, from the
     recursive division's structure.
   - «попробуй (оба ползунка, с переключателем того что выбираем)» → added a
     threshold as a share of the side.
   - «ну да, так неинтересно -- тогда на глубоких этажах двери никто никогда не
     найдёт… давай уберём второй вариант ползунка, но увеличим его макс» →
     removed; gap max 256.
   - «а добавь все этажи начиная с 2» → floors 2–8.
   - «а как в этом случае решается какая из дверей "победит"?» → the two rolls,
     `…/has` and `…/at`.
   - «это не one, one уже зашиплен, да и не только one; не нужно привязываться к
     итерациям, просто: идеи. эта идея-- про двери. остальное из этой ветки тоже
     туда добавим» → new zone `z-ideas` (ideas.yaml), `one-8` moved there.
   - «а почему при "как в игре" есть "другие двери", если двери детерминированы
     нашим roll'ом?» → those buttons are disabled in game mode; fixed "new
     floor" not drawing a new pair.
   - «…выход всегда близко к периметру? такое ограничение что ли где-то стоит?»
     and «на всех этажах как раз у края… случайно попали в 10^-4, или где-то
     таки баг у нас?» → no bug: plant.ts uses crypto.getRandomValues, the odds
     are about 1 in a few thousand, and floors 10+ sit deep inside.
   - «ну в общем 48 работает нормально…» / «это шикарно -- слишком умным
     усложняем жизнь, туповатым -- облегчаем» → acknowledged, onto the board.
   - «почему не посчитать? можно же просто посмотреть всё куда могут привести 20
     … ходов» → right: a bounded BFS settles it on any floor. The metric was
     switched to it.
   - «а где на 9м и 10м этажах?» / «> дыра в 83 клетках от него. как повезло
     :)» → coordinates given.
   - «ну ок, живём. на доску занести казусы» → `lock-edge` sticky.
   - «в игре это будет на скорости сказываться?» → a few ms per partition,
     cached.
   - Thread 6f4fb4b9-a822-44fc-97f7-3d47a871e381: «а давай, раз мы уж получили
     возможность видеть "наши" лабиринты, нарисуем на карте ещё комнаты, которые
     "сразу видно что тупик", грубо говоря все три стены которых, или все
     стены + все "сразувидные комнаты" которых, видно из текущей точки (при этом
     "текущая точка" -- это точка НЕ в этих комнатах). математически решаемо?» →
     replied in the thread that it is solvable and that a fresh session will
     build it and answer there. **This is the open request.**
4. `/relay` with the to-be message below (verbatim in Last agent turn).
5. Mid-relay, in chat: «я тут задумался (пишу здесь потому что это общая
   мысль): а нужны ли двери именно как "двери", или просто можно делать "там нет
   стены"? игра по сути усложняется -- нельзя быть "умным картографом, который
   никогда не пользуется дверьми, потому что знает, что они ему вредят", но
   теряется (будущая) механика с переходом в порталы через дверь (до того как
   открыл не знаешь, то ли там портал, то ли просто тот же этаж). что думаешь?"
   → My answer: both, as two separate knobs. A gap is loops for everyone, with
   no mystery, since you see through it. A door is opaque, which is what portals
   need. The "smart mapper skips doors" loophole dies the moment portals exist,
   because a skipped door may be the needed portal. The placement is shared,
   with a third roll `…/kind` choosing gap or door. I offered a sticky in
   `z-ideas`, and he has not answered yet.

## Intent

Explore openable doors in the cube's floor maze without collapsing the lock,
and record what is settled on the cube board as ideas. He wants deep-floor doors
findable (no share-of-side threshold), since finding them, some becoming portals
later, is part of the fun.

## Decisions

- **Partition (перегородка)**: the straight wall between two adjacent quarters
  of a square in the recursive division; at most one door per partition. This
  beat the threshold alone, which wastes doors along long blind partitions.
- **Threshold in rooms, 48**, checked by a BFS K steps deep. This beat the
  share-of-side variant (rejected by him) and the O(1) lower bound, which turns
  away two thirds of the walls that qualify.
- **Placement**: per partition, `doorway/{floor}/{armKey}/has` and `…/at` rolls
  from the world seed. This beat the longest walk round, which is predictable.
- **Edge casus**: chance, kept as is.

## Errors and dead ends

- I claimed "threshold alone doesn't cope" and "exact distance can't be
  computed". He pushed back on both, and both were wrong.
- I muddled targets and holes when giving floor coordinates. Correct: landing →
  hole, e.g. floor 9 (1,157) → (206,83).
- Artifact publish refuses `edits` combined with `files`: use Edit, then publish
  with `files`.
- `pnpm board refile` reshuffles intro.yaml and intro-late.yaml: revert those.

## State

- Branch `claude/cube-board-right-hand-doors-oldy2u`, draft PR
  https://github.com/vzakharov/vovazakharov.com/pull/280, titled "content: the
  cube board's ideas zone for doors into the next room". The squash proposal is
  posted and tracked in `squash-message.md` beside this file.
- No plan file. No CI running, no PR subscription, no scheduled check-in.
- The artifact source is now on the branch, in `doors-sim/` beside this file
  (copied from the old scratchpad; the published artifact is version 16).
- Estimate: this session booked 3 h senior game-designer + 5 h senior
  developer. Handed on: the dead-end overlay, about 2 h senior developer
  (line of sight through doorways on the real room geometry, plus recursive
  dead-end propagation, drawn on the plan).

### Watches

https://claude.ai/artifact/E42bCrk3t6DubakRH61irN

## Pointers

- `doors-sim/index.html` (the page), `sim.js` (maze, doors, explorers,
  `armOf`, `rolledDoors`), `world.js` (`pathHash`, `blockSource`, `holeTarget`,
  `gameFloor`), `world-holes.js`. Republish with Artifact `url` =
  the artifact above and `files` for sim.js, world.js, world-holes.js.
- Room geometry for line of sight: `src/cube/shared/cube-boundary/frame.ts`
  (`DOORWAY = { from: 0.274, to: 1.244, height: 2.1 }`, in metres along a
  wall), `src/cube/shared/lib/room-shape.ts` (`ROOM_METRES = 5`, `WALL_HALF =
0.012` as a share of the side), `src/cube/shared/cube-boundary/beam.ts`
  (`DOOR_INNER`).
- Maze source of truth: `src/cube/entities/world/model/` (maze.ts, plant.ts,
  hole.ts).
- Board: `src/cube-board/app/config/cube/ideas.yaml`, `lock.yaml`;
  `pnpm board build|refile|snapshot`.
- Predecessor transcript: https://claude.ai/code/session_01DaohkCH6sCRrmk6LaotEWV

## Next step

In the doors analysis artifact (https://claude.ai/artifact/E42bCrk3t6DubakRH61irN, source in the old session's scratchpad doors/ — republish from the artifact's own files), answer Vova's comment thread 6f4fb4b9-a822-44fc-97f7-3d47a871e381: draw on the floor plan the rooms that are "obviously a dead end" from the current point — every wall but one exit visible from it, recursively also rooms whose other exits lead to known dead ends — using the game's real room geometry (doorway width, wall thickness) for line of sight; the viewpoint's own room never counts. Reply in that thread when done.

(The source is now on the branch under `doors-sim/`, which supersedes "the old
session's scratchpad".) Also pending: his answer on whether the gap-vs-door
thought goes onto the board as a sticky.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Казус лёг на борду в зону замка, коммичу и отвечаю про скорость.

Вова, обе вещи сделал, ответы в тредах:
- **Казус с дырами у края** теперь на борде: стикер 🎰 в зоне «A lock made of a maze». Squash-сообщение PR #280 обновил под него.
- **Скорость в игре** почти не пострадает. Поиск на 48 ходов заходит в среднем в 430 комнат и обходит их за 0.06 мс. Основную цену дают броски блоков для стен этих комнат: единицы миллисекунд, один раз на перегородку, и результат кешируется.

Контекст сессии перевалил за порог предупреждения (330k). Паузу я не делал: всё начатое успел доделать, и ветка запушена. Следующий большой кусок лучше начать в свежей сессии: скажи `/relay`, и я передам ветку с итогами.
```
