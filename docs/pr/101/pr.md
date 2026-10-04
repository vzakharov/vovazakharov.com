# PR #101: chore: /mega, a huge task run near-autonomously with drop-ins

- **State:** open
- **URL:** https://github.com/vzakharov/vovazakharov.com/pull/101
- **Author:** @vzakharov (human)
- **Base ← Head:** main ← claude/mega-skill-jthnal
- **Draft:** yes
- **Merged:** _not merged_
- **Created:** 2026-10-04T19:39:49Z
- **Updated:** 2026-10-04T22:12:01Z
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

- **A bite is not done until the run has seen its result with its own means**, built inside the bite that first needs them.
- **Vendored fixes land here too**, after `/update-muthur`: `/relay take` reads its summary before attaching and moves a diverged ref aside instead of `reset --hard`, and so does `/from-branch`. A muthur issue follows once the PR is finalized.
- **Every PR body gets a size cap** in `vet.sh`: 32,000 characters, and a body that crossed it passes again only at 24,000.
- **Two questions with recommendations** remain: the run's model (named, with a warning below Opus at high effort) and the operator log versus kept relay files.

## QA Checklist

- [ ] `entry` — `/mega <task>` in a fresh session checks its model and effort, writes a megaplan in the split shape with the loop section, standing rules and the dashboard block, publishes it as a draft PR and stops at the one gate.
- [ ] `self-test` — on a product with no way for the run to see its own work, the first bite that needs one builds it, and no bite closes before its result was seen.
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

_21 resolved threads omitted; re-run with `--include-resolved` to export them._

- **T01** `docs/plans/mega-skill.draft.do-not-implement.md`:110 — unresolved — last: @vzakharov (human) 2026-10-04T22:12:01Z — "подмывает назвать /yolo :) давай подумаем о вариантах" → [↓](#t01)

<a id="t01"></a>

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

**@vzakharov (agent)** — 2026-10-04T22:06:39Z

Моя версия, тоже к размышлению: это два взгляда на один прогон. «mega» — про размер, то есть почему работа растягивается на много сессий. «unattended» — про то, что между ними нет тебя. Размер без второго — это просто слон с твоим ревью после каждого байта. Unattended без размера — это просто `/go`. Скилл — их пересечение, и новое в нём (дашборд, intake, лог) всё про вторую половину. Так что если будет свербеть и дальше, имя, наверное, должно идти за сутью, а не за размером. План пока не трогаю.

**@vzakharov (human)** — 2026-10-04T22:12:01Z

подмывает назвать /yolo :) давай подумаем о вариантах

---

## Timeline (status, references, and other events)

- **2026-10-04T20:41:54Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/101#pullrequestreview-5408015308.
- **2026-10-04T21:45:24Z** @vzakharov reviewed (COMMENTED): https://github.com/vzakharov/vovazakharov.com/pull/101#pullrequestreview-5408314187.
