# Relay 11 — locks hold with a hand; the engine is ported; the face-maw folds whole with two tucks

## 1. Standing constraints

None stated by the operator.

## 2. The conversation

- **Operator (launch):** `/relay take claude/origami-volume-c79y3i — замок держит кольцо, складывание по шагам чисто проходит базы, но заправка клапана и шаг 5 «пасти» пока заедают; план на паузе`
  - **Agent:** attached (the session started detached on the branch tip, so no auto-branch to delete), set the estimate from relay 10's remainder, resumed the plan (`paused` → `in-progress`), restored the prototype into two sandboxes (`tmp/tga/`, `tmp/tgb/`), reproduced the ring-tuck jam (82/86), and launched two subagents: the ring tuck and the face-maw's step 5. Restated the two open calls (nested creases as touching, 4.84% strain) as taken unless the operator objects.

No further operator message arrived; everything below came from subagents, each reported in chat as it landed:

- Ring tuck round 1 and 2 failed, with the cause found: the free-floating model whips round from the flap's swing, the pocket flips into a T-strut, and FIRE crawls; an edge-point suspend bug fixed on the way.
- Step 5 fixed by a **hand** (outside springs turning the flap rigidly about its crease, so the crease root takes no reaction). The agent then ran a third ring round past the two-round cap (said so in chat) with the hand: **the lock holds** — gap 0.154 vs 0.855 plain, holds at friction 0 too. In between the agent asked the operator a choice for the case the lock failed (port what works vs keep at the engine) and then withdrew it once the lock held.
- Port into `src/` in three slices (one designer agent ran out before code; its design went into the plan), all pushed, matching the prototype.
- Step 8 of the face-maw was impossible paper; recast as two tucks, the whole face-maw folds clean.
- The context-budget warning came at ~215k; the agent waited for the last two subagents, recorded, paused and began a relay. (verbatim in Last agent turn)
- **Operator (mid-relay):** «я думаю можно запарковать»
  - **Agent:** parked instead of starting a successor (`/relay park`).

## 3. Intent

A monster's head — maybe the Basilisk's («Может, это будет голова Василиска?») — its look left to the folds, and origami in the operator's sense: parts that catch on parts («чтобы что-то цеплялось за что-то … склейки без клея»). The operator keeps work moving without waiting on parallelizable questions.

## 4. Decisions

- **The hand** is the fold driver for every step (valley, mountain, tuck): it beat sideways contact, pressure, long-reach side sorting, pinning and lid lifting (all in the plan).
- **A third ring round past the cap**, because the step-5 fix was exactly round 2's untried idea.
- **Port before folding the head**, per relay 10's recommendation once both jams cleared.
- **Ring integration tests at the default mesh**: every coarser mesh lets the flap pass its lid.
- **Face-maw steps 8–9 as tucks** (data fix) rather than the engine change, which is still to do.
- Taken calls still open to the operator's objection: nested creases on one line count as touching; 4.84–5% strain at the nested pocket corner accepted; the hand turns direction-less steps as valleys.
- Terms: **hand** — `HAND=k` / `handGuide`; **`HAND_UNTIL`** — how long it pulls (the face-maw needs the phase's end); **tuck**, **gap**, **nested**, **seat**, **`WAY`** as in relay 10.

## 5. Errors and dead ends

All in the plan's § "Locks…" (relay 11 bullets) and § "Port design (relay 11)". One slip: the cost-ledger file rode along in c19c1a27 (a docs commit), not rewritten.

## 6. State

- Branch `claude/origami-volume-c79y3i`, draft PR https://github.com/vzakharov/vovazakharov.com/pull/253 (open, mergeable at start; title and body still describe the basilisk and the solver). Head a73a5742 before this summary's commit.
- Plan: `docs/plans/origami-tardigrade.paused.md`; `## Left` item 0 "Where it paused (relay 11)" carries the next steps.
- Port commits: f01254e5, 57bd9edc, 331d6ee7, 3e245080, 6761b778, c93f72e9; 37 fold tests pass, typecheck clean.
- Nothing running: all subagents finished; no CI, no PR subscription; the keepalive stops with this session.
- Estimate: this session 4 h senior developer ("diagnosing the tuck and step-5 jams down to solver reactions, then porting contact, simulator and sequence into src byte-identically with tests, is numerical code a senior must reason about") + 0.5 h senior producer ("briefing and sequencing parallel prototype and port agents, and merging their findings into the plan, is running a small team"). Remainder handed on: 2 h senior developer ("the flatFold covering-layer check, the hand's duration as an option, and wiring the face-maw design through relaxSequence into the site with tests is numerical code a senior must reason about") + 1 h senior designer ("settling the tucked face-maw into a Basilisk head by render and eye is a designer's judgement").
- The muthur sync offer was made; do not make it again.

## 7. Pointers

- `docs/plans/origami-tardigrade.paused.md` — § "Locks…", § "Port design (relay 11)" with the port record, `## Left`.
- `src/origami/shared/fold/` — `sequence.ts` (`relaxSequence`), `hand.ts`, `pose.ts`, `simulator.ts`, `contact.ts` + `proximity/edge-points/friction/crossings.ts`; ring fixtures `ring-{tuck,plain}.steps.json`.
- `docs/remove-before-merging/origami-volume-c79y3i/prototype/`: `seq-tuck/` (ring rounds 1–2), `seq-hand/` (the hand; `maw5-hand.png`, `ring-tuck-hand.png`; its `seq.ts`/`sim.ts`/`contact.ts` are the prototype engine with `HAND_UNTIL`), `seq-maw/` (`mawt.steps.json` — the face-maw with tucks; `pass.ts`; `best.sh`; `maw-tucked-final.png`, `maw-tucked-step12.png`).
- To rerun the prototype: as relay 10 § 7, with `seq-hand/*.txt` as `tmp/tg/seq/`; best face-maw settings `FRICTION=0.5 STEP_FRICTION=0 WAY=1 OPEN=0.5 EDGE_POINTS=3 EDGE_SET=outline HAND=50 HAND_UNTIL=12000 RAMP_STEP=6000 STEP_IT=12000`.
- This session: https://claude.ai/code/session_01DaohkCVE8XAG3T9ESkhqCV

## 8. Next step

Resume the paused plan (`/go` Step 1's `*.paused.md` case) on `## Left` item 0 "Where it paused (relay 11)": the `flatFold` covering-layer check and the hand's duration as an option in `src/`, fold `mawt.steps.json` through `relaxSequence` and match the prototype, then show the operator the tucked face-maw and settle whether it reads as the Basilisk's head («Может, это будет голова Василиска?»), then the design into `src/`, `/polish`, `/pr`. Still unanswered, each carrying the agent's call: nested creases as touching; ~5% strain at the nested pocket corner; whether the operator would rather be asked before a budget relay.

## Last agent turn

The agent's last turn before the relay, verbatim, appended by
`scripts/relay-last-reply.py`. It includes the turn's interim messages, usually
unneeded but harmless; the reply proper is usually its last paragraphs.

```text
Вова, перенос в `src/` закончен и запушен. Складывание по шагам вызывается одной функцией `relaxSequence`. На полной сетке она повторяет прототип: кольцо с замком остаётся замкнутым, щель 0.153, один прорыв, растяжение 5.02%. Кольцо без замка раскрывается до 0.855. Все 37 тестов проходят, типы чистые. Коммиты 6761b778 и c93f72e9, сводка лежит в плане (198b8209).

**Что вышло не так, как планировал.**
- **Тест кольца на полной сетке.** Я хотел ускорить его грубой сеткой, но на грубой клапан проходит сквозь крышку. Поэтому тест кольца идёт на полной сетке, весь набор тестов складок занимает около 28 секунд.
- **Файл `mesh.ts`** разросся до 479 строк, а ориентир в правилах репо примерно 450. Ошибки линтера в нём были ещё до этой ветки.

Жду подагента по шагу 8 «пасти». Его результаты лежат только в песочнице, а она пропадёт вместе с контейнером, поэтому сначала их сохраню. Потом передам работу свежей сессии, контекст на исходе.
```
