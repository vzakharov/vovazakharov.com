# Relay 1 — `cube/sight`

## Standing constraints

From the producer's `/go` brief (the operator's producer session
https://claude.ai/code/session_01DaohkDPxeBiwmr4W9k25Bu reviews and merges this
branch):

- Do NOT touch the plan file, open a PR, run /polish, /pr or /finalize, relay,
  rename the branch, publish previews or upload timelapse frames.
- Keep edits to `src/cube/pages/cube/ui/cube-scene.ts` minimal — the
  `cube/lever` subsession edits it too.
- No lint-suppression comments, no `as any`; run `pnpm test`, `pnpm lint`, the
  type-check and `pnpm type-overlap` before each push.

(This park itself is the keepalive's last wake, not a relay the brief forbade;
no successor is started.)

## The conversation

1. **Producer (`/go`)**: replace the cube's 7×7 square sight plus fog with 2D
   portal visibility on floor n (pure, in `entities/world`, tested: straight
   corridor to its end, nothing behind a solid wall, L-turn, own room always
   in; BigInt indices, cube edge, bounded cost), drop fog from shader and frame
   uniforms, check in the browser on floors 1/10/60 and `pnpm play:cube`, end
   with a report (what was built, commits, checks, frame time vs 7×7,
   deviations, surprises). Operator «туман в закрытом пространстве -- вообще
   такая себе идея». — Agent built it, pushed two commits, browser-probed, and
   reported in Russian. (verbatim in Last agent turn)
2. **Stop hook**: cost pricing failed on `git merge-base origin/main HEAD`. —
   Agent fetched `origin/main`; the merge base resolves now.

## Intent

The eye on its floor sees through openings only — a long corridor to its end,
nothing built behind solid walls — with no fog at all.

## Decisions

- **Region-to-region visibility** (from the eye's room plus every room it opens
  into) beat from-the-eye-point: the mesh rebuilds async only on a room change,
  so the wider seat set keeps rooms from popping during that window.
- **`Walls`/`mazeWalls` moved** from `features/player` to `entities/world`,
  which `sight` needs.
- **Portal code lives in `rooms.ts`**: a separate `portals.ts` was refused by
  `masd:clusters`.
- **`FAR = 24`** kept (`src/cube/pages/cube/lib/camera.ts`); past it the screen
  shows `airOf`'s clear colour.
- `geometry.test.ts` deep-floor coordinate bound loosened from 4 to 28.

## Errors and dead ends

- An early ray-test failure was the test picking visible rather than open
  neighbours as starts; `sight` was right.
- Browser frame time on swiftshader is vsync-capped at 16.7 ms, so it cannot
  compare against the 7×7 base; quad counts (via `tmp/probe-cost.ts`) stood in.

## State

- Branch `cube/sight`, head `edf9390b`, pushed; no PR (by brief).
- Plan file `docs/plans/hash-maze-cube.in-progress.md` is the producer's,
  untouched here.
- Nothing running.

## Pointers

- `src/cube/entities/world/model/rooms.ts` — `seenFrom`, `sight`.
- `src/cube/entities/world/model/walls.ts`, `rooms.test.ts`.
- Transcript: https://claude.ai/code/session_01DaohkDkhakSEsAdhUki6a1

## Next step

Wait for the operator (or the producer's review).

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Вова, ориентировался: читаю куб, дальше пишу видимость через проёмы в `entities/world`.

Модель готова и протестирована; теперь страница: убираю туман из шейдера и униформ, подключаю `sight` к `FAR`.

Чиню линт: тип `Walls` теперь живёт в `entities/world`, игрок импортирует его оттуда.

Линт, типы и type-overlap чистые; гоняю тесты куба напрямую (у `pnpm test` нет merge-base с main в этом клоне).

Всё зелёное. Ставлю оценку и коммичу.

Запушено. Теперь браузер: смотрю, как `play:cube` гоняет кадры, чтобы мерить так же.

Стресс (450 комнат × 400 лучей, far 24) зелёный. Теперь сравнение объёма: комнат и граней против квадрата 7×7.

Ray-тест зелёный, коммичу и пушу.

Вова, глаз куба теперь видит сквозь проёмы, а тумана больше нет. Прямой коридор виден до самого конца, а комнаты за глухой стеной не строятся. Оба коммита в `cube/sight`.

**Что сделано**
- **`sight`** в `entities/world/model/rooms.ts` теперь ищет видимость через порталы на этаже n:
  - обход идёт только через открытые стены;
  - каждый проём сужает дугу допустимых направлений, и обход стоит, когда дуга схлопнулась;
  - комнаты дальше `FAR` (24 стороны комнаты) отсекаются;
  - каждую комнату обходит один раз, потому что лабиринт — дерево, так что стоимость ограничена.

  Функция чистая и зависит только от позы и предиката стен. Индексы BigInt не мешают, о край куба обход не спотыкается. `Sight`/`View` и всё, что читает `near` (`above`, `overhead`, `topmost`, `withBelow`, `slabRooms`), работают как раньше.
- **Туман** удалён из шейдера и из униформ кадра. Цвет очистки — по-прежнему `airOf` этажа, теперь его видно только за `FAR`. Ambient не менялся, освещение одинаковое на любом расстоянии. `RADIUS` и `FOG_DENSITY` удалены.
- **Тесты** покрывают всё из задания и ещё несколько случаев:
  - свою комнату за четырьмя стенами;
  - коридор из 13 комнат до конца;
  - отсечку по дальности;
  - глухую стену;
  - L-поворот (видна комната на изгибе, дальше нет);
  - боковую дверь;
  - угол куба.

  Отдельный тест кидает лучи по настоящему лабиринту на этажах 4, 10 и 60. Каждая комната, до которой доходит луч, оказывается в `near`.

**Коммиты**
- `ab0bc2a6 feat(vova): the cube's eye sees through openings, without fog`
- `edf9390b test(vova): every room a ray reaches is in the eye's sight`

**Проверки**
- Прошли: lint, `tsc`, `pnpm type-overlap`, `check:cycles`, `check:masd`, `masd:clusters` (0 кластеров), knip. Тесты куба зелёные: 17 в `rooms`/`geometry`, 71 на весь куб.
- `pnpm test` без аргументов не нашёл merge base с веткой по умолчанию, поэтому файлы тестов я передавал ему явно.
- `pnpm play:cube` снимает оба кадра как раньше.
- В браузере (`/cube`, этажи 1, 10 и 60) я поставил глаз в начало коридора из 9 комнат и прошёл по нему три шага. Коридор виден до торца, на шагах ничего не возникает из воздуха.

**Время кадра против квадрата 7×7**
- В браузере кадр упирается в vsync: 16.7 мс p50 и p90 на всех трёх этажах. На программном GPU (swiftshader) это ничего не различает, поэтому базовый коммит в браузере я не гонял — он показал бы те же 16.7.
- Честнее сравнить объём сцены, по 200 случайным поз на этаж:

  | Этаж | Квадов в среднем, новое / 7×7 | Худший случай, новое / 7×7 |
  |---|---|---|
  | 10 | 145 / 229 | 358 / 256 |
  | 60 | 149 / 232 | 334 / 256 |

  В среднем квадов на треть меньше, в худшем случае — до ×1.4 больше. Сам `sight` считается за 0.5–0.7 мс, максимум 5.7 мс, и только при смене комнаты, не каждый кадр.

**Отступления от задания**
- Видимость считается не из точки глаза, а из всей его комнаты плюс соседей, в которые она открыта. Меш пересобирается асинхронно и только при смене комнаты, а так в окне, пока он не пересобрался, ничего не пропадает.
- `Walls` и `mazeWalls` переехали из `features/player` в `entities/world`, потому что `sight` нужен предикат стен.
- Код порталов живёт в `rooms.ts`: отдельный `portals.ts` `masd:clusters` забраковал как кластер.
- В `geometry.test.ts` я ослабил границу по координатам на глубоких этажах с 4 до 28, потому что `near` теперь достаёт дальше.
- `FAR` оставил 24. Без тумана за ним виден тёмный цвет очистки, но на снимках коридоры в эту дальность не упираются.

**Что удивило.** Моя интуиция один раз проиграла тесту: через дверь в конце коридора параллельный коридор действительно виден, узкой щелью почти скользящих лучей. Пратчетт сказал бы, что свет в лабиринте ходит по своим делам и разрешения не спрашивает.

Подсчёт стоимости сессии не смог найти общий предок ветки с `main`, потому что в контейнере не было `origin/main`. Я подтянул `main`, и теперь общий предок находится (732b536e). Строка стоимости за этот ход не записалась; следующая строка покроет и его.
```
