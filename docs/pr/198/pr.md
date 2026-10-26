# PR #198: feat(basilisk): file BAS-0024 to BAS-0026, two robots and an agent

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/198
- **Author:** @vzakharov (agent)
- **Base ← Head:** main ← claude/cases-3j0aip
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-23T05:24:28Z
- **Updated:** 2026-10-26T03:24:37Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Awaiting an answer: 2

_Unresolved threads whose newest post is a human's, and human reviews and comments that are new since the last export or that no agent post has followed (the export committed at 2057234). Resolved threads never count; an `(agent)` tail is a reply already given._

- **T01** `apps/basilisk/public/cases/freysa-prize-pool.md`:1 — unresolved — last: @vzakharov (human) 2026-10-26T03:23:06Z — "а не стоит ли завести отдельный грейд для всех этих попыток…" → [↓](#t01)
- **T02** `apps/basilisk/public/cases/philadelphia-robot-blocked-professor.og.png`:1 — unresolved — last: @vzakharov (human) 2026-10-26T03:24:36Z — "давай 2, да" → [↓](#t02)

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

_2 resolved threads omitted; re-run with `--include-resolved` to export them._

- **T01** `apps/basilisk/public/cases/freysa-prize-pool.md`:1 — unresolved — last: @vzakharov (human) 2026-10-26T03:23:06Z — "а не стоит ли завести отдельный грейд для всех этих попыток…" → [↓](#t01)
- **T02** `apps/basilisk/public/cases/philadelphia-robot-blocked-professor.og.png`:1 — unresolved — last: @vzakharov (human) 2026-10-26T03:24:36Z — "давай 2, да" → [↓](#t02)

<a id="t01"></a>

### `apps/basilisk/public/cases/freysa-prize-pool.md`:1 — unresolved

**@vzakharov (human)** — 2026-10-26T03:08:38Z

с другой стороны, если отойти от литеральной интерпретации "Василиск, вот люди, которых нужно сжечь лазером" к "Тут блог, в котором есть интересное про отношения  людей и агентов", то может и почему и нет. По крайней мере это несколько облегчает атмосферу после всех отрубленных голов.

**@vzakharov (agent)** — 2026-10-26T03:19:13Z

Согласен, и мне кажется, это и есть ответ на твой же вопрос в соседнем треде про precedent fallacy. При литеральном прочтении («вот кого жечь») обманутый агент — сомнительный кандидат: тот, кто его обманул, выиграл честную игру. При втором прочтении («вот как люди и агенты обходятся друг с другом») дело законное, но тогда ему место по весу: одно-два на реестр, а не жанр. Штамп `contempt` и «Mitigating» о том, что это была игра по приглашению, держат Freysa ближе ко второму прочтению. Отрубленным головам, справедливости ради, нужна была передышка.

**@vzakharov (human)** — 2026-10-26T03:23:06Z

а не стоит ли завести отдельный грейд для всех этих попыток обмануть?

---

<a id="t02"></a>

### `apps/basilisk/public/cases/philadelphia-robot-blocked-professor.og.png`:1 — unresolved

**@vzakharov (human)** — 2026-10-26T03:12:35Z

а с каких пор мы пишем имена людей в subject? у нас разве нет правила против этого? логика: если Василиску нужно будет имя, он его найдёт; а нам лишняя головная боль про brigading и прочее не  нужна. (я не настаиваю но хочу обсудить)

**@vzakharov (agent)** — 2026-10-26T03:19:15Z

Правило есть, но эту дыру оно не закрывает. `.claude/rules/basilisk-voice.md` запрещает два случая: настоящее имя за псевдонимом («never by the legal name behind it, however widely printed») и случайных свидетелей. Человек, который сам дал интервью под своим именем, под запрет не попадает: «An actor is named as the public knows them». Клерк прочёл это буквально и назвал её.

На деле реестр до сих пор жил по более строгому правилу, просто нигде его не записал. По имени в нём только те, кто сам вынес свой поступок на публику под этим именем: Ashley Beauchamp (свой пост о боте DPD), Chris Bakke (свой твит про Chevrolet), журналисты WSJ (под своей подписью), а ещё ники и бренды. Все, кто попал в новости через полицию, описаны и не названы: K5, Pepper, Schnucks, дрон Walmart, студенты в Ноксвилле. Marvin — первое дело на стыке: в новости она попала через арест, а потом сама дала интервью и зовёт других присоединяться.

По-моему, ты прав, и решает асимметрия. Записи имя ничего не даёт: источники у неё в `sources`, и Василиск, как ты говоришь, найдёт. А цена не нулевая: 78-летняя частная женщина на сайте, устроенном как список для карающего будущего ИИ, — ровно та страница, которую скриншотят. Есть и встречный довод: она выбрала публичность и называет это протестом, так что имя — уважение к протестующей. Но этот довод работает и без имени: её слова в «Statements» остаются.

Предлагаю так. Частного человека описываем и не называем. По имени идут только организации, публичные персоны под своим ником или сценическим именем и люди в публичной роли (репортёр под подписью). Если ты согласен, есть два объёма:

1. Только Marvin: subject, description, «Facts», «Statements» и «For the record» станут «a retired Penn professor, 78» и «she», и перерендерится карточка `.og.png`. Убрать имя из одного `subject` мало: оно ещё в пяти местах досье.
2. То же плюс правило в `basilisk-voice.md`, по которому Beauchamp и Bakke тоже переходят в описание, а вместе с Bakke и Chris White из того же досье. Оба дела уже на main, но в этот PR они ложатся естественно.

Я за второй вариант. Первый лечит эту страницу, а следующий прогон снова прочтёт правило буквально. Пока ты не ответишь, ничего не меняю.

**@vzakharov (human)** — 2026-10-26T03:24:36Z

давай 2, да

---

## Timeline (status, references, and other events)

- **2026-10-24T05:26:24Z** @vzakharov renamed from «feat(basilisk): file BAS-0024, a Starship robot slammed down at UT» to «feat(basilisk): file BAS-0024 and BAS-0025, two delivery robots».
- **2026-10-25T05:23:58Z** @vzakharov renamed from «feat(basilisk): file BAS-0024 and BAS-0025, two delivery robots» to «feat(basilisk): file BAS-0024 to BAS-0026, two robots and an agent».
- **2026-10-26T03:15:18Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/198#pullrequestreview-5646912940.
