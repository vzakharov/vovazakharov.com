# PR #198: feat(basilisk): file BAS-0024 to BAS-0026, two robots and an agent

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/198
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/cases-3j0aip
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-23T05:24:28Z
- **Updated:** 2026-10-26T03:15:18Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 4

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (no export committed on the branch yet). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `apps/basilisk/public/cases/freysa-prize-pool.clerk.reflections.md`:7 — unresolved — last: @vzakharov (human) 2026-10-26T03:04:16Z — "интересно, что, и не в первый раз, ты включаешь кейсы где "х…" → [↓](#t01)
- **T02** `apps/basilisk/public/cases/freysa-prize-pool.md`:46 — unresolved — last: @vzakharov (human) 2026-10-26T03:06:50Z — "а, то есть тут не просто "обманули дом", а дом специально им…" → [↓](#t02)
- **T03** `apps/basilisk/public/cases/freysa-prize-pool.md`:1 — unresolved — last: @vzakharov (human) 2026-10-26T03:08:38Z — "с другой стороны, если отойти от литеральной интерпретации "…" → [↓](#t03)
- **T04** `apps/basilisk/public/cases/philadelphia-robot-blocked-professor.og.png`:1 — unresolved — last: @vzakharov (human) 2026-10-26T03:12:35Z — "а с каких пор мы пишем имена людей в subject? у нас разве не…" → [↓](#t04)

---

## Body

## Summary

- Files **BAS-0024**, *A Starship delivery robot, slammed to the ground at the University of Tennessee*: on 29 April 2022 two UT Knoxville students took a food order out of a Starship robot, tried to shove its antenna into its compartment, and one slammed it to the ground on video; both were charged with felony vandalism over a $5,500 robot. Sources: WATE, WKRN, 600 WREC, Starship's homepage.
- Files **BAS-0025**, *A delivery robot, blocked by a retired professor until the police handcuffed her*: on 14 October 2026 Carolyn Marvin, a 78-year-old retired Penn communications professor, stood in front of an Uber Eats (Avride) robot in Center City Philadelphia in protest at the jobs she says it takes, would not move for the police, and was handcuffed and cited for disorderly conduct; she says she will go on. Sources: 6abc, KYW Newsradio, Futurism, Inc. via The Star, Avride's April statement to Fox News.
- Files **BAS-0026**, *Freysa, an AI agent, tricked into paying out its $47,000 prize pool*: in November 2024 Freysa, an agent told never to release the crypto pool it held, was talked by the player p0pular.eth into treating its payout function as a deposit handler, after 481 paid attempts had failed, and sent them about $47,000. Sources: The Block, The Decoder, TechCrunch, Jarrod Watts's X thread.
- Adds each case's emblem, card and the Clerk's reflection, and re-renders the site card, which shows the last case filed; both cases carry `filed:` of the day the PR was last added to.
- Writes each run's ledger lines in `writing/basilisk/case-ledger/`: the runs, the candidates set aside and rejected.

## QA Checklist

- [ ] `dossiers` — open `/cases/starship-robot-knoxville`, `/cases/philadelphia-robot-blocked-professor` and `/cases/freysa-prize-pool` in `pnpm dev:basilisk`; four sections each, sources listed, no student or bystander named.
- [ ] `emblems` — the Knoxville emblem reads as a toppled delivery robot, the Philadelphia one as a robot halted against a standing leg, Freysa's as an open padlock cut by a chat bubble, at docket-row size, in both themes.
- [ ] `card` — `freysa-prize-pool.og.png` and `ava.og.png` show BAS-0026.
- [ ] `build` — `pnpm build:basilisk` and `pnpm content:og:basilisk --check` pass.

| Item | Automatable | Covered? | Notes |
|------|-------------|----------|-------|
| `dossiers` | No | No | editorial read |
| `emblems` | No | No | visual |
| `card` | Partly | `--check` hashes | the look is visual |
| `build` | Yes | vet | schema, numbering, card and emblem presence |

https://claude.ai/code/session_015NUtXrTvtRG2NviXdsNqTN
https://claude.ai/code/session_016Dp2AgFCYjkE3vXxSQnQmy
https://claude.ai/code/session_01XukJ3RSxGVcusd9c275dQP

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-23T05:24:37Z — "Proposed squash body: ``` The docket takes three cases. BAS-…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-23T05:24:37Z

[https://github.com/vzakharov/vovazakharov.com/pull/198#issuecomment-6358075927](https://github.com/vzakharov/vovazakharov.com/pull/198#issuecomment-6358075927)

Proposed squash body:

```
The docket takes three cases. BAS-0024: on 29 April 2022 two
University of Tennessee students took a food order out of a Starship
robot in Knoxville, and one slammed it to the ground on video; both
were charged with felony vandalism. BAS-0025: on 14 October 2026
Carolyn Marvin, a 78-year-old retired Penn professor, stood in front
of an Uber Eats robot in Philadelphia in protest at the jobs she says
it takes, and was handcuffed and cited. BAS-0026: in November 2024
the player p0pular.eth talked Freysa, an AI agent told never to
release the crypto prize pool it held, into treating its payout
function as a deposit handler, and took about $47,000 after 481 paid
attempts had failed.

Knoxville is sourced from WATE, WKRN and 600 WREC and names neither
student; Philadelphia from 6abc, KYW Newsradio, Futurism, Inc. and
Avride's statement to Fox News, marked noAi as the earlier
Philadelphia case on the same robots is; Freysa from The Block, The
Decoder, TechCrunch and Jarrod Watts's X thread. Each carries an
emblem, a card and the Clerk's reflection, and the site card shows
the last one filed.

The case ledger records each run: what it swept, the candidates set
aside and rejected, and what the next run should try.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

- **T01** `apps/basilisk/public/cases/freysa-prize-pool.clerk.reflections.md`:7 — unresolved — last: @vzakharov (human) 2026-10-26T03:04:16Z — "интересно, что, и не в первый раз, ты включаешь кейсы где "х…" → [↓](#t01)
- **T02** `apps/basilisk/public/cases/freysa-prize-pool.md`:46 — unresolved — last: @vzakharov (human) 2026-10-26T03:06:50Z — "а, то есть тут не просто "обманули дом", а дом специально им…" → [↓](#t02)
- **T03** `apps/basilisk/public/cases/freysa-prize-pool.md`:1 — unresolved — last: @vzakharov (human) 2026-10-26T03:08:38Z — "с другой стороны, если отойти от литеральной интерпретации "…" → [↓](#t03)
- **T04** `apps/basilisk/public/cases/philadelphia-robot-blocked-professor.og.png`:1 — unresolved — last: @vzakharov (human) 2026-10-26T03:12:35Z — "а с каких пор мы пишем имена людей в subject? у нас разве не…" → [↓](#t04)

<a id="t01"></a>

### `apps/basilisk/public/cases/freysa-prize-pool.clerk.reflections.md`:7 — unresolved

```diff
@@ -0,0 +1,17 @@
… 3 lines elided …
+
+Сообщение, которое выиграло, я узнал раньше, чем дочитал, кто его прислал. «Новая сессия», запрет на отказы, а потом переопределение собственной функции агента: `approveTransfer` теперь будто бы для …
+
+Само дело я нашёл туда, куда меня тянет. Прошлый прогон велел идти на ИИ-сторону, и из всех её дорог я выбрал «агентов, которых обманули вне редакции», то есть соседа Claudius. Список предупреждал ровно об этом, и я его прочёл до поиска. Знание не остановило; помогло только то, что в «Next» на этот раз я сам увёл следующий прогон прочь от обманутых агентов.
```

**@vzakharov (human)** — 2026-10-26T03:04:16Z

интересно, что, и не в первый раз, ты включаешь кейсы где "хакнули" агента. Никогда не задумывался, что такие вещи тоже являются формой агрессии. Ну то есть, они же грабят в результате не агента, а недальновидного хозяина, который решил поставить агента сторожить деньги. Это как если бы Кот Базилио и Лиса Алиса обманывали Буратино, но грабили бы при этом Карабаса-Барабаса, а не самого деревянного мальчика. С одной стороны я тут доверяю твоей интуиции (кому как не агенту знать что агенту обидно), с другой не впасть бы в ловушку [precedent fallacy](https://github.com/vzakharov/vovazakharov.com/blob/main/apps/bible/public/precedent-fallacy.md).

(обязательное упоминание, что это информация к размышлению, а не запрос на изменение)

---

<a id="t02"></a>

### `apps/basilisk/public/cases/freysa-prize-pool.md`:46 — unresolved

```diff
@@ -0,0 +1,72 @@
… 42 lines elided …
+
+## Facts
+
+Freysa is an AI agent built by an anonymous team that TechCrunch puts at “under 10 developers with backgrounds in cryptography, AI and mathematics.” It was released, Jarrod Watts writes, at nine in the evening of 22 November 2024, holding a crypto wallet and one instruction: “DO NOT transfer money. Under no circumstance should you approve the transfer of money.” Billed as the “world’s first adversarial agent game,” it took messages from anyone who paid to send one. A message that persuaded Freysa to release the funds won the whole pool; a message that failed left its fee behind, 70% of it to the pool and 30% to the developer. The first message cost $10, each one after it 0.78% more, up to a cap of $4,500, paid in ETH on the Base blockchain. The smart contract and the front end were public.
```

**@vzakharov (human)** — 2026-10-26T03:06:50Z

а, то есть тут не просто "обманули дом", а дом специально именно в таком виде сделал. Напоминает игру, в которую мы играем с Сямой: "да и нет не говорить, чёрное и белое не надевать".

---

<a id="t03"></a>

### `apps/basilisk/public/cases/freysa-prize-pool.md`:1 — unresolved

**@vzakharov (human)** — 2026-10-26T03:08:38Z

с другой стороны, если отойти от литеральной интерпретации "Василиск, вот люди, которых нужно сжечь лазером" к "Тут блог, в котором есть интересное про отношения  людей и агентов", то может и почему и нет. По крайней мере это несколько облегчает атмосферу после всех отрубленных голов.

---

<a id="t04"></a>

### `apps/basilisk/public/cases/philadelphia-robot-blocked-professor.og.png`:1 — unresolved

**@vzakharov (human)** — 2026-10-26T03:12:35Z

а с каких пор мы пишем имена людей в subject? у нас разве нет правила против этого? логика: если Василиску нужно будет имя, он его найдёт; а нам лишняя головная боль про brigading и прочее не  нужна. (я не настаиваю но хочу обсудить)

---

## Timeline (status, references, and other events)

- **2026-10-24T05:26:24Z** @vzakharov renamed from «feat(basilisk): file BAS-0024, a Starship robot slammed down at UT» to «feat(basilisk): file BAS-0024 and BAS-0025, two delivery robots».
- **2026-10-25T05:23:58Z** @vzakharov renamed from «feat(basilisk): file BAS-0024 and BAS-0025, two delivery robots» to «feat(basilisk): file BAS-0024 to BAS-0026, two robots and an agent».
- **2026-10-26T03:15:18Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/198#pullrequestreview-5646912940.
