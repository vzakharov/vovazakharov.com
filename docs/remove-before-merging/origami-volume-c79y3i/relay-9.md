# Relay 9 — folding by feel found a frilled dinosaur; the engine needs per-crease holds to build it

## 1. Standing constraints

None stated by the operator.

## 2. The conversation

- **Operator (launch):** `/relay take claude/origami-volume-c79y3i — складывание наугад нашло рыбу, каллу и бабочку; план на паузе`
  - **Agent:** attached, set the estimate from the remainder, flipped the plan to `in-progress`, restored the prototype tools into `tmp/tg/`. Tried fish variants itself (uneven holds inside a fan strain 10–15%; a looser tail is clean), then launched three subagents pushing the fish, the calla and the butterfly.
- **Background:** the subagents reported one by one. **Agent:** showed each best render and committed it with its steps: calla → lotus and tulip; fish → slimmer fish with a gill line; butterfly → frog (head-on). Recorded round two in the plan, then launched two more subagents: the frog (give it a body) and the tulip (its top view read as a paper jet).
- **Operator (with a picture of a dilophosaurus with its frill spread, replying to the frog render):** «мне больше дилофозавра напоминает, но тебе виднее 🙂»
  - **Agent:** agreed — the raised flaps are a frill missing a head between them; sent the frog subagent the reading as a lead, not a target.
- **Background:** the tulip came back as a moth (and a swept-wing jet); the frog as a dilophosaurus with a head, and a frog with a muzzle. **Agent:** showed and committed each, then launched a dilophosaurus subagent (jaw, tail), then one to open its box body (two-stage relax: 4.0%, body 3× deeper), then one to fold the head without shutting the body (holds varying along a crease: a hump, 3.02%). Each shown and committed. Ended on a three-way question to the operator. (verbatim in Last agent turn)

## 3. Intent

Fold aimlessly and follow what reads as _something_, with no target: «у тебя нет задачи сделать тихоходку. не думай ни о тихоходке, ни о белом медведе» (relay 8). Keep working without waiting on the operator, show renders as they land. The operator now reads the waterbomb-base find as a dilophosaurus, which the work followed. The original brief behind the branch (relay 1–6) was a volumetric, closed model with legs; the tardigrade was its chosen subject.

## 4. Decisions

- **Subagents per find** (as in relay 8): each pushes one find in its own `tmp/tg/<dir>/`, reports 1–3 best; the agent views, commits render + steps to `prototype/`, records lessons in the plan.
- **The operator's dilophosaurus reading taken as a lead**, handed to the frog's subagent mid-run.
- **Two-stage relax** (base relaxed from flat into a tent, then the whole model from it) over POSE=0–3: the only start that opens the base without 13–276 crossings.
- **Holds varying along a crease** in the relax driver: the only way found to fold the head and keep the body open; no fold step can express it, so a design built on it needs the engine extended.
- Terms: **hold**, **POSE**, **clean** as in relay 8; **box** — the waterbomb base's body held shut by its spine; **gap** — back-to-belly distance (`gap.ts`); **pinch / RADIAL** — base creases pressed shut near the sheet's centre, blending out.

## 5. Errors and dead ends

All in the plan's § "Folding by feel, round two (relay 9)". Headline ones: uneven holds inside a fan (10–15%); partial-stack folds drag every joined layer; ragged frill nicks (~20 crossings); opening the spine with the head in place (≥ 4% without the pinch); reverse, slanted or shaping heads (9–23%). Parallel renders hang — `run3.sh` renders serially. One commit trailer this session (the slimmer fish, 2nd find commit) carries the predecessor's session link by mistake; not rewritten, since history is never force-pushed.

## 6. State

- Branch `claude/origami-volume-c79y3i`, draft PR #253 (title and body still describe the basilisk and the solver), open, mergeable at attach.
- Plan: `docs/plans/origami-tardigrade.paused.md` — § "Folding by feel, round two (relay 9)" and `## Left` item 0, the open question.
- Nothing running: all subagents finished; no CI, no PR subscription, no scheduled check-in; the keepalive stops with this park.
- Estimate: this session 0.5 h senior developer ("the two-stage relax and per-crease hold profiles in the prototype driver are numerical tooling a senior must reason about") + 1.5 h senior designer ("directing nine fold-by-feel explorations and judging each render by eye is a designer's call"). Remainder handed on: 3 h senior developer ("per-crease hold profiles in the fold engine and its relax, moving the two-stage start and the per-triangle render into src with unit tests, and replacing v1, is numerical code a senior must reason about") + 1 h senior designer ("settling the found dinosaur into a design by render and eye is a designer's judgement").
- The muthur sync offer was made; do not make it again.

## 7. Pointers

- `docs/plans/origami-tardigrade.paused.md` — the work order, all lessons.
- `docs/remove-before-merging/origami-volume-c79y3i/prototype/` — renders `feel-{lotus,tulip,fish-gill,frog,moth,dilo,frog-head,dilo-tail,dilo-jaw,dilo-open,dilo-hump}.png`, steps beside them; `go.sh.txt` (run helper); `dilo2-*.txt` (two-stage relax: `two.ts`, `orient.ts`, `gap.ts`, `gen.py`, `run2.sh`); `dilo3-*.txt` (pinched holds: `two3.ts` env `SPINE`/`RADIAL`/`OVR`, `gen3.py`, `v.txt`, `best3.sh`, `run3.sh`, `flatof.ts`). The hump is `v.txt`'s `rx2`.
- To run: copy `prototype/*.txt` to `tmp/tg/` without `.txt` (the `dilo2-`/`dilo3-` ones into `tmp/tg/dilo2/`, `tmp/tg/dilo3/` under their bare names; check their relative imports), recreate `tmp/tg/relax.ts` with relay 7's `sed` recipe (`relay-7.md` § 7). The frog/dino steps' generator (`tmp/tg/frog/gen.py`, `tmp/tg/dilo/gen.py`) was not committed; the steps JSON files were.
- Writing scratch files with the shell needs `BATCH_EDIT=1` in front.
- This session: https://claude.ai/code/session_01DaohkFmorHxsyeRfBWkctB

## 8. Next step

Wait for the operator's answer to the question in the Last agent turn: (1, recommended) make the dilophosaurus the design — per-crease hold profiles in the engine with tests, then `## Left` items 3–4 with it in the tardigrade's place; (2) keep folding by feel (lotus, moth unpushed); (3) something else. No new exploration round before the answer. On (1), resume the plan through `/go` Step 1's `*.paused.md` case and record the answer in it.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Вова, у дилофозавра появился горб, картинка выше. В три четверти видна округлая спина, голова поднята на шее, челюсть загнута крючком. Пересечений нет. Растяжение 3.02%: ровно на пороге, но в пределах. Тело раскрылось в полтора–два раза сильнее, чем в прошлый раз.

**Как это получилось.** Голове нужно, чтобы хребет и две боковые складки базы были сомкнуты там, где сгиб головы их пересекает. Остальному телу это не нужно. Поэтому подагент зажал складки остро только у шеи, а дальше по телу ослабил. Это как пережать бумагу пальцами на шее, а спину оставить свободной.

**Подвох.** Отдельным шагом складывания так не сделать. Движок даёт складке одну силу на всю длину. Подагент задал силу по длине складки прямо в расчёте, где бумага пружинит. Значит, если ящер станет настоящей моделью, движку понадобится новая возможность: сила складки, которая меняется вдоль неё. Ещё подагент проверил голову из обратного сгиба, косую и наклонную. Все варианты растягиваются на 9–23%, тупик.

Сохранил горб, инструменты и урок в `prototype/` и в план, всё запушено.

Дальше развилка, решать тебе:

1. **Делаем ящера моделью** (рекомендую). Учим движок силе складки вдоль её длины, с тестами. Дальше раздел «Left» плана: выносим расчёт из `tmp/` в `src/` и заменяем им v1 тихоходки. Тихоходку уже меняем на дилофозавра. Твой «объёмный, замкнутый, с ножками» почти выполнен: объём есть, ножки есть, бонусом воротник.
2. **Ещё складываем наугад.** Лотос и мотылёк пока никто не дотягивал. Но отдача от раундов падает: последние два ушли на то, чтобы раскрыть одно тело.
3. **Что-то третье**, на твой вкус.

Новых подагентов до твоего ответа не запускаю: от него зависит, в какую сторону вообще двигаться.
```
