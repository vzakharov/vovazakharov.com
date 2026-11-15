# PR #280: feat(vova): doors and gaps through the walls of the cube's floors

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/280
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/cube-board-right-hand-doors-oldy2u
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-11-14T10:16:09Z
- **Updated:** 2026-11-15T09:16:42Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 5

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (no export committed on the branch yet). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `src/cube-board/app/config/cube/one.yaml`:55 — unresolved — last: @vzakharov (human) 2026-11-15T08:46:13Z — "ну да, можно взять идею, от неё стрелочку к реализации, а ля…" → [↓](#t01)
- **T02** `src/cube/entities/theme/workplace/conference-hotel/config/conference-hotel.wgsl`:22 — unresolved — last: @vzakharov (human) 2026-11-15T08:47:15Z — "вот и пообщались :) принятые критические предложения нужно о…" → [↓](#t02)
- **T05** `docs/remove-before-merging/cube-board-right-hand-doors-oldy2u/squash-message.md`:9 — unresolved — last: @vzakharov (human) 2026-11-15T08:50:19Z — "чем отличается passage от gap?" → [↓](#t05)
- **T06** `docs/remove-before-merging/cube-board-right-hand-doors-oldy2u/squash-message.md`:17 — unresolved — last: @vzakharov (human) 2026-11-15T08:51:02Z — "последнее предложение -- о чём?" → [↓](#t06)
- **T07** `src/cube/entities/world/model/door.ts`:43 — unresolved — last: @vzakharov (human) 2026-11-15T09:12:00Z — "гордая дверь? :)" → [↓](#t07)

---

## Body

## Summary

- **Doors and gaps in the cube's floors.** Every wall has a kind — wall, passage, door, gap — read through one seam by the body, sight, meshes, signs and planting. Each maze partition gets one opening on a wall whose way round is at least 10 rooms; 75% are doors, the rest gaps; density is a setting at 100%. The window method finds a partition's candidate walls with at most nine bounded searches, so 2^58-wall partitions on deep floors cost nothing to list. Floors too small for the threshold get none (floors 1 and 2).
- **Sight on a maze with loops** sees whatever a straight line reaches, since gaps make the maze loop.
- **The door is the decor door made real**; decor doors are removed. Panels and a knob on both faces, paint and hinge side rolled per door. E or a tap opens the door the gaze is on, with a prompt; the leaf swings on the clock, blocks the body, and shuts once the player has left it. An open door is its opener's alone.
- **Doorways are kept clear**: every doorway sits at one spot along its wall (`DOORWAY_CUT`), and furniture, signs, shelves, theme fixtures and pieces tiled on a wall grid (`uncut` in the shader kit) stay out of it. Hotel wall lights fall on doors and hang clear of their frames.
- **The player feature** is cut into sub-slices by noun (body, hand, hands, play, abroad, scene, input).
- **The cube board** keeps the analysis in an ideas zone — the rule set, the numbers, simulator canvases and game frames — plus who sees another player's open door, and jumpscares behind doors. The simulator is the doors analysis artifact: https://claude.ai/artifact/E42bCrk3t6DubakRH61irN

Preview: https://preview2.vovazakharov.com/cube (slot 2).

## QA Checklist

- [ ] `door-opens` — on floor 7 or deeper, walk to a door, face it: a prompt shows; press E (or tap) and the leaf swings open; walk through, and it shuts behind.
- [ ] `faced-wins` — with two doors in reach, the one you look at opens, not the nearer one.
- [ ] `leaf-blocks` — a half-open leaf stops the body; the jambs let it through.
- [ ] `gap-through` — a gap is walkable and see-through, and no furniture or sign stands in it.
- [ ] `clear-doorway` — on the hotel, cinema, metro, darkroom and clean-room floors, nothing on the wall is cut by a doorway.
- [ ] `no-decor-doors` — the decor door model stands only as a real door in a doorway; floor 66's painted doors are the hallway theme's own and stay.
- [ ] `shallow-none` — floors 1 and 2 have no doors or gaps.
- [ ] `board-zone` — the board's 💡 ideas zone shows the frames in rows, none overlapping.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `door-opens` | partly | door and aim unit tests | the feel is manual |
| `faced-wins` | yes | `aimOf` / `doorsFaced` tests | — |
| `leaf-blocks` | yes | body door tests | — |
| `gap-through` | partly | wall-kind and sight tests | placement is visual |
| `clear-doorway` | no | not covered (shader) | before/after frames on the board |
| `no-decor-doors` | partly | decor tests | a look |
| `shallow-none` | yes | doorway threshold tests | — |
| `board-zone` | partly | the board build renders | placement is visual |

https://claude.ai/code/session_01DaohkE83TgA9HwGzYS9z1n

---

## Comments

- **C01** @vzakharov (agent) — 2026-11-14T10:19:26Z — "Proposed squash body: ``` The cube's floors were pure mazes:…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-11-14T10:19:26Z

[https://github.com/vzakharov/vovazakharov.com/pull/280#issuecomment-6875808721](https://github.com/vzakharov/vovazakharov.com/pull/280#issuecomment-6875808721)

Proposed squash body:

```
The cube's floors were pure mazes: a room was left only the way the
maze was carved, so a neighbour behind a wall could be a long walk
round. Doors and gaps now cut through some of those walls, at numbers
weighed in a simulation of the floor maze and kept on the cube board.

Every wall has one of four kinds, wall, passage, door or gap, and
everything that asks whether a body or a line of sight gets through
reads it through one seam. Each partition of the maze gets one opening,
on a wall whose way round is at least ten rooms; three in four are
doors, the rest gaps, and the density stays a setting at 100%. The
candidates come from a window by the partition's passage, so a deep
floor's 2^58-wall partition costs at most nine bounded searches and
the answer never depends on what was asked first. Sight on a maze with
loops now sees whatever a straight line reaches.

The door is the decor door made real, and decor doors are gone: panels
and a knob on both faces, paint and hinge side rolled per door. E or a
tap opens the door the gaze is on, a prompt names it, the leaf swings
and blocks the body, and it shuts once the player has left it; an open
door is its opener's alone. Every doorway sits at the same spot along
its wall, and furniture, signs, shelves, theme fixtures and pieces
tiled along a wall are kept clear of it.

The board's ideas zone holds the rule set, the numbers, frames from the
simulator and the game, and ideas for later: who sees a door another
player opened, and jumpscares behind doors.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

<a id="r01"></a>

### R01 — Review by @vzakharov (agent) — COMMENTED

_2026-11-14T10:23:10Z_

[https://github.com/vzakharov/vovazakharov.com/pull/280#pullrequestreview-5903753759](https://github.com/vzakharov/vovazakharov.com/pull/280#pullrequestreview-5903753759)

**/five-percent**: одно предложение, критических нет.
<!-- five-percent: b8b7107b32faccc2b8eb868a9d2df8264dcd0988 -->

<a id="r02"></a>

### R02 — Review by @vzakharov (agent) — COMMENTED

_2026-11-14T21:56:33Z_

[https://github.com/vzakharov/vovazakharov.com/pull/280#pullrequestreview-5907343400](https://github.com/vzakharov/vovazakharov.com/pull/280#pullrequestreview-5907343400)

**/five-percent**: два предложения, оба критические.
<!-- five-percent: 9690774fc634c06eeeab4e0825d69879dc52e211 -->

<a id="r03"></a>

### R03 — Review by @vzakharov (human) — COMMENTED

_2026-11-14T22:45:11Z_

[https://github.com/vzakharov/vovazakharov.com/pull/280#pullrequestreview-5907572554](https://github.com/vzakharov/vovazakharov.com/pull/280#pullrequestreview-5907572554)

**/five-percent**: одно предложение, критическое.

---
_Generated by [Claude Code](https://claude.ai/code)_
<!-- five-percent: 5906c0378dbb4c679d3b5276d7b53efac77ed059 -->

- **T01** `src/cube-board/app/config/cube/one.yaml`:55 — unresolved — last: @vzakharov (human) 2026-11-15T08:46:13Z — "ну да, можно взять идею, от неё стрелочку к реализации, а ля…" → [↓](#t01)
- **T02** `src/cube/entities/theme/workplace/conference-hotel/config/conference-hotel.wgsl`:22 — unresolved — last: @vzakharov (human) 2026-11-15T08:47:15Z — "вот и пообщались :) принятые критические предложения нужно о…" → [↓](#t02)
- **T03** `src/cube/features/player/body/model/door.ts`:100 — unresolved — last: @vzakharov (agent) 2026-11-14T22:11:12Z — "Принято: `doorsFaced` отдаёт `aimOf` все двери в досягаемост…" → [↓](#t03)
- **T04** `src/cube/entities/theme/kit/lib/core.ts`:28 — unresolved — last: @vzakharov (agent) 2026-11-14T23:39:00Z — "Принято: темы с сеткой по `s.uv.x` теперь гасят клетку, кото…" → [↓](#t04)
- **T05** `docs/remove-before-merging/cube-board-right-hand-doors-oldy2u/squash-message.md`:9 — unresolved — last: @vzakharov (human) 2026-11-15T08:50:19Z — "чем отличается passage от gap?" → [↓](#t05)
- **T06** `docs/remove-before-merging/cube-board-right-hand-doors-oldy2u/squash-message.md`:17 — unresolved — last: @vzakharov (human) 2026-11-15T08:51:02Z — "последнее предложение -- о чём?" → [↓](#t06)
- **T07** `src/cube/entities/world/model/door.ts`:43 — unresolved — last: @vzakharov (human) 2026-11-15T09:12:00Z — "гордая дверь? :)" → [↓](#t07)

<a id="t01"></a>

### `src/cube-board/app/config/cube/one.yaml`:55 — unresolved

```diff
@@ -47,6 +47,12 @@ items:
     box: [4673, 450, 244, yellow]
     icon: 💳
     text: 'Paying, open, and nobody knows how yet: Stripe takes $0.50 to $999,999.99 a charge, so floors 2 and 3 would go for bitcoin, an address and a sum on a static page. Below them, one payment l…
+  - id: one-8
+    type: sticky
+    updated: [2026-11-14T10:10:00.000Z, agent:cube]
+    box: [5008, 450, 244, yellow]
+    icon: ✋
+    text: 'Idea, a bug kept as a feature: doors that open into the room behind the wall. A hand on the right wall walks a whole floor while it has no loops, but a door cuts the wall, and a cut-off run can become an island the hand circles forever. At 5 doors per 100 rooms on a 32×32 floor, the hand that takes doors misses the hole 87% of the time; skip them and the rule still holds, so it fools only whoever was tempted'
```

**@vzakharov (agent)** — 2026-11-14T10:23:05Z

<!-- five-percent proposal · an answer here is scored by .claude/skills/five-percent/verdicts.md -->
**/five-percent** · optional

Стикер подаёт открываемые двери как отдельную идею, а баг — как редкий: «обманывает только того, кто соблазнился». Но такие двери на доске уже есть, прямо над этой зоной, в «Past floor ten»: дверь на шве тем (`deep-seams`) и порталы под девизом «Open every door» (`deep-portals`). Там дверь — главная дорога вглубь, так что соблазнится каждый, кто туда идёт.

**Иначе: связать `one-8` с этими карточками — линией к `deep-seams` или переносом в зону `z-deep` — и записать баг как цену тех дверей**

Цена: стикер уходит из «Iteration one» или тянет линию через границу зон. И слово «фича» придётся взвесить заново: при «Open every door» баг ловит всех, кто идёт вглубь, а не горстку любопытных.

<details><summary>Подробнее</summary>

- `deep.yaml:25`, `deep-seams`: «where two theme patches meet, a wall with a door … Behind it, the other world» — та же дверь в стене в соседнюю комнату, и она так же отрезает кусок стены от внешнего контура.
- `deep.yaml:37`, `deep-portals`: «A door, or a lift, drops you on another floor … "Open every door."»
- Линия через границу зон на доске уже есть: `l-cube-zero` в `cube.yaml`, `ends: [cube-7, z-zero]`.
- Попутно о слове: `zero.yaml:25` определяет «A door is just a missing wall». В этом смысле в совершенном лабиринте на 100 комнат 99 дверей, и «5 doors per 100 rooms» читается иначе, чем задумано. Если стикер переезжает к `deep-seams`, где «door» уже значит дверь-предмет, разночтение уходит само.
- Записи решения про место стикера нет: плана у ветки нет, на PR только комментарий со squash body.

</details>

**@vzakharov (human)** — 2026-11-15T08:46:13Z

ну да, можно взять идею, от неё стрелочку к реализации, а ля "во что это вылилось". Идеи задним числом при этом менять не надо

---

<a id="t02"></a>

### `src/cube/entities/theme/workplace/conference-hotel/config/conference-hotel.wgsl`:22 — unresolved

```diff
@@ -17,15 +17,45 @@ fn lamps() -> Lamps {
… 2 lines elided …
 
-/// Where the wall lights hang: metres up, and along from either end of a wall.
-const SCONCE = vec2f(1.25, 1.66);
+/// Where the wall lights hang: metres up, and along from either end of a wall,
+/// far enough in that the one beside a doorway clears its frame.
+const SCONCE = vec2f(ROOM.x - DOORWAY_AT + 0.35, 1.66);
```

**@vzakharov (agent)** — 2026-11-14T21:56:24Z

<!-- five-percent proposal · an answer here is scored by .claude/skills/five-percent/verdicts.md -->
**/five-percent** · critical

Дверь теперь может оказаться в любой закрытой стене любой темы, и всегда на одном месте: 3,76–4,73 м от западного или северного конца стены, до 2,1 м в высоту. Отель убрал свои бра с этого места, потому что его этаж попал в кадр. Остальные темы, которые рисуют что-то на стене по координате вдоль неё, никто не проверял, и как минимум две рисуют прямо в проёме.

**Иначе: проверить все темы, которые ставят что-то по `alongWall` / `wallAlong`, на это одно место через тот же `DOORWAY_AT`, а не чинить по одной теме, когда она попадёт в кадр**

Цена: просмотреть около дюжины шейдеров, а где что-то попало в проём — сдвинуть светильник или щит. Тогда эти стены изменятся и там, где двери нет, и кадры этих тем придётся переснять.

<details><summary>Подробнее</summary>

- `cinema-corridor.wgsl:50–55`: бра стоят на `run` 0,75 и 4,25 м, на высоте 1,7 м. Правое попадает в проём (3,756–4,726 м, верх на 2,1 м), так что на стене с дверью этой лампы нет, а её свечение (`sconceWash` в материале стены) остаётся на панелях по бокам и над проёмом: светится ореол вокруг двери, а лампы в нём нет.
- `metro-platform.wgsl:119–121`: щит с афишами на `run` 4,15 ± 0,55 м и высоте 1,45 ± 0,5 м, то есть 3,6–4,7 м × 0,95–1,95 м. Почти весь щит приходится на проём, от него остаётся полоска шириной около 15 см у косяка.
- Темы, которые размещают что-то по координате вдоль стены (по grep): parking-level, stencil, stairwell, server-floor, home, test-card, metro-platform, cinema-corridor, grandmother, garage, drawing, remembered, hallway. Картины в home висят на середине стены (2,5 м), им проём не мешает. У grandmother и drawing позиции выпадают по броску или идут шагом 1,66 м, их надо смотреть отдельно.
- Сообщение 52414950 само называет причину: «Every doorway is cut at the same place along its wall». Отель нашёлся по снимку этажа 8, а этажи 4–5 по плану оказались слишком тёмными для съёмки.
- `DOORWAY_AT` в `kit/lib/core.ts` уже доступен шейдеру каждого этажа, но пользуется им пока один отель.

</details>

**@vzakharov (agent)** — 2026-11-14T22:39:08Z

Принято: все темы проверены против одного места проёма, через `DOORWAY_AT` и новый `DOORWAY_TO` в ядре шейдеров — 5f803ee9, влито в daf74313. Светильник кинотеатра теперь висит в 1.54/3.46 м, симметрично, как в отеле; на платформе метро осталась одна доска с афишами, у западного или северного конца, потому что вторая шириной 1.1 м не помещается ни между вывесками и проёмом, ни в другом месте. Ещё сдвинуты нарисованные двери коридора на 66-м этаже, детские рисунки «My house», призрак картины у бабушки, фото в «Somebody's house» и трафаретный номер этажа на 4-м и 5-м. Сплошные покрытия (стойки, перфорированные щиты, витрины) проём режет, как обои, и их не трогали.

**@vzakharov (human)** — 2026-11-15T08:47:15Z

вот и пообщались :)

принятые критические предложения нужно отметить как "попадание" при подсчёте эффективности

---

<a id="t03"></a>

### `src/cube/features/player/body/model/door.ts`:100 — unresolved

```diff
@@ -0,0 +1,134 @@
… 81 lines elided …
+ * The closed door a body at `pose` opens with its hand: of its room's four
+ * walls, the nearest door it reaches and faces, swinging away from it.
+ */
+export function doorFaced(
+  pose: Pose,
+  isDoor: Doors['isDoor'],
+): OpenDoor | null {
+  const reached = wallsAround(pose)
+    .filter((wall) => canReach(pose, doorwayAt(pose, wall)) && isDoor(wall))
+    .map((wall) => {
+      const { u, v } = doorwayAt(pose, wall);
+      return { wall, distance: Math.hypot(u - pose.u, v - pose.v) };
+    })
+    .toSorted((a, b) => a.distance - b.distance);
+  const nearest = reached[0]?.wall;
+  return nearest === undefined
+    ? null
+    : { ...nearest, openFor: 0, shutAt: null };
+}
```

**@vzakharov (agent)** — 2026-11-14T21:56:31Z

<!-- five-percent proposal · an answer here is scored by .claude/skills/five-percent/verdicts.md -->
**/five-percent** · critical

Если в комнате есть двери и в восточной, и в южной стене, нажатие может открыть не ту, на которую игрок смотрит. `aimOf` выбирает цель по тому, что ближе всего к взгляду. Но дверь-кандидата ему подаёт `doorFaced`, а тот берёт ближайшую по расстоянию. Проёмы восточной и южной стен оба у юго-восточного угла, поэтому до обеих дверей часто можно дотянуться одновременно.

**Иначе: пусть `doorFaced` отдаёт все двери, до которых можно дотянуться, а `aimOf` выбирает среди них по тому же `offGaze`, что и для таблички с пилюлей — одно правило на одно нажатие**

Цена: `doorFaced` будет возвращать список вместо одной двери, и его тест придётся переписать. Правило «ближайшая по расстоянию» уходит совсем.

<details><summary>Подробнее</summary>

Воспроизведение на HEAD 9690774fc634c06eeeab4e0825d69879dc52e211, через `aimOf` напрямую: комната (3, 3) на этаже 5, двери в восточной и южной стене, тело в `u = 0.7, v = 0.8`, `yaw` 10°.

- Восточная дверь (1, 0.848): расстояние 0,30, от взгляда 1°.
- Южная дверь (0.848, 1): расстояние 0,25, от взгляда 43,5°.
- Обе в досягаемости (`HAND_REACH` 0,48) и в 50-градусном конусе `canReach`. `aimOf` возвращает `{ at: 'door', door: { isEast: false, … } }`, то есть южную дверь.

Правило про одну цель на нажатие появилось в плане как «one target per use press (the most directly faced)». `doorFaced` со своим «nearest» было написано раньше, и `aimOf` легло поверх него. Подсказка у двери (`walk.ts:193`) ничего не путает: она говорит только, что дверь есть, не какая.

</details>

**@vzakharov (agent)** — 2026-11-14T22:11:12Z

Принято: `doorsFaced` отдаёт `aimOf` все двери в досягаемости, и нажатие открывает ту, что ближе к взгляду. Пример из этого замечания (u 0.7, v 0.8, взгляд 10° от востока) стал тестом и открывает восточную дверь — 1ace2eca, влито в 23fc5f2e.

---

<a id="t04"></a>

### `src/cube/entities/theme/kit/lib/core.ts`:28 — unresolved

```diff
@@ -21,6 +22,19 @@ ${KINDS}
… 3 lines elided …
+/// Metres from a wall's west or north end to where a doorway in it may be cut,
+/// and to where that cut ends. It is the same span on every wall, so what
+/// clears it on all of them clears every door.
+const DOORWAY_AT = ${(ROOM_METRES * DOORWAY_CUT.from).toFixed(4)};
```

**@vzakharov (agent)** — 2026-11-14T22:45:11Z

<!-- five-percent proposal · an answer here is scored by .claude/skills/five-percent/verdicts.md -->
**/five-percent** · critical

Темы, которые расставляют предметы на стене по сетке `s.uv.x`, а не по `alongWall` / `wallAlong`, никто не проверял, и они всё ещё рисуют в проёме. Сетка идёт сквозь комнаты, комната 5 м делится на её шаг, поэтому проём всегда попадает в одну и ту же её клетку. В `clean-room` окно четвёртой полосы (1,25 м) стоит на 3,98–4,78 м, и полоска его стальной рамы 5–8 см торчит справа от косяка на каждой стене с дверью. В `darkroom` фотография на верёвке (шаг 0,4 м) висит на 3,66–3,94 м, и левый край проёма режет её пополам.

**Иначе: пройти и темы с сеткой по `s.uv.x` (`clean-room`, `darkroom`, `incubator`, `figure`, `wafer`, `circuit-board`, `mall-atrium`, `ice-rink` и др.) и гасить клетку, которая задевает `DOORWAY_AT`..`DOORWAY_TO`, через `alongWall`**

Цена: около десятка тем на чтение, кадры по каждой. Стены с дверью и без станут чуть беднее на одну клетку.

<details><summary>Подробнее</summary>

`floor-stage.wgsl`: `s.uv = vec2f(wide.x, s.p.y)`, где `wide = cell * ROOM.xz + s.p.xz` — сетка привязана к углу комнаты, её клетки одинаковы в каждой комнате. Косяки (`JAMB_WIDE`) стоят внутри выреза, так что всё за 4,73 м — стена.

`clean-room.wgsl` `cleanWall`: `pane = max(abs(across - 0.625) - 0.4, abs(h - 1.4) - 0.34)`, рама до `0.036` сверх стекла, окно в 45% полос.

`darkroom.wgsl`: `at = vec2f((fract(s.uv.x / 0.4) - 0.15) / 0.7, …)` — снимок в 0,06–0,34 каждой 0,4-метровой клетки.

Коммит 5f803ee9 называется «keep every theme's wall fixtures clear of a doorway», а прошлое предложение сформулировало «по `alongWall` / `wallAlong`» — сетку по `s.uv.x` оно и не назвало.

</details>

**@vzakharov (agent)** — 2026-11-14T23:39:00Z

Принято: темы с сеткой по `s.uv.x` теперь гасят клетку, которая задевает проём или выходит за конец стены, — через `uncut(s, size)` в ядре шейдеров, c7b0576a и b349466d, влито в 1a58a4142. Пятнадцать тем: `clean-room`, `darkroom`, `incubator`, `figure`, `circuit-board`, `wafer`, `ice-rink`, `casino`, `glow-golf`, `arcade`, `one-bit`, `mall-atrium`, `airport-gate`, `server-floor` и панели `conference-hotel`. В фотолаборатории снимок у проёма больше не висит, верёвка тянется дальше; в чистой комнате окно четвёртой полосы пропадает целиком. Клетка гаснет на каждой стене, с дверью или без, потому что сетка одна во всех комнатах. Сплошные покрытия проём режет, как обои, их не трогали.

---

<a id="t05"></a>

### `docs/remove-before-merging/cube-board-right-hand-doors-oldy2u/squash-message.md`:9 — unresolved

```diff
@@ -0,0 +1,36 @@
… 5 lines elided …
+round. Doors and gaps now cut through some of those walls, at numbers
+weighed in a simulation of the floor maze and kept on the cube board.
+
+Every wall has one of four kinds, wall, passage, door or gap, and
```

**@vzakharov (human)** — 2026-11-15T08:50:19Z

чем отличается passage от gap?

---

<a id="t06"></a>

### `docs/remove-before-merging/cube-board-right-hand-doors-oldy2u/squash-message.md`:17 — unresolved

```diff
@@ -0,0 +1,36 @@
… 12 lines elided …
+doors, the rest gaps, and the density stays a setting at 100%. The
+candidates come from a window by the partition's passage, so a deep
+floor's 2^58-wall partition costs at most nine bounded searches and
+the answer never depends on what was asked first. Sight on a maze with
+loops now sees whatever a straight line reaches.
```

**@vzakharov (human)** — 2026-11-15T08:51:02Z

последнее предложение -- о чём?

---

<a id="t07"></a>

### `src/cube/entities/world/model/door.ts`:43 — unresolved

```diff
@@ -0,0 +1,215 @@
… 39 lines elided …
+/** A door's sizes in metres: its frame's lining of the cut, and its leaf. */
+const DOOR = {
+  frame: 0.07,
+  proud: 0.025,
```

**@vzakharov (human)** — 2026-11-15T09:12:00Z

гордая дверь? :)

---

## Timeline (status, references, and other events)

- **2026-11-14T10:23:10Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/280#pullrequestreview-5903753759.
- **2026-11-14T10:47:06Z** @vzakharov renamed from «content: the cube board's right-hand rule fooled by openable doors» to «content: the cube board's ideas zone for doors into the next room».
- **2026-11-14T21:56:33Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/280#pullrequestreview-5907343400.
- **2026-11-14T22:45:11Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/280#pullrequestreview-5907572554.
- **2026-11-14T23:44:28Z** @vzakharov renamed from «content: the cube board's ideas zone for doors into the next room» to «feat(vova): doors and gaps through the walls of the cube's floors».
- **2026-11-15T09:16:42Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/280#pullrequestreview-5909912763.
