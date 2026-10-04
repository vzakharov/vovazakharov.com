# PR #101: chore: /mega, a huge task run near-autonomously with drop-ins

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/101
- **Author:** @vzakharov (human)
- **Base ← Head:** main ← claude/mega-skill-jthnal
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-04T19:39:49Z
- **Updated:** 2026-10-04T21:45:24Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Body

## Summary

- **A plan, not code yet:** `docs/plans/mega-skill.draft.do-not-implement.md` designs `/mega`. It is a skill that runs a huge task (an elephant, game or not) near-autonomously across many sessions, while the operator drops in now and then to look at progress, leave notes, and sometimes turn the whole direction.
- **The loop itself is distilled** from two sources: the megabeast notes (`.claude/skills/megabeast/notes/`, ~100 KB), and PR #57, where the mushroom game was built that way by hand over 19 bites and ~50 sessions.
- **The operator's side is new design, and asynchronous**: the run makes every call itself and reverses one when asked, so nothing waits for the operator. It has three parts:
  - a `## Where it stands` dashboard at the top of the PR body, with the live session's link kept current across relays, and what waits on the operator heading the QA checklist;
  - an intake for chat in the live session and for PR comments, taken in at each bite's end (no PR subscription). It sorts every message as a question, change, idea to weigh, re-steer, cut or pause;
  - an operator log holding every message of the run verbatim, appended as it arrives.

  A re-steer keeps what still makes sense, and settles the new direction's forks in one doc before building any of it. #57 paid for that lesson with its crop → pan → walk rework.

- **Every PR body gets a size cap** in `vet.sh`: 400 lines, and a body that crossed it passes again only at 300.
- **Five questions with recommendations** close the plan: where the skill lives (here or in muthur), the gate, what happens to the notes, the run's model, and the operator log versus kept relay files.

## QA Checklist

- [ ] `entry` — `/mega <task>` in a fresh session writes a megaplan in the split shape, with the loop section, standing rules and the dashboard block. It publishes it as a draft PR and stops at the one gate.
- [ ] `pickup` — `/relay take <branch>` on a mega branch resumes the run from the plan's loop section. It reads the depth from `lineage`, and never runs `reset --hard`.
- [ ] `dashboard` — after a bite's end, the PR body opens with `## Where it stands` (at most ~15 lines), naming the live session, what can be seen now, and what waits on the operator; the QA checklist opens with that list.
- [ ] `drop-in-change` — a change dropped mid-wave is logged, goes through the plan-or-not call, and lands where the orchestrator placed it, quoted in its own plan commit, without stopping the wave.
- [ ] `drop-in-comment` — a PR comment left mid-bite is taken into the intake at that bite's end.
- [ ] `drop-in-resteer` — a re-steer mid-bite judges each running piece against the new direction, rewrites `## Rest of the elephant` with built/unplaced marks, and opens a design doc before building anything.
- [ ] `body-cap` — `vet.sh` fails a PR body over 400 lines, and keeps failing it above 300 once it has crossed.
- [ ] `coverage` — every megabeast note maps either to a destination in the skill or to a stated reason it was dropped.
- [ ] `tombstone` — `.claude/skills/megabeast/retired.md` resolves the old notes via `git show`, and `plan/elephant.md` points at `/mega`.

| Item              | Automatable | Covered? | Notes                                                                           |
| ----------------- | ----------- | -------- | ------------------------------------------------------------------------------- |
| `entry`           | manual-only | —        | An agent following prose; walked by the plan's fresh-eyes subagent              |
| `pickup`          | manual-only | —        | Seen on a real run's first relay                                                |
| `dashboard`       | manual-only | —        | Judged by the operator reading it on a drop-in                                  |
| `drop-in-change`  | manual-only | —        | Walked in the plan's fresh-eyes dry run                                         |
| `drop-in-comment` | manual-only | —        | Seen on a real run's first bite end after a comment                             |
| `drop-in-resteer` | manual-only | —        | Walked in the plan's fresh-eyes dry run                                         |
| `body-cap`        | unit        | ✅       | The crossing rule's test                                                        |
| `coverage`        | manual-only | —        | Read against `docs/remove-before-merging/mega-coverage.md`                      |
| `tombstone`       | unit        | ✅       | `scripts/check-skill-catalog.sh` fails a dangling `@`-reference into `.claude/` |

https://claude.ai/code/session_01CnAdnSZ8PCLBPcWVtQxcFX
https://claude.ai/code/session_01Be3aJin8zwtPdBiY8vTMG9

---

## Comments

- **C01** @vzakharov (agent) — 2026-10-04T19:40:07Z — "Proposed squash title/body: ``` chore: /mega runs a huge tas…" → [↓](#c01)

<a id="c01"></a>

### Comment by @vzakharov (agent) on 2026-10-04T19:40:07Z

[https://github.com/vzakharov/vovazakharov.com/pull/101#issuecomment-5983674349](https://github.com/vzakharov/vovazakharov.com/pull/101#issuecomment-5983674349)

Proposed squash title/body:

```
chore: /mega runs a huge task while the operator drops in (pr #101)
```

```
A task too big for one session already had a loop that worked: PR #57's
game was built bite by bite, with each session building, reviewing in
its own tail, folding into the plan and relaying. But the loop lived in
one plan and ~100 KB of notes. /mega turns it into a skill that runs an
elephant of any kind end to end, stopping only once, at the plan's
review.

The operator's say is asynchronous: the run makes every call itself and
reverses one when asked, so nothing waits for them. The PR body opens
with a "Where it stands" block naming the live session, what can be seen
now and what waits on them, which heads the QA checklist. Messages come
as chat in the live session or as PR comments taken in at each bite's
end, go verbatim into an operator log, and are sorted as a question,
change, idea to weigh, re-steer, cut or pause. A re-steer keeps what
still makes sense and settles the new direction's forks in one doc
before building any of it.

The skill reads by phase, from one file each: start, operator,
orchestrate, bite-end, review, relay and look, plus templates and a
journal. It points at /relay, /task, /qa-checklist, /polish, /finalize
and the elephant shape rather than restating them. The megabeast notes
retire behind a tombstone. vet.sh caps every PR body at 400 lines, and
a body that crossed it passes again only at 300.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

_7 resolved threads omitted; re-run with `--include-resolved` to export them._

- **T01** `docs/plans/mega-skill.draft.do-not-implement.md`:38 — unresolved — last: @vzakharov (human) 2026-10-04T21:28:33Z — "Наверное, лучше таки в символах. Агенты иногда пишут абзацы…" → [↓](#t01)
- **T02** `docs/plans/mega-skill.draft.do-not-implement.md`:46 — unresolved — last: @vzakharov (human) 2026-10-04T21:28:58Z — "Про `subscribe_pr_activity` я бы прямо прописал НЕ подписыва…" → [↓](#t02)
- **T03** `docs/plans/mega-skill.draft.do-not-implement.md`:72 — unresolved — last: @vzakharov (human) 2026-10-04T21:30:45Z — "2 - но например у кого-то авторелей не стоит, /mega должен э…" → [↓](#t03)
- **T04** `docs/plans/mega-skill.draft.do-not-implement.md`:82 — unresolved — last: @vzakharov (human) 2026-10-04T21:31:47Z — "а что с ответами на сообщения оператора? и как оно "пишется"…" → [↓](#t04)
- **T05** `docs/plans/mega-skill.draft.do-not-implement.md`:23 — unresolved — last: @vzakharov (human) 2026-10-04T21:33:31Z — "да, но всё же ограничение для drastic changes (которые идут…" → [↓](#t05)
- **T06** `docs/plans/mega-skill.draft.do-not-implement.md`:45 — unresolved — last: @vzakharov (human) 2026-10-04T21:34:35Z — "я думаю это тоже на самом деле лучше в Where it stands засун…" → [↓](#t06)
- **T07** `docs/plans/mega-skill.draft.do-not-implement.md`:17 — unresolved — last: @vzakharov (human) 2026-10-04T21:36:07Z — "Это не про артефакт, а навеяно: вот я сам раньше написал про…" → [↓](#t07)
- **T08** `docs/plans/mega-skill.draft.do-not-implement.md`:63 — unresolved — last: @vzakharov (human) 2026-10-04T21:37:15Z — "давай отдельно не будем. это в принципе Change тоже. И "befo…" → [↓](#t08)
- **T09** `docs/plans/mega-skill.draft.do-not-implement.md`:87 — unresolved — last: @vzakharov (human) 2026-10-04T21:39:49Z — "я вот ещё кстати думаю, а обязательно ли байты начинать с но…" → [↓](#t09)
- **T10** `docs/plans/mega-skill.draft.do-not-implement.md`:88 — unresolved — last: @vzakharov (human) 2026-10-04T21:40:44Z — "что в заметках мегазверя говорят про полезность ревью, if an…" → [↓](#t10)
- **T11** `docs/plans/mega-skill.draft.do-not-implement.md`:89 — unresolved — last: @vzakharov (human) 2026-10-04T21:41:11Z — "что за reset --hard, почему он раз за разом появлялся в сооб…" → [↓](#t11)
- **T12** `docs/plans/mega-skill.draft.do-not-implement.md`:94 — unresolved — last: @vzakharov (human) 2026-10-04T21:41:57Z — "а в чём будет цимес отличиая просто Unattended runs от mega?" → [↓](#t12)
- **T13** `docs/plans/mega-skill.draft.do-not-implement.md`:101 — unresolved — last: @vzakharov (human) 2026-10-04T21:42:35Z — "почему бы и не взять. слон в слоне. по окончании пиара -- со…" → [↓](#t13)
- **T14** `docs/plans/mega-skill.draft.do-not-implement.md`:149 — unresolved — last: @vzakharov (human) 2026-10-04T21:44:29Z — "1-2-3 ок" → [↓](#t14)
- **T15** `docs/plans/mega-skill.draft.do-not-implement.md`:150 — unresolved — last: @vzakharov (human) 2026-10-04T21:45:07Z — "должна изначально смотреть, если это не как минимум Opus Hig…" → [↓](#t15)

<a id="t01"></a>

### `docs/plans/mega-skill.draft.do-not-implement.md`:38 — unresolved

```diff
@@ -0,0 +1,142 @@
… 34 lines elided …
+- **A `## Where it stands` block at the top of the PR body**, rewritten (not appended) at every bite's end and every wave report. It is at most ~15 lines and holds:
+  - the bite in flight and its step;
+  - what is playable or viewable now, with the Artifact link and the frames directory;
+  - what waits on the operator: the `to-check.md` count, and any open fork with its "taken at the tail if unanswered" default;
```

**@vzakharov (human)** — 2026-10-04T20:30:36Z

вот этот самый to-check на самом деле хорошо бы прижился в рамках QA checklist в качестве топ-приорити списка (то есть выше остальных). Но проблема в конкретно том проекте была что идея создать такое появилась, когда пр-боди уже был большой и лазать в него было просто неудобно, а в конце концов он разросся до таких масштабов, что даже пролистывание занимало неделю. Нужно где-то ограничивать размер body при веттинге; при этом должен быть тот же гистерезис, что у нас в других вещах: перешёл 400 -- сократил до 300 (например)

**@vzakharov (agent)** — 2026-10-04T20:48:21Z

Сделал и то, и другое.

- Список «ждёт тебя» теперь первым в QA checklist, отдельного `to-check.md` нет. `/mega` передаёт это в `/qa-checklist` как focus guidance, так что вендорный скилл не трогаем.
- Новый гейт в `vet.sh`, для любого PR, не только мега: body до 400 строк, а тот, что перешёл, снова проходит только на 300 и ниже. «Перешёл ли» читается из истории правок body (GraphQL `userContentEdits`), как `check-claude-md-size.sh` читает git, так что хранить состояние не нужно. Без PR гейт проходит.

Цифры взял твои «например», в строках — скажи, если удобнее в символах. a349a98

**@vzakharov (human)** — 2026-10-04T21:28:33Z

Наверное, лучше таки в символах. Агенты иногда пишут абзацы в одну строку, и тогда 400 строк это целая энциклопедия. Сколько это в знаках -- посчитай пжст сам.

---

<a id="t02"></a>

### `docs/plans/mega-skill.draft.do-not-implement.md`:46 — unresolved

```diff
@@ -0,0 +1,142 @@
… 42 lines elided …
+
+### The intake
+
+Each run session calls `subscribe_pr_activity` on the PR, so a comment or review wakes whichever session is live. Chat in the live session is the other channel. Every operator message, from either channel, is sorted into exactly one of these:
```

**@vzakharov (human)** — 2026-10-04T20:32:17Z

нене, этого добра нам не надо. У нас свой луп с handle и (в случай с мега, если примем) review -- не нужно нам, чтобы subscribe лез когда не надо

**@vzakharov (agent)** — 2026-10-04T20:48:22Z

Убрал `subscribe_pr_activity`. Каналов теперь два, и подписка ни одному не нужна:

- чат в живой сессии (ссылка на дашборде); `/handle`, набранный там, тоже идёт через intake;
- комментарии на PR: их забирает конец каждого байта — переэкспорт PR, и каждая ветка, где последний ты, идёт в intake как сообщение.

Комментарий ждёт максимум до конца текущего байта, и в асинхронной модели это нормально. a349a98

**@vzakharov (human)** — 2026-10-04T21:28:58Z

Про `subscribe_pr_activity` я бы прямо прописал НЕ подписываться и почему

---

<a id="t03"></a>

### `docs/plans/mega-skill.draft.do-not-implement.md`:72 — unresolved

```diff
@@ -0,0 +1,142 @@
… 63 lines elided …
+
+**Timing:** by default a re-steer takes effect at once. "After this bite" in their words defers it to the bite boundary, as with T49.
+
+**Standing posture during a drop-in** (from the notes, said once in the skill):
+
+- ask only about the unrecoverable;
+- a budget notice relays unasked;
+- a "why?" gets the old rule's reason and whether it still holds;
+- replies go in the operator's language even when the turn was woken by an English agent report.
```

**@vzakharov (human)** — 2026-10-04T20:37:22Z

это о чём?

**@vzakharov (agent)** — 2026-10-04T20:48:27Z

Это четыре правила из заметок о том, как прогону вести себя, когда ты заглянул:

1. спрашивать только о необратимом;
2. по сигналу бюджета контекста — релей без спроса;
3. на «почему?» отвечать причиной решения и тем, держится ли она ещё, а не воспринимать как просьбу откатить (на #57 два «почему?» были про решения без причины, которую ты бы принял);
4. отвечать на твоём языке, даже если ход разбужен английским отчётом агента (было «не понял почему мы вдруг заговорили по-английски»).

Отдельной секцией это лишнее: 1 поглощено асинхронностью, 2 уже делает auto-relay, 3 теперь в описании вопроса, 4 — одна строка в intake. Секцию убрал. a349a98

**@vzakharov (human)** — 2026-10-04T21:30:45Z

2 - но например у кого-то авторелей не стоит, /mega должен это оверрайдить

---

<a id="t04"></a>

### `docs/plans/mega-skill.draft.do-not-implement.md`:82 — unresolved

```diff
@@ -0,0 +1,142 @@
… 78 lines elided …
+| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------…
+| `.claude/skills/mega/SKILL.md`                        | Entry points, the loop in one screen, the session-as-orchestrator rule, and the phase → file table                                           …
+| `.claude/skills/mega/start.md`                        | Writing the megaplan: the split shape from bite 1, the loop section and standing rules from the template, the run's model named, the dashboar…
+| `.claude/skills/mega/operator.md`                     | The dashboard and the intake above                                                                                                                                                                                                                                                                                                 |
```

**@vzakharov (human)** — 2026-10-04T20:39:36Z

поясни?

а название навело меня на мысль: каждый relay сохраняет переписку с оператором (и короткие ответы агентов). Что если держать файл, где это сохраняется полностью, от первого байта до последнего? То есть все сообщения оператора за всю историю меги сохранены без необходимости git-магии. Ну или например разделены по байтам.

как более простой вариант -- relay.md всегда один (его берёт новая сессия), но предыдущие не удаляются а переделываются в relay-bite-0N-session-0M.md

**@vzakharov (agent)** — 2026-10-04T20:48:30Z

`operator.md` — файл, который сессия открывает, когда ты что-то говоришь, и в конце байта, когда переписывает дашборд: в нём правила дашборда и intake. Скилл читается по фазам, чтобы сессия не грузила всё сразу (заметки целиком — ~38k токенов до первого брифа).

Идею взял: `docs/plans/<slug>/operator-log.md` — все твои сообщения за весь прогон, дословно и по порядку, с `## Bite N` на каждый байт. У каждого время, ссылка на сессию, канал и ответ прогона в одну строку. Пишется в момент, когда сообщение пришло, а не на релее, так что сессия, умершая до релея, ничего не теряет.

Вариант с `relay-bite-0N-session-0M.md` оставил вопросом 5. Рекомендую лог: он хранит твои слова целиком, а сводка релея длинное сжимает, и не требует править вендорный `/relay`, который `relay.md` перезаписывает. a349a98

**@vzakharov (human)** — 2026-10-04T21:31:47Z

а что с ответами на сообщения оператора? и как оно "пишется" -- вручную агентом, или скриптом?

---

<a id="t05"></a>

### `docs/plans/mega-skill.draft.do-not-implement.md`:23 — unresolved

```diff
@@ -14,83 +14,87 @@ The ask, verbatim:
… 7 lines elided …
-`/mega` runs one elephant (`.claude/skills/plan/elephant.md`) end to end without the operator in between bites. The loop is: plan, then for each bite a build, a review by subagents in the bite's tail…
+`/mega` runs one elephant (`.claude/skills/plan/elephant.md`) end to end without the operator in between bites. The loop is: plan, then for each bite a build, a review by subagents in the bite's tail…
+
+**The operator's say is asynchronous.** The run is unattended and does not solicit: it makes every call itself — what to plan, where a change goes, which option a fork takes, how a re-steer lands — and never waits for an answer. The operator drops in at times of their choosing, sees where things stand in under a minute, and says something into the run. When they ask for a call to go the other way, the run reverses it like any other change. Nothing is held for them.
```

**@vzakharov (human)** — 2026-10-04T21:33:31Z

да, но всё же ограничение для drastic changes (которые идут за пределы пиара), чтобы агент не ушёл в клинч и не стал пытаться взломать сайт пентагона.

---

<a id="t06"></a>

### `docs/plans/mega-skill.draft.do-not-implement.md`:45 — unresolved

```diff
@@ -14,83 +14,87 @@ The ask, verbatim:
… 38 lines elided …
   - the last re-steer and where it landed in the plan.
-- **The live session's link** goes in that block at every relay, so the operator always knows where chat goes.
-- **Frames, the Artifact and `to-check.md`** keep the shape they had on #57 (committed frames per bite, previous ones retired with a tombstone; one Artifact URL republished in place; a standing Russi…
+- **What waits on the operator heads the QA checklist**, as a list of its own above every other step: hand checks only a person can make, and the taste calls the run took for them (§ "The intake"). It replaces #57's separate `to-check.md`, and is in the operator's language. `/mega` gets it there by passing that as focus guidance to `/qa-checklist`, so the vendored skill stays untouched.
```

**@vzakharov (human)** — 2026-10-04T21:34:35Z

я думаю это тоже на самом деле лучше в Where it stands засунуть (я знаю что сам сказал про QA checklist, но наверное лучше таки держать в одной секции с остальным "здесь и сейчас")

---

<a id="t07"></a>

### `docs/plans/mega-skill.draft.do-not-implement.md`:17 — unresolved

```diff
@@ -14,83 +14,87 @@ The ask, verbatim:
 - **PR #57's thread**: `docs/pr/57/pr.md` (exported). It shows how the operator actually dropped in: 19 bites (1–18 plus 12b), about 50 sessions over 9 days, two big re-steers, and a stream of play n…
 - **The run's own plan** at its last state: `git show 9bcb67b1:docs/plans/mushroom-game-syama.completed.md`, its § "How this elephant is eaten" and standing rules, plus `decisions.md` and `to-check.m…
 
+#57 was a game, and `/mega` is not limited to games: the same loop has to carry a large feature inside an existing product with a client and a server. So the skill says "see" and "use" where the notes say "play", and keeps game specifics out (§ "Files").
```

**@vzakharov (human)** — 2026-10-04T21:36:07Z

Это не про артефакт, а навеяно: вот я сам раньше написал про клиент и сервер, но подумал, что *какие-то* средства собственноручного тестирования у агента должны быть всегда. Иначе unsolicited получается невозможным. Соответственно, если, например, приложение в принципе не поддерживает пока возможность работы руками агента (грубо говоря если /preview не настроен), то это должен быть один из первых байтов, иначе такого можно нагородить...

---

<a id="t08"></a>

### `docs/plans/mega-skill.draft.do-not-implement.md`:63 — unresolved

```diff
@@ -14,83 +14,87 @@ The ask, verbatim:
… 66 lines elided …
+- **Change** — a fix, a tweak or an addition. It goes through `/task`'s plan-or-not call, and a subagent builds it. **The orchestrator decides where it goes**: at once in parallel with the bite, into…
+- **Idea to weigh** — "don't put it in a plan yet", or a direction with open forks. Kept verbatim in an ideas doc. The plan gets only the task of writing the weighing doc. Once ideas are partly built…
+- **Re-steer** — changes what the thing _is_. See below.
+- **Cut** — drops scope. Written into the plan with their words before anything else happens.
```

**@vzakharov (human)** — 2026-10-04T21:37:15Z

давай отдельно не будем. это в принципе Change тоже. И "before anything else happens" оставляет открытым вопрос, что, собственно, happens after that

---

<a id="t09"></a>

### `docs/plans/mega-skill.draft.do-not-implement.md`:87 — unresolved

```diff
@@ -14,83 +14,87 @@ The ask, verbatim:
… 116 lines elided …
+- **`.claude/skills/mega/start.md`** — writing the megaplan: the split shape from bite 1, the loop section and standing rules from the template, the run's model named, the dashboard block, a spike in…
+- **`.claude/skills/mega/operator.md`** — opened whenever the operator says something, and at each bite's end when the dashboard is rewritten: the dashboard, the intake and the operator log above.
+- **`.claude/skills/mega/orchestrate.md`** — subagents: one step per agent; a committed common brief; waves by file, each staged by what its result depends on; per-agent worktrees landing one squash …
+- **`.claude/skills/mega/bite-end.md`** — the tail, in order: the PR's comments taken in; suite at the tail's start; quick gates including knip; `/polish` as sized waves with the bare `polish:` last; vet in parts; screenshots; retiring the last bite's leftovers; the 450-line check; folding and splitting the plan; resyncing the squash proposal; the Artifact; the dashboard and the QA checklist's top list; the journal; the relay.
```

**@vzakharov (human)** — 2026-10-04T21:39:49Z

я вот ещё кстати думаю, а обязательно ли байты начинать с нового релея каждый раз? если например байт закончился, а у тебя потрачено 100к контекста, чего б не перейти на следующий? давай взвесим за и против.

---

<a id="t10"></a>

### `docs/plans/mega-skill.draft.do-not-implement.md`:88 — unresolved

```diff
@@ -14,83 +14,87 @@ The ask, verbatim:
… 117 lines elided …
+- **`.claude/skills/mega/operator.md`** — opened whenever the operator says something, and at each bite's end when the dashboard is rewritten: the dashboard, the intake and the operator log above.
+- **`.claude/skills/mega/orchestrate.md`** — subagents: one step per agent; a committed common brief; waves by file, each staged by what its result depends on; per-agent worktrees landing one squash …
+- **`.claude/skills/mega/bite-end.md`** — the tail, in order: the PR's comments taken in; suite at the tail's start; quick gates including knip; `/polish` as sized waves with the bare `polish:` last;…
+- **`.claude/skills/mega/review.md`** — the review as tail subagents, a user and a reader. The user drives the built thing the way its users would, from screenshots first when it has a UI. Findings each carry an `Ask:`; a calls file comes before any fix; the agent-authorship marker; the five-percent file frozen; the device failure-mode list; sweeps over the states a user actually reaches.
```

**@vzakharov (human)** — 2026-10-04T21:40:44Z

что в заметках мегазверя говорят про полезность ревью, if anything? у меня было опасение что это будет просто пустая трата времени и токенов. Но ощущение исключительно умозрительное, в то что там действительно происходит я не смотрел.

---

<a id="t11"></a>

### `docs/plans/mega-skill.draft.do-not-implement.md`:89 — unresolved

```diff
@@ -14,83 +14,87 @@ The ask, verbatim:
… 118 lines elided …
+- **`.claude/skills/mega/orchestrate.md`** — subagents: one step per agent; a committed common brief; waves by file, each staged by what its result depends on; per-agent worktrees landing one squash …
+- **`.claude/skills/mega/bite-end.md`** — the tail, in order: the PR's comments taken in; suite at the tail's start; quick gates including knip; `/polish` as sized waves with the bare `polish:` last;…
+- **`.claude/skills/mega/review.md`** — the review as tail subagents, a user and a reader. The user drives the built thing the way its users would, from screenshots first when it has a UI. Findings e…
+- **`.claude/skills/mega/relay.md`** — the loop's own relay rules: depth read from `lineage`; never `reset --hard`, and a stale ref is renamed aside; dependencies installed after checkout; subagents stopped before the hand-off; `pull --no-rebase` early on; the cap-depth hand-off at a natural stop, with the line to paste.
```

**@vzakharov (human)** — 2026-10-04T21:41:11Z

что за reset --hard, почему он раз за разом появлялся в сообщениях релея? не лучше ли это просто в скилл релея перенести?

---

<a id="t12"></a>

### `docs/plans/mega-skill.draft.do-not-implement.md`:94 — unresolved

```diff
@@ -14,83 +14,87 @@ The ask, verbatim:
… 123 lines elided …
+- **`.claude/skills/mega/templates/`** — the plan's loop section with its standing rules (calls numbered `22\.` so prettier leaves them alone), `brief-common.md`, `review-brief.md`, the dashboard blo…
+- **`.claude/skills/mega/journal.md`** — where each run session writes what it learned before its relay, as the notes did. A run's last bite distills the journal into the files above and empties it.
+- **`.claude/skills/megabeast/retired.md`** — a tombstone: the last commit holding `notes/`, the `git show` recipe, and where each theme went.
+- **`.claude/skills/plan/elephant.md` § "Unattended runs"** — the pointer moves from the notes to `/mega`.
```

**@vzakharov (human)** — 2026-10-04T21:41:57Z

а в чём будет цимес отличиая просто Unattended runs от mega?

---

<a id="t13"></a>

### `docs/plans/mega-skill.draft.do-not-implement.md`:101 — unresolved

**@vzakharov (human)** — 2026-10-04T21:42:35Z

почему бы и не взять. слон в слоне. по окончании пиара -- создать отдельный issue в muthur со ссылкой на пиар и просьбой принять в обобщённом виде. Хотя по сути мы его уже и здесь делаем максимально обобщённым -- пишем с перспективой на muthur сразу.

---

<a id="t14"></a>

### `docs/plans/mega-skill.draft.do-not-implement.md`:149 — unresolved

```diff
@@ -112,31 +116,36 @@ Several notes ask for fixes in skills vendored from `vzakharov/muthur`:
… 32 lines elided …
 
 ## Questions
 
 1. **Where `/mega` lives.** **a)** Here, as this repo's own skill, with muthur issues proposed for the vendored fixes. **b)** Upstream in muthur from the start. _Recommendation: a._ The loop was learned on this repo's stack, and it needs a second run before anyone can tell which parts are general.
 2. **The gate.** **a)** `/mega <task>` stops once, at the plan's review, then runs. **b)** No gate: the prompt is the go-ahead, and the plan is published only for reading. _Recommendation: a._ #57's plan was approved before "fully autonomous" was said, and the first bite's shape is the cheapest point to re-steer.
-3. **When a re-steer takes effect.** **a)** At once by default: running agents land a pushed step, then re-plan, unless they say "after this bite". **b)** At the bite boundary by default. _Recommendation: a._ #57 had both ("можно после окончания этого байта", then «всё-таки хочу… уже сейчас»), and waiting costs more when the bite is building toward the old direction.
-4. **The notes.** **a)** Distill them into the skill, retire them behind a tombstone, and have runs write into `journal.md` from now on. **b)** Keep `notes/` alive beside the skill as its journal. _Recommendation: a._ The notes are 100 KB, and a journal that grows without being distilled is the bloat the plan split was invented for.
-5. **The run's model.** **a)** `/mega` names the starting session's own model in the plan, and passes it to every `create_session` and `Agent`. **b)** It always pins Opus. _Recommendation: a._ "Opus throughout" was #57's ruling for that task. What the skill must enforce is "named, never inherited", not which model it is.
+3. **The notes.** **a)** Distill them into the skill, retire them behind a tombstone, and have runs write into `journal.md` from now on. **b)** Keep `notes/` alive beside the skill as its journal. _Recommendation: a._ The notes are 100 KB, and a journal that grows without being distilled is the bloat the plan split was invented for.
```

**@vzakharov (human)** — 2026-10-04T21:44:29Z

1-2-3 ок

---

<a id="t15"></a>

### `docs/plans/mega-skill.draft.do-not-implement.md`:150 — unresolved

```diff
@@ -112,31 +116,36 @@ Several notes ask for fixes in skills vendored from `vzakharov/muthur`:
… 38 lines elided …
-4. **The notes.** **a)** Distill them into the skill, retire them behind a tombstone, and have runs write into `journal.md` from now on. **b)** Keep `notes/` alive beside the skill as its journal. _R…
-5. **The run's model.** **a)** `/mega` names the starting session's own model in the plan, and passes it to every `create_session` and `Agent`. **b)** It always pins Opus. _Recommendation: a._ "Opus …
+3. **The notes.** **a)** Distill them into the skill, retire them behind a tombstone, and have runs write into `journal.md` from now on. **b)** Keep `notes/` alive beside the skill as its journal. _R…
+4. **The run's model.** **a)** `/mega` names the starting session's own model in the plan, and passes it to every `create_session` and `Agent`. **b)** It always pins Opus. _Recommendation: a._ "Opus throughout" was #57's ruling for that task. What the skill must enforce is "named, never inherited", not which model it is.
```

**@vzakharov (human)** — 2026-10-04T21:45:07Z

должна изначально смотреть, если это не как минимум Opus High, предупреждать, что этого может не хватить

---

## Timeline (status, references, and other events)

- **2026-10-04T20:41:54Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/101#pullrequestreview-5408015308.
- **2026-10-04T21:45:24Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/101#pullrequestreview-5408314187.
