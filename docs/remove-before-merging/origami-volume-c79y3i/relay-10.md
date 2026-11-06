# Relay 10 — toward the Basilisk's head; locks need a step-by-step relax, which folds bases clean but not yet a tuck

## 1. Standing constraints

None stated by the operator.

## 2. The conversation

- **Operator (launch):** `/relay take claude/origami-volume-c79y3i — складывание наугад привело к дилофозавру с горбом; план на паузе, ждёт выбора, делать ли его моделью`
  - **Agent:** attached (auto-branch delete refused with `stale info` — it was never pushed), read relay-9, set the estimate from its remainder.
- **Operator (mid-turn, answering relay 9's open question):** «слушай, ну пока я б не назвал это дилофозавром, но идти в направлении "какого-то" монстра, пожалуй, уже, стоит. Может, это будет голова Василиска? А как уж он будет выглядеть, как дилофозавр, Хищник, или что-то среднее или совсем другое -- сгибы покажут)»
  - **Agent:** resumed the plan (`paused` → `in-progress`, answer recorded in `## Left` item 0), restored the tools into `tmp/tg/`, launched three fold-by-feel subagents: a face head-on, a serpent head in profile, a free one from other bases.
- **Background:** the free subagent returned a horned mask (12-crease alternating centre fan, side view). **Agent:** showed and committed it, launched a follow-up to give the mask eyes. The face subagent returned **face-maw** (head-on: gaping maw, brow eyes, horns, fangs — slanted lower tip folds) and **face-mandibles** (tips flipped: Predator-like mandibles). **Agent:** showed and committed both; launched a follow-up to give the face depth (from three-quarter it is still the dinosaur's box).
- **Operator:** «мне кажется, что всем нашим попыткам up until now не хватает чтобы что-то цеплялось за что-то. Пока это просто лист бумаги, сложенный в определённой последовательности. Оригами создаёт опоры, конструкции, склейки без клея»
  - **Agent:** agreed, with the cause in the engine: no move tucks a flap into a pocket (valley always on top, mountain under), and every crease is told its own angle with frictionless contact, so nothing holds anything up. Recorded in the plan; launched a lock prototype (tuck + friction, a strip ring test). Asked whether to stop the three subagents still folding without locks.
- **Operator:** «да; получается, нам целую динамику тут нужно просчитывать»
  - **Agent:** read «да» as "stop them" and stopped the serpent, mask-eyes and maw-depth subagents (their files stay in `tmp/`, lost with the container). Answered: not dynamics with inertia but quasi-statics with path memory — friction makes the result depend on the order of fold, tuck, let go, so the relax has to follow the sequence.
- **Background:** the lock prototype returned. **Agent:** showed the ring — tucked + friction 0.5 holds closed, plain opens, tucked without friction slides out — but 31 crossings, 4.25%; committed; launched a cleanup. Cleanup: crossings are edge-through-edge (contact sees only vertices vs triangles) and nested creases, not friction; start lift fixed. **Agent:** decided to count nested creases on one line as touching, separately (asked the operator to object if they disagree — no answer); launched edge contact. Edge contact: 30 → 1 real crossing, strain 4.84% at the pocket's pinned free end. **Agent:** said it would accept that strain for a lock unless the operator objects (no answer), and launched a subagent to fold a monster head with a lock.
- **Background:** no lock helped a head — a tuck needs the pressed start, which multi-layer bases cannot relax from. **Agent:** reported, proposed folding step by step («как рука»), launched a sequential-relax prototype; said it would offer a relay when that returned.
- **Background:** first pass — stepping lands folds clean on the strip, the tuck jams. **Agent:** reported, launched a second pass, offered `/relay` («скажи "relay" или "запаркуй"»); no answer.
- **Background (keepalive wake):** watcher restarted. **Agent:** one line saying the subagent is still running. (verbatim in Last agent turn)
- **Background:** second pass — bases fold clean step by step (frictionless folding, unfold-collapse-press reverse folds); the face-maw breaks at step 5; the ring tuck still fails. The context-budget notice arrived (~273k): the agent recorded it in the plan, paused the plan and ran this relay unasked.

## 3. Intent

A monster's head — maybe the Basilisk's, which closes the loop on the branch's first ask («давай сделаем оригами Василиска … более объёмным и похожим на настоящие оригами») — its look left to the folds. And it should be origami in the operator's sense: parts that catch on parts, «опоры, конструкции, склейки без клея», not a sheet folded in sequence with each crease told its angle. The operator keeps work moving without waiting on parallelizable questions.

## 4. Decisions

- **Head first, engine after** (operator's answer): the per-crease-hold engine work waits until a head shows which folds it needs.
- **Locks are the direction** since the operator's remark; the head is to be folded with the lock prototype.
- **«да» read as "stop the non-lock subagents"** — ambiguous; nothing from them was lost beyond `tmp/`.
- **Nested creases on one paper line, within 4 gaps, count as touching**, reported apart — a mesh-resolution artifact (agent's call, open to the operator's objection).
- **4.84% strain accepted for a lock** at the pocket's pinned end (agent's call, open to objection).
- **Sequential relax over one-shot relax**: the only route by which a tuck reaches a multi-layer base; and the operator's «динамика».
- Terms: **tuck** — `direction: 'tuck', into: { at, below: k }`; **gap** — one sheet thickness; **nested** — crease-on-crease graze; **real** crossings — the rest; **`WAY=1`** — reverse fold by unfold-partway, collapse, press; **seat** — the phase after a tuck with the lid un-suspended; **face-maw / face-mandibles / horned mask** — the three head finds.

## 5. Errors and dead ends

All in the plan's § "Locks: what every model so far lacks (relay 10)". Headlines: tuck without friction slides out; glue gives more crossings than friction; edge points on creases double nested contacts and never settle; locking the face-maw's back corners refused (deep corner fold drags every joined layer); paper cup and envelope locks start at 100–280 crossings; a fold through all layers locks by itself, so its plain twin proves nothing; friction during folding steps jams (49–62 crossings); ramping each crease alone cannot turn a reverse fold; the ring's tuck jams with friction or stops 16–32° short without. One commit (35c94760) carries only a cost-ledger file under a plan-update subject — a staging slip, not rewritten.

## 6. State

- Branch `claude/origami-volume-c79y3i`, draft PR https://github.com/vzakharov/vovazakharov.com/pull/253 (open, mergeable; title and body still describe the basilisk and the solver). Head 97ef9b62 before this summary's commit.
- Plan: `docs/plans/origami-tardigrade.paused.md`; § "Locks…" carries every result; `## Left` item 0 carries "Where it paused" with the recommended next rounds.
- Nothing running: all subagents finished or stopped; no CI, no PR subscription; the keepalive stops with this session.
- Estimate: this session 2.5 h senior developer ("prototyping a tuck, Coulomb friction, edge contact and a stateful step-by-step relax, and diagnosing their crossings, is numerical tooling a senior must reason about") + 1 h senior designer ("directing head explorations toward a monster and judging each render by eye is a designer's call"). Remainder handed on: 5 h senior developer ("fixing the step-by-step relax's tuck and multi-layer jams, then porting tuck, friction, edge contact, the stateful relax and per-crease holds into src with unit tests, is numerical code a senior must reason about") + 1 h senior designer ("folding a lock-held monster head and settling it into a design by render and eye is a designer's judgement").
- The muthur sync offer was made; do not make it again. (It was made in relay 9's line of sessions; this session did not repeat it.)

## 7. Pointers

- `docs/plans/origami-tardigrade.paused.md` — the work order and every lesson.
- `docs/remove-before-merging/origami-volume-c79y3i/prototype/`:
  - head finds: `feel-horned-mask.*`, `feel-fanged-arch.png`, `feel-face-maw.*`, `feel-face-mandibles.*`, `face-run.sh.txt`, `face-mut.py.txt`;
  - lock engine: `lock-{fold,contact,relax,spring,mesh,go,sweep,diag}.*.txt`, `lock-ring-{tuck,plain}.*`, `lock-ring-tuck-edge.png`;
  - head-with-lock attempts: `head/` (steps with `-plain` twins, `mk.py`, `count.py`, `flat.*`, `tube1.png`);
  - sequential relax: `seq/` (`sim.ts`, `seq.ts`, `contact.ts`, `mesh.ts`, `go.sh`, `probe.py` as `.txt`; `base3`, `maw4`, `maw5`, `ring-tuck-skew` steps; `base3-stepped.png`, `ring-tuck-s3-jam.png`).
- To run: copy `prototype/*.txt` into `tmp/tg/` without `.txt` (relay-9 § 7 has the `dilo2-`/`dilo3-` layout); `lock-*` into `tmp/tg/lock/` and `seq/*` into `tmp/tg/seq/` under their bare names (check relative imports: `tmp/tg/seq/` imported `../lock/` and `../../../src/...`); recreate `tmp/tg/relax.ts` with relay 7's `sed` recipe (`relay-7.md` § 7); `chmod +x` the `.sh`. Shell writes need `BATCH_EDIT=1` in front.
- This session: https://claude.ai/code/session_01DaohkDPmjfyXghr4H5upSN

## 8. Next step

Resume the paused plan (`/go` Step 1's `*.paused.md` case) on its `## Left` item 0 "Where it paused" recommendation, the operator's latest direction being locks («чтобы что-то цеплялось за что-то») and their «получается, нам целую динамику тут нужно просчитывать»: at most two prototype rounds on (a) the ring tuck in the step-by-step relax and (b) the face-maw's step-5 jam; if both clear, port into `src/` and fold the head with a lock; if not, put the choice to the operator — keep at the engine, or build the head from holds alone (face-maw) and leave locks for later. Still unanswered from the operator, both carrying the agent's call: counting nested creases as touching, and accepting 4.84% strain for a lock; and whether they would rather be asked before a budget relay.

## Last agent turn

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Вова, складывание по шагам работает, но замок в нём пока заедает.

**Что работает.** Расчёт теперь складывает так, как ты описал «динамику». Он начинает с плоского листа, на каждом шаге доводит до конца только складки этого шага, даёт бумаге устояться, и следующий шаг идёт уже от получившейся формы. Обычное кольцо так проходит все шаги вообще без прорывов и раскрывается ровно как раньше.

**Что не работает.** Клапан при заправке застревает на полпути в кармане.
- С трением он цепляется за крышку кармана, и выходит 79 прорывов.
- Без трения он чистый, но не доходит до конца 32° и выскакивает обратно.

Похоже, руку мы изобразили неправильно. Человек, заправляя клапан, приподнимает пальцем крышку кармана, и клапан заходит без трения. Трение включается уже потом, когда модель отпускают.

**Что дальше.** Отправил подагента сделать ровно это: на шаге заправки трение выключено, после отпускания включено. Дальше главный вопрос: сложится ли по шагам водяная бомбочка, у которой при старте из прижатого состояния 216 прорывов. Если да, то следующей будет «пасть» с замком на затылке.

Всё записано в план, коммиты 75628ce6 и 6ca0a084.

Контекст у меня уже на исходе. Когда подагент вернётся, я бы передал работу свежей сессии (`/relay`): ей хватит плана и сводки. Если согласен, скажи «relay» или «запаркуй».
```
