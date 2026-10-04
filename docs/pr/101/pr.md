# PR #101: chore: /mega, a huge task run near-autonomously with drop-ins

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/101
- **Author:** @vzakharov (human)
- **Base ← Head:** main ← claude/mega-skill-jthnal
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-04T19:39:49Z
- **Updated:** 2026-10-04T20:41:54Z
- **Closed:** _not closed_
- **Labels:** _none_

---

## Body

## Summary

- **A plan, not code yet:** `docs/plans/mega-skill.draft.do-not-implement.md` designs `/mega`. It is a skill that runs a huge task (an elephant) near-autonomously across many sessions, while the operator drops in now and then to look at progress, leave notes, and sometimes turn the whole direction.
- **The loop itself is distilled** from two sources: the megabeast notes (`.claude/skills/megabeast/notes/`, ~100 KB), and PR #57, where the mushroom game was built that way by hand over 19 bites and ~50 sessions.
- **The operator's side is new design.** It has two parts:
  - a `## Where it stands` dashboard at the top of the PR body, with the live session's link kept current across relays;
  - an intake that sorts every operator message into where it lands: question, note, feel call, idea to weigh, re-steer, cut or pause.

  A re-steer settles the new direction's forks in one doc before building any of it. #57 paid for that lesson with its crop → pan → walk rework.
- **Five questions with recommendations** close the plan: where the skill lives (here or in muthur), the gate, when a re-steer takes effect, what happens to the notes, and the run's model.

## QA Checklist

- [ ] `entry` — `/mega <task>` in a fresh session writes a megaplan in the split shape, with the loop section, standing rules and the dashboard block. It publishes it as a draft PR and stops at the one gate.
- [ ] `pickup` — `/relay take <branch>` on a mega branch resumes the run from the plan's loop section. It reads the depth from `lineage`, and never runs `reset --hard`.
- [ ] `dashboard` — after a bite's end, the PR body opens with `## Where it stands` (at most ~15 lines), naming the live session, what is playable, and what waits on the operator.
- [ ] `drop-in-note` — a note dropped mid-wave lands as its own plan commit quoting the words, then becomes a one-step agent, without stopping the wave.
- [ ] `drop-in-resteer` — a re-steer mid-bite does three things before building anything: wraps running agents at a pushed step, rewrites `## Rest of the elephant` with built/unplaced marks, and opens a design doc.
- [ ] `coverage` — every megabeast note maps either to a destination in the skill or to a stated reason it was dropped.
- [ ] `tombstone` — `.claude/skills/megabeast/retired.md` resolves the old notes via `git show`, and `plan/elephant.md` points at `/mega`.

| Item              | Automatable | Covered? | Notes                                                                          |
| ----------------- | ----------- | -------- | ------------------------------------------------------------------------------ |
| `entry`           | manual-only | —        | An agent following prose; walked by the plan's fresh-eyes subagent             |
| `pickup`          | manual-only | —        | Seen on a real run's first relay                                               |
| `dashboard`       | manual-only | —        | Judged by the operator reading it on a drop-in                                 |
| `drop-in-note`    | manual-only | —        | Walked in the plan's step 5 dry run                                            |
| `drop-in-resteer` | manual-only | —        | Walked in the plan's step 5 dry run                                            |
| `coverage`        | manual-only | —        | Read against `docs/remove-before-merging/mega-coverage.md`                     |
| `tombstone`       | unit        | ✅       | `scripts/check-skill-catalog.sh` fails a dangling `@`-reference into `.claude/` |

https://claude.ai/code/session_01CnAdnSZ8PCLBPcWVtQxcFX

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
elephant end to end, stopping only once, at the plan's review.

The operator's side is designed rather than inherited. The PR body opens
with a "Where it stands" block, rewritten at every bite's end and wave.
It names the live session, what can be played, and what waits on them.
Each operator message, whether it comes as a PR comment or as chat, is
sorted as a question, note, feel call, idea to weigh, re-steer, cut or
pause, and each kind lands in its own place. A re-steer lands running
agents at a pushed step and quotes the message into the plan. It then
settles the new direction's forks in one doc before building any of it.

The skill reads by phase, from one file each: start, operator,
orchestrate, bite-end, review, relay and look, plus templates and a
journal. It points at /relay, /polish, /finalize and the elephant shape
rather than restating them. The megabeast notes retire behind a
tombstone.

Co-authored-by: Claude <noreply@anthropic.com>
```

---

## Review threads

- **T01** `docs/plans/mega-skill.draft.do-not-implement.md`:29 — unresolved — last: @vzakharov (human) 2026-10-04T20:27:25Z — "поясни зачем нужно `/mega <branch>` если есть `/relay take`?" → [↓](#t01)
- **T02** `docs/plans/mega-skill.draft.do-not-implement.md`:37 — unresolved — last: @vzakharov (human) 2026-10-04T20:28:45Z — "артефакт -- не всегда feasible (мы не уверены что все мегафи…" → [↓](#t02)
- **T03** `docs/plans/mega-skill.draft.do-not-implement.md`:38 — unresolved — last: @vzakharov (human) 2026-10-04T20:30:36Z — "вот этот самый to-check на самом деле хорошо бы прижился в р…" → [↓](#t03)
- **T04** `docs/plans/mega-skill.draft.do-not-implement.md`:46 — unresolved — last: @vzakharov (human) 2026-10-04T20:32:17Z — "нене, этого добра нам не надо. У нас свой луп с handle и (в…" → [↓](#t04)
- **T05** `docs/plans/mega-skill.draft.do-not-implement.md`:48 — unresolved — last: @vzakharov (human) 2026-10-04T20:32:32Z — "давай список, а не таблицей" → [↓](#t05)
- **T06** `docs/plans/mega-skill.draft.do-not-implement.md`:51 — unresolved — last: @vzakharov (human) 2026-10-04T20:34:46Z — ""playing" относится исключительно к играм, /mega ими не огра…" → [↓](#t06)
- **T07** `docs/plans/mega-skill.draft.do-not-implement.md`:52 — unresolved — last: @vzakharov (human) 2026-10-04T20:36:19Z — "надо понять как это экстраполируется на не-игры (if it does)…" → [↓](#t07)
- **T08** `docs/plans/mega-skill.draft.do-not-implement.md`:65 — unresolved — last: @vzakharov (human) 2026-10-04T20:36:47Z — "тоже должно быть решение агента. какие-то вещи имеют право б…" → [↓](#t08)
- **T09** `docs/plans/mega-skill.draft.do-not-implement.md`:72 — unresolved — last: @vzakharov (human) 2026-10-04T20:37:22Z — "это о чём?" → [↓](#t09)
- **T10** `docs/plans/mega-skill.draft.do-not-implement.md`:78 — unresolved — last: @vzakharov (human) 2026-10-04T20:37:31Z — "аналогично, не надо таблицы" → [↓](#t10)
- **T11** `docs/plans/mega-skill.draft.do-not-implement.md`:82 — unresolved — last: @vzakharov (human) 2026-10-04T20:39:36Z — "поясни? а название навело меня на мысль: каждый relay сохран…" → [↓](#t11)

<a id="t01"></a>

### `docs/plans/mega-skill.draft.do-not-implement.md`:29 — unresolved

```diff
@@ -0,0 +1,142 @@
… 25 lines elided …
+### Entry points
+
+- **`/mega <task>`** writes the megaplan in its run shape from bite 1, with every file and section below. It publishes the plan as a draft PR and stops at **one gate**: the operator reviews the plan,…
+- **`/mega` bare, or `/mega <branch>`** picks up a run: attach, read the plan's loop and the relay summary, then take the next step. `/relay take` on a mega branch lands here through the plan's loop section, so no relay edit is needed for it.
```

**@vzakharov (human)** — 2026-10-04T20:27:25Z

поясни зачем нужно `/mega <branch>` если есть `/relay take`?

---

<a id="t02"></a>

### `docs/plans/mega-skill.draft.do-not-implement.md`:37 — unresolved

```diff
@@ -0,0 +1,142 @@
… 33 lines elided …
+
+- **A `## Where it stands` block at the top of the PR body**, rewritten (not appended) at every bite's end and every wave report. It is at most ~15 lines and holds:
+  - the bite in flight and its step;
+  - what is playable or viewable now, with the Artifact link and the frames directory;
```

**@vzakharov (human)** — 2026-10-04T20:28:45Z

артефакт -- не всегда feasible (мы не уверены что все мегафичи будут чем-то, что можно обернуть в артефакт, пример: большая фича внутри уже существующего продукта с клиентом, сервером, блекджеком и... ну ты понял)

но если можно -- вещь хорошая

---

<a id="t03"></a>

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

---

<a id="t04"></a>

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

---

<a id="t05"></a>

### `docs/plans/mega-skill.draft.do-not-implement.md`:48 — unresolved

```diff
@@ -0,0 +1,142 @@
… 44 lines elided …
+
+Each run session calls `subscribe_pr_activity` on the PR, so a comment or review wakes whichever session is live. Chat in the live session is the other channel. Every operator message, from either ch…
+
+| Kind                  | Tell                                                         | What happens                                                                                                                                                                                                             |
```

**@vzakharov (human)** — 2026-10-04T20:32:32Z

давай список, а не таблицей

---

<a id="t06"></a>

### `docs/plans/mega-skill.draft.do-not-implement.md`:51 — unresolved

```diff
@@ -0,0 +1,142 @@
… 47 lines elided …
+| Kind                  | Tell                                                         | What happens                                                                                                  …
+| --------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------…
+| **question**          | asks, changes nothing                                        | Answered from the plan **and** the idea docs, with agents still running. It reaches the plan only if the answe…
+| **note**              | a fix or tweak, usually from playing                         | A plan edit in its own commit, quoting their words. It then becomes a one-step agent at once, in parallel with the bite. If it touches work a running agent holds, it goes to that agent by `SendMessage`.               |
```

**@vzakharov (human)** — 2026-10-04T20:34:46Z

"playing" относится исключительно к играм, /mega ими не ограничен. Решение составлять ли план должно идти через (почти) обычный task; исполнение -- да, через субагента; НО куда это вставить должен решать оркестратор. При этом так как /mega у нас по определению unattended (ну или по крайней мере unsoliciting), он должен принимать все решения без участия оператора; если оператор придёт опять и попросит это решение поменять, действовать соответственно. Короче, главное философское отличие -- вмешательство (или мешательство, гыгы) оператора становится асинхронным.

---

<a id="t07"></a>

### `docs/plans/mega-skill.draft.do-not-implement.md`:52 — unresolved

```diff
@@ -0,0 +1,142 @@
… 48 lines elided …
+| --------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------…
+| **question**          | asks, changes nothing                                        | Answered from the plan **and** the idea docs, with agents still running. It reaches the plan only if the answe…
+| **note**              | a fix or tweak, usually from playing                         | A plan edit in its own commit, quoting their words. It then becomes a one-step agent at once, in parallel with…
+| **feel call**         | latency, motion, sound — something they judge by playing     | Held for them while they are present. Groups that don't depend on it are briefed meanwhile, and the recommended option is built on a `wt/` side branch.                                                                  |
```

**@vzakharov (human)** — 2026-10-04T20:36:19Z

надо понять как это экстраполируется на не-игры (if it does). и остальное просвайпь на предмет фокуса на игры

---

<a id="t08"></a>

### `docs/plans/mega-skill.draft.do-not-implement.md`:65 — unresolved

```diff
@@ -0,0 +1,142 @@
… 61 lines elided …
+3. `## Rest of the elephant` is rewritten, with what is already built marked built or unplaced.
+4. **Then the new direction's forks are settled in one design doc before any of it is built.** #57's walking arrived in stages (crop → pan → walk → endless field), and each stage threw away the one b…
+
+**Timing:** by default a re-steer takes effect at once. "After this bite" in their words defers it to the bite boundary, as with T49.
```

**@vzakharov (human)** — 2026-10-04T20:36:47Z

тоже должно быть решение агента. какие-то вещи имеют право быть доделанными, если они makes sense даже с учётом re-steer'а

---

<a id="t09"></a>

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

---

<a id="t10"></a>

### `docs/plans/mega-skill.draft.do-not-implement.md`:78 — unresolved

```diff
@@ -0,0 +1,142 @@
… 74 lines elided …
+
+The skill reads by phase: a session opens only the reference file its current step needs. The notes measured ~38k tokens for a session that read them whole before its first brief.
+
+| File                                                  | Holds                                                                                                                                                                                                                                                                                                                              |
```

**@vzakharov (human)** — 2026-10-04T20:37:31Z

аналогично, не надо таблицы

---

<a id="t11"></a>

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

---

## Timeline (status, references, and other events)

- **2026-10-04T20:41:54Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/101#pullrequestreview-5408015308.
