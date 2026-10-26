# Relay 4 — the noun tree written, waiting on the operator's look

The elephant is MASD (PR #169, branch `claude/multi-app-sliced-design-7bn3oq`). This branch, `masd/one-page-measure`, is PR #216, based on the elephant, and carries bites 6a (significance by modularity) and 6b (the mushroom game split into slices). `relay-3.md` beside this file covers this same session up to its park; this relay covers what came after.

## Standing constraints

- «не надо гонять игру на каждом пуке … по крайней мере не делать это до финалайза» — no `play:mushrooms` or other runs of the game before `/finalize`.
- «давай только не городи поверх исправлять, а остановись, подумай, скажи мне что думаешь, и вместе решим» — on the layout, propose and decide together.

## The conversation

Messages 1–3 and the park are in `relay-3.md`. The operator then came back to the parked session:

4. **Operator:** «1 ок / 2 я бы делал так: если вдруг фичам надобиться импортить друг друга, то их суём в одну фичу (надо посмотреть сначала, что выйдет) -- собственно это и есть критерий "код общий"; если нет -- объединяем. ну и у нас всегда теперь есть наш хитровывернутый подсчёт модульности, он нам в помощь / 3 хмм, а какие альтернативы? > фича «цветок вырастает» сейчас импортирует это состояние, а оно импортирует её (game ↔ sprouting) / как это можно развязать? грубо говоря, что базовое из meadow может жить в энтити, и чему при этом не нужно будет импортить "вырастание цветка" (в частном случае, но вопрос про общий)»
   **Agent:** Read 2's «если нет -- объединяем» as "otherwise kept apart" and asked to be corrected if wrong; no correction came. For 3, explained why the loop exists: a part imports the whole (`sown(meadow: Meadow)` reads only `mushrooms`, `spores` and `scattered`) while the whole is built from parts (`Planted` includes `Sprouting`). The fix is to flip the arrow:
   - each part declares the slice it reads as a structural `With…` type and is generic in the rest (`sown<M extends WithMushrooms & Spored>(meadow: M): M`);
   - a noun's own data and life (the sprout, `Planted`, the house) go to its entity;
   - an encounter goes to a feature;
   - `Meadow`, the `Action` union and `reduce` go above the features.

   The alternatives for the whole are `widgets/meadow` (recommended) or the page; the operator's super-entities would be this very case, deferred.

5. **Operator:** «ну вроде звучит красиво / > Где тогда живёт целое — альтернатив по сути две / если наш виджет пройдёт критерий модульности -- почему нет. / к слову тут есть обратный вопрос: как бы нам определять, когда в одном слайсе скопилось что-то (кластер?), что заслуживает вынесения в модуль? но отложим это до момента, когда прямой вопрос решим элегантненько»
   **Agent:**
   - claimed the plan with this go-ahead quoted (23b504f);
   - reverted the dry-run cut (7fb1f33);
   - recorded the three answers in the plan's `## Rest of the bite`, and the converse question as deferred under `## Rest of the elephant`;
   - read the header of every one of the game's 240 files;
   - wrote `nouns-tree.md` (5e0f1cd): the target tree at slice level, five calls with recommendations, and the untyings needed first.

   The context budget warning then came, and the session paused and relayed. (verbatim in Last agent turn)

## Intent

The operator wants the game cut by nouns, readable to a native ear: base entities, encounters as features named for what happens, and the meadow as a widget if modularity passes it. That cut is the real test of MASD's significance rule from 6a. They distrust hacks that only quiet a checker, and heavy runs that no longer earn their time.

## Decisions

All of `relay-3.md`'s decisions hold. Added here:

- **The house is part of the mushroom.** The worm and the mice are base entities taking windows and doors as parameters.
- **Features are cut by what happens.** Two features that would import each other are one, and 6a's modularity checks what each holds.
- **The whole is built from its parts, above them.** A part is generic in the state slice it reads, and the whole lives in `widgets/meadow` if it passes as a module.
- **The dry-run cut is reverted** (7fb1f33). The code is back in the one page slice with 4763c65's renames: `BodySide`, `BODY_SIDES`, `runPathLength`.
- **Deferred:** the converse of 6a, i.e. when a cluster inside one slice earns a slice of its own.

## Errors and dead ends

See `relay-3.md`. Nothing new failed in this stretch.

## State

- **Branch:** `masd/one-page-measure`, pushed, head at this relay's commit after 515bb0e.
- **PR:** #216, draft, base `claude/multi-app-sliced-design-7bn3oq`. Its title, body and `squash-message.md` are still stale, and are refreshed once 6b is built.
- **Plan:** `docs/plans/multi-app-sliced-design.paused.md`; `## Rest of the bite` holds the answers and the order.
- **Estimate:**
  - this session: 3 h senior developer (the dry-run cut and its checks) + 1.5 h senior architect (the noun tree);
  - handed on: about 0.5 h senior architect (settling the tree with the operator, the file-level layout) and 8 h senior developer (the untyings, the move, the checks).
- Nothing running or waiting: no CI, no PR subscription, no check-in.

## Pointers

- `nouns-tree.md` here: the tree under review, its five calls and the untyings.
- `docs/plans/multi-app-sliced-design.paused.md` § "Rest of the bite".
- `layout-tools.md` here: the layout and move tools. `layout.ts`'s overrides are the rejected cut's; the file-level layout for the noun tree replaces them. `move.ts` runs from the pre-move tree, which is the tree now.
- `mushrooms-tree.md`: the rejected dry-run tree. `modularity-two-graphs.md`: 6a's measurement.
- `src/mushrooms/pages/mushrooms/CLAUDE.md`: the meadow tests. In this container they run in about 20 minutes on 4 CPUs, as three chunks under 10 minutes each.
- This session: https://claude.ai/code/session_01ECv1nPFhgfj82FFEr7uB7e

## Next step

Wait for the operator's look at `nouns-tree.md` and its five calls (sky and lawn as entities; the eye's geometry shared, walking a feature; the map inside the widget; controls in the widget; fireflies an entity). Then:

1. untie in place, per the tree's list;
2. generate the file-level layout and move;
3. re-count the 27 tests;
4. run `check:masd`.

No game runs before `/finalize`.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages,
usually unneeded but harmless; the reply proper is usually its last
paragraphs.

````text
В процессе — разбираю код `game.ts` и `sprouting.ts`, чтобы ответить на третий вопрос не абстрактно.

**1** записал. По **2** читаю так: две фичи, которым понадобилось импортировать друг друга, сливаются в одну, остальные живут раздельно, а модулярность проверяет, держится ли каждая. Ты написал «если нет — объединяем», но, судя по всему, имел в виду «разделяем». Поправь, если нет.

**3. Почему вообще цикл.** Кусок поляны импортирует целое. `sown(meadow: Meadow, …)` объявлен на всю поляну, а читает из неё только `mushrooms`, `spores` и `scattered`. При этом целое собрано из кусков: `Planted = Placed & Housed & Sprouting`, и `Sprouting` лежит в `sprouting.ts`. Отсюда и петля: целое нужно куску, кусок нужен целому.

**Как развязать в общем случае: перевернуть стрелку.** Кусок перестаёт знать о целом и объявляет только то, что ему нужно, а целое собирается из этих объявлений наверху. TypeScript позволяет это почти даром, потому что типы в нём структурные:

```ts
// было: кусок знает всю поляну
export function sown(meadow: Meadow, tap: WithId & SporeTap): Meadow
// стало: кусок знает только свои поля, отдаёт ту же поляну, что получил
export function sown<M extends WithMushrooms & Spored>(meadow: M, tap: WithId & SporeTap): M
```

Тогда раскладка получается такая:
- **В сущность уходит всё, что принадлежит одному существительному**: его данные и его собственная жизнь во времени. Для гриба это гены, поза, домик (по ответу 1) и сам росток, то есть `Sprout`, `Sprouting`, `sproutScale` и посаженный гриб `Planted`. Всё это о грибе и ни о ком другом.
- **В фичу уходит встреча**. Например, «из спор под дождём вырастают грибы»: это `sown` и `sproutedInRain`, и они видят гриб и дождь. Фича объявляет нужный ей кусок состояния (`WithMushrooms & Spored & {rain}`) и про `Meadow` не знает.
- **Целое собирается наверху**: `Meadow` как пересечение этих `With…`, union всех `Action` и `reduce`, который раздаёт действия фичам. Ниже `Meadow` никто не импортирует. Половина таких типов уже есть (`WithMushrooms`, `WithSpores`, `WithDusk`), то есть код наполовину уже так устроен.

**Где тогда живёт целое — альтернатив по сути две.** Целому нужны все фичи сразу, а фичи друг друга не видят, значит, место ему только выше фич:
- **`widgets/meadow` (рекомендую).** Поляна там целиком: её состояние, её ход (`reduce`) и её сцена. Страница остаётся React-обёрткой.
- **Сама страница.** Короче на один слайс, но тогда в странице снова окажется весь мир.

Ещё есть твои надсущности, сущность «поляна» поверх базовых. Это ровно этот случай, но ты сам отложил их, пока справляются фичи. Здесь справляются.

**Цена.** Механически это сигнатуры, ставшие обобщёнными, плюс переезд типов. Логика не меняется, и тесты поляны её стерегут. Если согласен, то рекомендованное по пунктам 1–3 записываю в план и следующим шагом пишу целевое дерево тебе на просмотр.

Жду твоего «да» или поправок по третьему пункту и по тому, как я прочитал второй. После этого запишу решения в план и сяду за дерево.
````
