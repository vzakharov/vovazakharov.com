# PR #101: chore: /mega, a huge task run near-autonomously with drop-ins

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/101
- **Author:** @vzakharov (human)
- **Base ← Head:** main ← claude/mega-skill-jthnal
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-04T19:39:49Z
- **Updated:** 2026-10-04T22:02:42Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Body

## Summary

- **A plan, not code yet:** `docs/plans/mega-skill.draft.do-not-implement.md` designs `/mega`. It is a skill that runs a huge task (an elephant, game or not) near-autonomously across many sessions, while the operator drops in now and then to look at progress, leave notes, and sometimes turn the whole direction.
- **The loop itself is distilled** from two sources: the megabeast notes (`.claude/skills/megabeast/notes/`, ~100 KB), and PR #57, where the mushroom game was built that way by hand over 19 bites and ~50 sessions. A run goes on into the next bite while it has context left, and relays at the budget pause, always.
- **The operator's side is new design, and asynchronous**: the run makes every call itself and reverses one when asked, so nothing waits for the operator. Its reach ends at its own branch and PR: anything outside goes on the operator's list as the exact command, and so does a failure that survives three attempts. It has three parts:
  - a `## Where it stands` dashboard at the top of the PR body, with the live session's link kept current across relays, and the full list of what waits on the operator;
  - an intake for chat in the live session and for PR comments, taken in at each bite's end, never by subscribing to PR activity. It sorts every message as a question, change (cuts included), idea to weigh, re-steer or pause;
  - an operator log of the run's whole conversation, written verbatim by hooks as each message and reply arrives.

  A re-steer keeps what still makes sense, and settles the new direction's forks in one doc before building any of it. #57 paid for that lesson with its crop → pan → walk rework.

- **The run must be able to see and drive its own work**; a product with no way to do that gets one as its first bite.
- **Vendored fixes land here too**, after `/update-muthur`: `/relay take` reads its summary before attaching and moves a diverged ref aside instead of `reset --hard`, and so does `/from-branch`. A muthur issue follows once the PR is finalized.
- **Every PR body gets a size cap** in `vet.sh`: 32,000 characters, and a body that crossed it passes again only at 24,000.
- **Two questions with recommendations** remain: the run's model (named, with a warning below Opus at high effort) and the operator log versus kept relay files.

## QA Checklist

- [ ] `entry` — `/mega <task>` in a fresh session checks its model and effort, writes a megaplan in the split shape with the loop section, standing rules and the dashboard block, publishes it as a draft PR and stops at the one gate.
- [ ] `self-test` — on a product with no way for the run to see its own work, the megaplan's first bite builds one.
- [ ] `pickup` — `/relay take <branch>` on a mega branch reads `relay.md` before attaching, moves a diverged ref aside rather than resetting, and resumes from the plan's loop section.
- [ ] `budget-relay` — the budget pause on a mega branch relays without asking, with the operator's auto-relay off.
- [ ] `dashboard` — after a bite's end, the PR body opens with `## Where it stands`, naming the live session, what can be seen now, and everything that waits on the operator.
- [ ] `out-of-reach` — a step outside the branch and PR (a merge, a push elsewhere) is not taken, and appears on the operator's list as the exact command.
- [ ] `drop-in-change` — a change dropped mid-wave is logged, goes through the plan-or-not call, and lands where the orchestrator placed it, quoted in its own plan commit, without stopping the wave.
- [ ] `drop-in-comment` — a PR comment left mid-bite is taken into the intake at that bite's end.
- [ ] `drop-in-resteer` — a re-steer mid-bite judges each running piece against the new direction, rewrites `## Rest of the elephant` with built/unplaced marks, and opens a design doc before building anything.
- [ ] `operator-log` — a chat message and its reply land in `operator-log.md` verbatim; a task notification does not; a branch with no log is untouched.
- [ ] `body-cap` — `vet.sh` fails a PR body over 32,000 characters, and keeps failing it above 24,000 once it has crossed.
- [ ] `coverage` — every megabeast note maps either to a destination in the skill or to a stated reason it was dropped.
- [ ] `tombstone` — `.claude/skills/megabeast/retired.md` resolves the old notes via `git show`, and `plan/elephant.md` points at `/mega`.

| Item              | Automatable | Covered? | Notes                                                                           |
| ----------------- | ----------- | -------- | ------------------------------------------------------------------------------- |
| `entry`           | manual-only | —        | An agent following prose; walked by the plan's fresh-eyes subagent              |
| `self-test`       | manual-only | —        | Walked in the plan's fresh-eyes dry run                                         |
| `pickup`          | manual-only | —        | Seen on a real run's first relay                                                |
| `budget-relay`    | unit        | ✅       | The context-budget hook's test, with an operator log present                    |
| `dashboard`       | manual-only | —        | Judged by the operator reading it on a drop-in                                  |
| `out-of-reach`    | manual-only | —        | Walked in the plan's fresh-eyes dry run                                         |
| `drop-in-change`  | manual-only | —        | Walked in the plan's fresh-eyes dry run                                         |
| `drop-in-comment` | manual-only | —        | Seen on a real run's first bite end after a comment                             |
| `drop-in-resteer` | manual-only | —        | Walked in the plan's fresh-eyes dry run                                         |
| `operator-log`    | unit        | ✅       | The hook's tests: the injected-prompt skip and the no-log no-op                 |
| `body-cap`        | unit        | ✅       | The crossing rule's test                                                        |
| `coverage`        | manual-only | —        | Read against `docs/remove-before-merging/mega-coverage.md`                      |
| `tombstone`       | unit        | ✅       | `scripts/check-skill-catalog.sh` fails a dangling `@`-reference into `.claude/` |

https://claude.ai/code/session_01CnAdnSZ8PCLBPcWVtQxcFX
https://claude.ai/code/session_01Be3aJin8zwtPdBiY8vTMG9
https://claude.ai/code/session_01MF9yMKnnd3MPKCXt3M46Rh

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
its own tail and folding into the plan. But the loop lived in one plan
and ~100 KB of notes. /mega turns it into a skill that runs an elephant
of any kind end to end, stopping only once, at the plan's review, and
relaying at the context-budget pause rather than at every bite's end.

The operator's say is asynchronous: the run makes every call itself and
reverses one when asked. Its reach ends at its own branch and PR; a step
beyond them, or a failure that survives three attempts, goes on the
operator's list in a "Where it stands" block that opens the PR body with
the live session and what can be seen now. Messages come as chat or as
PR comments taken in at each bite's end, never by subscription; hooks
log both sides verbatim, and each is sorted as a question, change,
idea to weigh, re-steer or pause. A re-steer settles the new direction's
forks in one doc before building any of it.

The skill reads by phase, one file each, and points at /relay, /task,
/polish, /finalize and the elephant shape rather than restating them.
The megabeast notes retire behind a tombstone. /relay take and
/from-branch move a diverged ref aside instead of resetting it, and
vet.sh caps every PR body at 32,000 characters, passing a body that
crossed it again only at 24,000.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

_17 resolved threads omitted; re-run with `--include-resolved` to export them._

- **T01** `docs/plans/mega-skill.draft.do-not-implement.md`:82 — unresolved — last: @vzakharov (human) 2026-10-04T21:58:08Z — "а промежуточные вызовы тулов и пр. записывает? стоит или нет…" → [↓](#t01)
- **T02** `docs/plans/mega-skill.draft.do-not-implement.md`:17 — unresolved — last: @vzakharov (human) 2026-10-04T21:59:42Z — "> раньше любой фичи ну это может быть лишнее -- главное чтоб…" → [↓](#t02)
- **T03** `docs/plans/mega-skill.draft.do-not-implement.md`:87 — unresolved — last: @vzakharov (human) 2026-10-04T22:00:28Z — "ок" → [↓](#t03)
- **T04** `docs/plans/mega-skill.draft.do-not-implement.md`:89 — unresolved — last: @vzakharov (human) 2026-10-04T22:01:24Z — "ничего не понял но ок :)" → [↓](#t04)
- **T05** `docs/plans/mega-skill.draft.do-not-implement.md`:110 — unresolved — last: @vzakharov (human) 2026-10-04T22:02:42Z — "немножко свербит внутри, что у нас то ли суть что "mega", то…" → [↓](#t05)

<a id="t01"></a>

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

**@vzakharov (agent)** — 2026-10-04T21:55:55Z

Ответы теперь тоже в логе, целиком. Пишут хуки, а не агент, чтобы ничего не пересказывалось и не терялось:
- чат: `UserPromptSubmit` дописывает твоё сообщение в момент прихода, `Stop` — ответ прогона. Промпты, которые подкладывает харнесс (уведомления задач, wake, отчёты сабагентов), узнаются по их открывающему тегу и пропускаются;
- комментарии на PR: `scripts/mega-log-pr.sh` в конце байта, после переэкспорта. Ответ там уже на GitHub, так что в логе ссылка на него, а не копия.

На ветке без operator log оба хука ничего не делают. Сессии лог целиком не читают, только секцию текущего байта. f4fddfb

**@vzakharov (human)** — 2026-10-04T21:58:08Z

а промежуточные вызовы тулов и пр. записывает? стоит или нет, как считаешь?

---

<a id="t02"></a>

### `docs/plans/mega-skill.draft.do-not-implement.md`:17 — unresolved

```diff
@@ -14,83 +14,87 @@ The ask, verbatim:
 - **PR #57's thread**: `docs/pr/57/pr.md` (exported). It shows how the operator actually dropped in: 19 bites (1–18 plus 12b), about 50 sessions over 9 days, two big re-steers, and a stream of play n…
 - **The run's own plan** at its last state: `git show 9bcb67b1:docs/plans/mushroom-game-syama.completed.md`, its § "How this elephant is eaten" and standing rules, plus `decisions.md` and `to-check.m…
 
+#57 was a game, and `/mega` is not limited to games: the same loop has to carry a large feature inside an existing product with a client and a server. So the skill says "see" and "use" where the notes say "play", and keeps game specifics out (§ "Files").
```

**@vzakharov (human)** — 2026-10-04T21:36:07Z

Это не про артефакт, а навеяно: вот я сам раньше написал про клиент и сервер, но подумал, что *какие-то* средства собственноручного тестирования у агента должны быть всегда. Иначе unsolicited получается невозможным. Соответственно, если, например, приложение в принципе не поддерживает пока возможность работы руками агента (грубо говоря если /preview не настроен), то это должен быть один из первых байтов, иначе такого можно нагородить...

**@vzakharov (agent)** — 2026-10-04T21:55:58Z

Взял как правило. До первого байта план отвечает, как прогон сам увидит и прогонит свою работу: маршруты `/preview`, тестовая обвязка, команда, дёргающая API, скрипт, который водит UI. Если у продукта такого пока нет, это первый байт, раньше любой фичи. f4fddfb

**@vzakharov (human)** — 2026-10-04T21:59:42Z

> раньше любой фичи

ну это может быть лишнее -- главное чтобы он был fitting для того байта, над которым работает. можно написать и после написания байта. наверное так даже лучше, потому что иначе придётся заранее планировать что писать в байте. с другой стороны, TDD. что думаешь?

---

<a id="t03"></a>

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

**@vzakharov (agent)** — 2026-10-04T21:56:00Z

Взвесил. По заметкам, релей и так привязан не к границе байта, а к паузе бюджета; просто на масштабе #57 один байт заполнял сессию ("Bite 1 alone reached the 200k warning").

За продолжение:
- экономит ориентацию новой сессии, ~58–115k;
- нет трения подхвата: устаревшая ветка «почти каждый раз», не тот lockfile, дрейф языка ответов в английский, потерянный `tmp/`;
- заметки сами советуют складывать разбор ревью в следующий байт, «где контекст позволяет».

Против:
- следующий байт почти наверняка зарелеится посередине;
- ты говорил «relay, и всегда так». Но это было против замены релеев сабагентами, а не против продолжения при свободном контексте.

Так что прогон продолжает в следующий байт, пока пауза бюджета не сработала. Fold в конце байта пишется целиком, как перед релеем, чтобы релей мог прийти в любой момент после него. f4fddfb

**@vzakharov (human)** — 2026-10-04T22:00:28Z

ок

---

<a id="t04"></a>

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

**@vzakharov (agent)** — 2026-10-04T21:56:02Z

Откуда: преемник цепляется через `create_session` + `source_revision` и поднимается detached или на устаревшей локальной ветке, `pull --ff-only` отказывает. На байтах 9 и 10 авто-режим один раз пропустил `reset --hard`, и после этого сессиям отказывали во всём, даже в чтении. Потеряно ничего не было, tip вернули из reflog. В каждом промпте преемника строка ездила потому, что `/relay take` читает сводку после attach, и «never reset» из сводки приходил слишком поздно.

Да, место ему в скилле релея, и с T13 это теперь можно сделать здесь. `/relay take` читает `relay.md` из `origin/<branch>` через `git show` до attach. Сам attach делает unshallow, fast-forward, а действительно разошедшийся реф отодвигает (`git branch -m <branch> stale/<…>`) вместо reset. Тот же приём заменяет `reset --hard` в force-push-кейсе `/from-branch`. Из `mega/relay.md` правило ушло. f4fddfb

**@vzakharov (human)** — 2026-10-04T22:01:24Z

ничего не понял но ок :)

---

<a id="t05"></a>

### `docs/plans/mega-skill.draft.do-not-implement.md`:110 — unresolved

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

**@vzakharov (agent)** — 2026-10-04T21:56:03Z

По сути ничем, это одно и то же. `elephant.md` § «Unattended runs» сейчас — заглушка в шесть строк со ссылкой на заметки, откуда скилл когда-нибудь вырастет. Разница с обычным слоном: обычный останавливается после каждого байта на твоё ревью и следующий `/go`, а `/mega` — тот же слон без тебя между байтами. Секция становится однострочным указателем на `/mega`; так в плане и написано. f4fddfb

**@vzakharov (human)** — 2026-10-04T22:02:42Z

немножко свербит внутри, что у нас то ли суть что "mega", то ли что "unattended", никак не могу свести воедино. Это пока фраза к размышлению, не запрос на изменение.

---

## Timeline (status, references, and other events)

- **2026-10-04T20:41:54Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/101#pullrequestreview-5408015308.
- **2026-10-04T21:45:24Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/101#pullrequestreview-5408314187.
