# Relay 6 — origami tardigrade: the base inflates; legs from the flap tips

## 1. Standing constraints

None stated by the operator.

## 2. The conversation

- **Operator (launch):** `/relay take claude/origami-volume-c79y3i — купол раздувается решателем из прижатого блинца, но грани гнутся; план на паузе`
  - **Agent:** attached, set the estimate, resumed the paused plan. Found that relaxing from the flat blintz pose takes the degree-6 vertex's trivial branch on one half (two diagonals stay at 0°), and that relay 5's `angles.ts` put the midline in the wrong plane. Built the vertex's rigid folding in closed form (`fromVertex`) and started the relaxation from it: 0 crossings, 1.2% strain, flat faces. Committed, sent the render (a clean waterbomb tent).
- **Operator (mid-turn):** «шикардосик какой (хотя пока ничё и непонятно:-)!»
  - **Agent:** explained, in the turn's report, that the picture they had seen was the half-open star, and that the base now opens properly; listed what is next (flap side, strain, legs and snout). Also noted a needless `git push` deleting a nonexistent `…-placeholder` branch, which auto mode blocked.
- **Stop hook** asked for an authorization phrase for that blocked call. **Agent:** none needed — the estimate had been set by a separate call and the delete was pointless.
- **Operator:** «а ты меня ждёшь? не жди, делай :)»
  - **Agent:** kept going without stopping: fixed the prototype viewer's colours (triangle order), folded the four blintz flaps' tips back out past the edge before the base (`TIPS=1`) → four legs poking down under a green body; tried kite-narrowing the corners (dead end); ψ = 75° settled under 1% strain; tried blunting the corners under (`BLUNT=0.12`) as an option and sent its render, asking which reads better. Then the context budget warning came, and the session paused the plan and relayed. (verbatim in Last agent turn)

## 3. Intent

Unchanged: an original origami tardigrade from a classic base, «объёмное, замкнутое, с ножками, в идеале и с намёком на морду тихоходки». The scheme is the agent's call; the operator judges by renders and wants the agent to keep working rather than wait on them («не жди, делай»).

## 4. Decisions

- **Start the relaxation from the vertex folded in closed form, not from the flat pose** — from flat, the solver takes the trivial branch on one half; a stiffer `FACET` only settles it there faster. Each base crease rests at the angle it starts at. `waterbombVertex(ψ, tent)` in the prototype holds the maths (midline ray at `s = −2·atan(sin ψ)` in the mirror plane).
- **ψ = 75°, `TENT=1`, `FACET=30`** as the defaults: 0 crossings, 0.99% strain.
- **Legs from the blintz flaps' tips**, folded back out past the blintz edge before the base (`TIP=0.18`). Eight points in all: four base corners, two tips mid-sides, two at the ridge's ends (one the natural snout).
- Terms: **trivial branch** — the vertex folding only along its midline with the small sectors staying in the big faces' planes; **tent** — the inflated waterbomb base; **`TENT=±1`** — which way the vertex opens relative to the pose; **ψ** — the big faces' tilt about the midline (0 flat, 90 pressed).

## 5. Errors and dead ends

- Stiffer facets from the flat pose: settled at 10% strain on the trivial branch.
- Flipping target signs per crease family (`FLIPSET`): no better (crossings or strain up).
- Kite-narrowing the corners in the pose: a line through a corner crosses the whole square and swallows the next corner («fold: nothing at 0.95,0.46»).
- Blunting the corners under: works, but strain 2% and boxy; kept as an option, question to the operator open.

## 6. State

- Branch `claude/origami-volume-c79y3i`, draft PR #253 (title and body still describe the basilisk and the solver), open, mergeable. Last pushed commit fb94a8e1 before this relay's own commit.
- Plan: `docs/plans/origami-tardigrade.paused.md` — its `## Left` is the work order.
- Nothing running: no CI, no PR subscription, no scheduled check-in.
- Estimate: this session 1.5 h senior developer ("finding why the solver took the vertex's trivial branch and deriving its rigid folding in closed form is numerical reasoning a senior must do") + 1 h senior designer ("choosing which flaps become legs, the tent's angle and the corners' treatment by render is a designer's judgement"). Remainder handed on: 2.5 h senior developer ("moving the closed-form vertex start and the per-triangle render into src with unit tests on the sector maps, and replacing v1, is numerical code a senior must reason about") + 2 h senior designer ("making the corners read as legs and one ridge-end tip as a snout, by render and eye, is a designer's judgement").
- The muthur sync offer was made; do not make it again.

## 7. Pointers

- `docs/plans/origami-tardigrade.paused.md` — § "The base settles: start it folded, not flat (relay 6)" onward, and `## Left`.
- `docs/remove-before-merging/origami-volume-c79y3i/prototype/` — `dome.ts.txt` (env `PSI`, `TENT`, `TIPS`, `TIP`, `BLUNT`, `FACET`, `MAXIT`, `DIAG`), `show.ts.txt`, renders `vertex-psi60.png`, `tips-psi60.png`, `tips-psi75.png`, `blunt-psi75.png`. To run: copy each `.ts.txt` to `tmp/tg/` as `.ts`, recreate `tmp/tg/relax.ts` with relay-5's `sed` recipe (relay-5.md § 7) plus `BATCH_EDIT=1 sed -i -e 's/^const CREASE = 0.7;/const CREASE = Number(process.env.CREASE ?? 0.7);/' -e 's/^const FACET = 0.7;/const FACET = Number(process.env.FACET ?? 0.7);/' tmp/tg/relax.ts`, then e.g. `TIPS=1 PSI=75 TENT=1 FACET=30 MAXIT=40000 npx tsx tmp/tg/dome.ts && npx tsx tmp/tg/show.ts tmp/tg/relaxed.json tmp/tg/out`.
- `src/origami/scripts/fold-model.ts` — where a `--relax` path goes; `src/origami/entities/design/model/design.ts` — the `Design` type; `src/origami/shared/fold/relax.ts` (stiffness constants), `mesh.ts`.
- This session: https://claude.ai/code/session_01DaohkC6LTq4hcRFDEMdNbj

## 8. Next step

Resume the paused plan (`/go` Step 1's `*.paused.md` case), in line with «не жди, делай :)» and «объёмное, замкнутое, с ножками, в идеале и с намёком на морду тихоходки»: `## Left` item 2's rest (corners into legs, a snout), showing the operator renders as stages land; then item 3 (into `src/` with tests). Pending with the operator: which corners read better — the wide wings (`tips-psi75.png`) or the blunt feet (`blunt-psi75.png`); keep working while it is open.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Записываю находку в план и коммичу.

Вова, привет! Работаю дальше с того места, где остановилась прошлая сессия: https://claude.ai/code/session_01DaohkBhCvdHPzwHmdrHaoD

«Ничё непонятно» было честной оценкой: на той звезде, которую ты, судя по всему, видел, бумага раскрылась только наполовину. Теперь основа раскрывается правильно — картинка выше. Это классическая водяная бомбочка в виде шатра: грани плоские, бумага нигде не проходит сквозь себя, растяжение 1,2% (было 10–16%).

**Почему половина не раскрывалась.** Решатель стартовал с плоского листа. В центре основы сходятся шесть сгибов, и из плоского положения бумага может пойти двумя путями:
- правильный: диагонали складываются, и боковые клинья уходят внутрь шатра;
- ленивый: складывается одна средняя линия, а клинья остаются в плоскости больших граней.

Одна половина пошла по ленивому пути, поэтому две диагонали остались на 0° вместо −119°, а грани согнулись. Более жёсткая бумага не помогла: решатель просто быстрее застревал в том же месте. Попутно нашлась ошибка в прошлом расчёте «согласованных углов»: средняя линия там лежала не в той плоскости, так что углы на самом деле не были согласованы. Поэтому они и сделали хуже.

**Что сработало.** Сначала я складываю центр жёстко по точной формуле: большие грани наклонены на угол ψ, клинья встают между ними. Каждому сгибу велю держать тот угол, с которого он начал. После этого решатель только доводит детали. При ψ = 60° все сгибы встают в пределах ~1° от цели: средняя линия 120°, диагонали 135°.

**Что дальше:**
- Прибавки клапанов блинца (зелёная сторона) пока не видны снаружи ни в одном из двух вариантов. Проверю, на какую сторону они ложатся: на них потом строить ножки.
- Растяжение 1,2% чуть выше цели в 1%. Подозреваю, что виноваты сдвиги слоёв клапанов на сгибах.
- Потом ножки и морда.

Прототип, рендер и разбор лежат на ветке (cf9ef51e), в плане `docs/plans/origami-tardigrade.in-progress.md`.

Когда я отцеплял сессию от авто-ветки, я заодно отправил лишнюю `git push`, удаляющую ветку `…-placeholder`. Такой ветки нет, и команда была вообще не нужна. Автоматический фильтр её заблокировал, и правильно сделал, так что разрешать ничего не надо.

Разрешение не нужно: оценку я потом записал отдельной командой, а удаление `claude/origami-volume-c79y3i-placeholder` было лишним, потому что такой ветки нет.
```
