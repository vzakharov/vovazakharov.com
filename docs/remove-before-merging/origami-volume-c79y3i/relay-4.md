# Relay 4 — origami tardigrade: v1 rejected, the dome from a base, solver back

## 1. Standing constraints

None stated by the operator.

## 2. The conversation

- **Operator:** `/relay take claude/origami-volume-c79y3i — Василиск отложен, выбран тихоход, есть пробная палатка с настоящим объёмом`
  - **Agent:** resumed the paused plan and built v1 in `tardigrade.ts`: hems, three perpendicular segment pleats, the halves turned on the spine plus barrel creases curling the belly under, a snout from the head's lower corners folded under, eight legs as pleat corners turned outward (on a curled belly that points them down). Test (3 cases), commit d2ec0c93, sent the render, paused the plan for the operator's look.
- **Operator:** «слуш, прости, но думаю, просто сложить листик бумаги в 5 раз и назвать это тихоходкой -- так не покатит 🙂 ты можешь посмотреть какие-то "ключи" -- базовые формы, из которых в оригами обычно складывается дальше / извини что такой строгий ОКР)»
- **Operator (mid-turn):** «ой, ОТК»
  - **Agent:** agreed. Listed the classic bases (kite, waterbomb, preliminary, fish/bird/frog, blintz variants), checked by folding that the engine does the kite and the waterbomb base (book fold + two inside reverse folds); the preliminary failed on wrong lines; fish/bird/frog need squash, petal and rabbit-ear folds the engine lacks. Proposed (1) blintzed waterbomb base, eight flaps → eight legs (recommended) or (2) teach the engine squash/petal first.
- **Operator:** «а давай попробуем так, ты "нарисуешь" то что хочешь сложить обычной svg-шкой, я выберу, ты попробуешь -- заодно тебе самому будет "северная звезда"»
  - **Agent:** drew three targets in `tardigrade-sketches.svg` (1 dome, 2 rings, 3 plush ¾), stubby clawed legs, recommended 1 as the one with a path from a base (246d96b7).
- **Operator:** «а, то есть ты по-прежнему тихоходку хочешь? ну что ж, дерзай, выбор схемы за тобой, если это будет выглядеть как любое предложенное тобой (объёмное, замкнутое, с ножками, в идеале и с намёком на морду тихоходки, то уже хорошо :)»
  - **Agent:** chose the dome; folded the blintzed waterbomb base clean (12 pieces). Explained the engine cannot close a volume: a shaping fold turns one flap about one line, and any closed body has a vertex whose surrounding paper is one loop. Proposed folding the dome flat and springing it open with the solver from #254; noted two blintz flaps land at the apex, not under the belly. Asked to bring the solver back and close #254 (the operator had OK'd moving it out), and suggested handing off to a fresh session for context.
- **Operator:** «окей»
  - **Agent:** merged `claude/origami-springback` (the merge kept the solver's deletion, so `src/origami/shared` and `scripts` were taken from that branch; 15/15 origami tests pass; 48b0112c), moved its plan to `springback-notes.md`, commented on #254 and closed it, and relayed. (verbatim in Last agent turn)

## 3. Intent

An original origami tardigrade that reads as real origami: folded from a classic base, «объёмное, замкнутое, с ножками, в идеале и с намёком на морду тихоходки». Ruled out: a sheet folded a few times and called an animal (v1). The scheme is the agent's call; the operator judges by renders.

## 4. Decisions

- **Target: sketch 1, the dome**, from a blintzed waterbomb base. Rings (2) were judged hardest to fold honestly; plush (3) was drawn for the angle, not the fold.
- **Volume from the springback solver**, not rigid shaping: fold the model flat (legal everywhere), then let the creases spring open, as a real waterbomb is inflated. Alternative not taken: teach the engine to turn several creases about a shared vertex.
- **The solver lives on this branch again**; #254 closed in favor of #253.
- **Fold rule, sharpened**: a flat crease may cross an open spine only perpendicular to it; a tilted one moves the spine's piece off the line the halves turn on.
- v1 (`tardigrade.ts`) stays on the branch until the dome replaces it.

## 5. Errors and dead ends

- v1, rejected by the operator as not origami (see § 2).
- In v1: legs turned inward, or on a vertical side, only rise — a corner turned within a vertical panel never goes below its edge; a leg is at most half a pleat's depth wide.
- The preliminary base attempt failed: "a reverse fold needs a stationary part in each half" — wrong lines, not an engine limit.
- Merging the springback branch silently kept this branch's deletion of the solver files; they had to be checked out from that branch explicitly.

## 6. State

- Branch `claude/origami-volume-c79y3i`, draft PR #253 (title and body still describe the basilisk and the solver). Last pushed commit: the relay commit after 48b0112c.
- Plan: `docs/plans/origami-tardigrade.paused.md` — its `## Left` is the work order.
- #254 closed. No CI running, no PR subscription, no scheduled check-in.
- Estimate: this session 3 h senior developer ("building v1 in the fold engine, proving which classic bases it reaches, and merging the solver back is numerical code a senior must reason about") + 2 h senior designer ("v1's proportions, the three target sketches and choosing the dome are a designer's judgement"). Remainder handed on: 3 h senior developer ("folding the dome flat in the engine and making the springback solver settle it into a closed volume is numerical code a senior must reason about") + 3 h senior designer ("working eight legs and a snout out of the base's flaps so the dome reads as a tardigrade, by render and eye, is a designer's judgement").
- The muthur sync offer was made; do not make it again.

## 7. Pointers

- `docs/plans/origami-tardigrade.paused.md` — the task, the fold rule, the base findings, the open legs question.
- `docs/remove-before-merging/origami-volume-c79y3i/tardigrade-sketches.svg` — the north star; the operator accepts anything that looks like one of the three.
- `docs/remove-before-merging/origami-volume-c79y3i/springback-notes.md` — the solver's state and where it stopped.
- The blintzed waterbomb base, as steps (sheet coordinates): four valley folds of the corners to the center (lines through edge midpoints); book fold `{ line: (0,0)–(1,1), moving: [0.3, 0.7], tag: 'L', direction: 'mountain' }`; then `inside` reverse folds, `select: 'flap'`, `lower: 'L'`, on `x = 0.5` (moving `[0.3, 0.27]`) and `y = 0.5` (moving `[0.73, 0.7]`). Fold it colored side down so the blintz flaps show the front.
- `src/origami/entities/design/model/tardigrade.ts` — v1, how a design with `where`-computed steps and leg selection by `{ at, top }` is written; `basilisk.ts` for reverse folds.
- `src/origami/shared/fold/relax.ts`, `mesh.ts`, `contact.ts`, `hinge.ts` — the solver.
- `pnpm origami <design>` writes views and the physics report to `tmp/origami/<design>/`.
- This session: https://claude.ai/code/session_01DaohkEdWFm6YVgbkA4fk2X

## 8. Next step

Resume the paused plan (`/go` Step 1's `*.paused.md` case), in line with «дерзай, выбор схемы за тобой … объёмное, замкнутое, с ножками, в идеале и с намёком на морду тихоходки»: fold the dome flat from the blintzed waterbomb base, settle where the blintz flaps' legs come from, add the snout, render and show each stage, then inflate with the solver.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Хочу тихохода, да. Один раз его уже завалил, есть что исправлять. Беру первый вариант, «купол»: блинц, потом водяная бомбочка. Сначала проверю, что движок честно складывает эту базовую форму.

Вова, у этого движка есть потолок, и он упирается ровно в «замкнутое». Объёмный поворот в движке вертит один клапан вокруг одной линии, а клапан — это всё, что соединено с ним в обход этой линии. У любого замкнутого тела есть точка, где сходятся несколько несогнутых до конца складок. Вокруг неё бумага замыкается в кольцо, и ни одна прямая не отрезает от него отдельный клапан. Поэтому v1 и вышел трубой без торцов. Дело не в схеме, а в движке.

Что проверено:
- **Базовая форма складывается.** Блинц плюс водяная бомбочка — 12 кусков, чистый треугольник, картинку посмотрел. Плоский тихоход из неё возможен.
- **Объём так не получить.** Настоящую бомбочку надувают, а не дожимают поворотами. У нас для этого есть решатель пружинящих складок, тот, что уехал на отдельную ветку (#254): он даёт складкам отпружинить и раскрыть модель. План такой: сложить купол плоским (ноги и морда — обратными складками, это движок умеет), потом надуть решателем.
- **Нюанс с ногами.** Шесть клапанов из восьми там, где нужно: четыре клапана бомбочки и два от сложения пополам. Два оставшихся блинц-клапана ложатся вершинами на макушку купола, а не под брюхо. Как их развернуть в ноги, ещё буду думать.

Вопрос, на котором я стою: **вернуть решатель с #254 в эту ветку** и закрыть #254 в пользу #253? Ты тогда сказал «ок» на то, чтобы его вынести, поэтому без тебя не сливаю. Предупреждаю честно: на Василиске он так и не сошёлся, но купол куда проще. Альтернатива — научить движок честно поворачивать несколько складок вокруг общей вершины. Это отдельная большая работа в самом движке, зато потом замкнутые формы будут складываться без надувания.

Решение и это ограничение записаны в план (8443141d). Я бы ещё перед следующим большим куском передал работу свежей сессии: в этой контекст уже тяжёлый.
```
