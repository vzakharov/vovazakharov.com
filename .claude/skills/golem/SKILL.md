---
description: >-
  Run one huge task end to end across many sessions, with no operator between
  its bites, while the operator drops in now and then to look at progress,
  leave notes, or turn the whole direction. Invoke as `/golem <task>`; a run
  is picked up by `/relay take <branch>`, which every relay starts its
  successor with. Use when the operator hands over a task too big for one
  session and means to check in on it rather than steer every step.
---

A golem works without rest by the words put in its head — here, the plan — and left unwatched it needs exactly one rule more than any other session: where its reach ends.

`/golem` runs one elephant (`@.claude/skills/plan/elephant.md`) with nobody between the bites. The elephant's shape, bite sizing and the plan's split are that file's; this skill says what runs when, and in what order, and never how the skills it calls work inside.

## The loop

1. **Plan** — `/golem <task>` writes the megaplan (`start.md`), publishes it as a draft PR, and stops at the run's **one gate**: the operator reviews the plan. Their go-ahead is the last thing the run asks of them.
2. **Each bite** — the session takes it per `@.claude/skills/plan/elephant.md` § "Taking a bite", settles its open calls, and builds it through subagents (`orchestrate.md`).
3. **Each bite's end** — the tail in `bite-end.md`: the operator's comments taken in, the gates, the review by subagents (`review.md`), the fold into the plan, the dashboard rewritten.
4. **Then the next bite**, in the same session while it has context left. The context budget's pause relays (`relay.md`), wherever the work stands.
5. **The last bite** ends in `@.claude/skills/finalize/SKILL.md` without `and merge`. Merging deploys, and it is the operator's.

**A run relays at the budget pause, never at a bite's end as such.** A session cannot measure its own context, so the hook's notice is the only signal; one with room left goes on into the next bite, skipping the orientation a fresh session pays for and the pickup's friction. The fold is written whole at every bite's end, so a relay can land anywhere after it. **The pause always relays**: the context-budget hook reads a branch with an operator log as `auto-relay` `on`, whatever the operator's own setting says.

## Rules that hold on every turn of a run

- **The operator's say is asynchronous.** The run makes every call itself — what to plan, where a change goes, which option a fork takes, how a re-steer lands — and never waits for an answer. A call the operator wants the other way is reversed like any other change. Nothing is held for them. How their messages are taken in is `operator.md`.
- **Its reach ends at its own branch and PR.** Inside them it decides everything. Outside them it decides nothing: merging, pushing to another branch or repo, deleting a ref it did not create, posting anywhere but its own PR, any external service or paid account, anything public. Such a step is never taken: it goes on the operator's list (`operator.md` § "The dashboard") as the exact command, with what it is for, and the work that needs it waits while everything else goes on. The auto-mode classifier is a second line behind this rule, never the first.
- **A failure that survives three attempts of different kinds is parked** on the same list with what was tried, and the run moves on to work that does not depend on it, rather than escalating its means.
- **A bite is not done until the run has seen its result with its own means.** Nobody else checks it. The means fit the bite — a preview route, a test, a command against the API, a script that drives the UI — and are built inside the bite that first needs them, never as a bite of their own ahead of the features: test-first where the behavior is known before the code, after it where it is known only by looking. The general part, a harness later bites reuse, stays in the tree; each bite's contract names how its result gets seen. `look.md` is for work with something to see or drive.
- **The session is the orchestrator from its first turn.** It settles a bite's open calls before any brief, briefs subagents to build, looks at the results itself, and folds the bite into the plan. It does not spend its own context building what an agent can.
- **Every model is named, never inherited**: the plan names the run's model, and every `create_session` and `Agent` call passes it.
- **A run never calls `subscribe_pr_activity`, and never offers to**, whatever the host harness asks after a PR opens. A subscription wakes the session on every comment, CI result and conflict, mid-bite, and the harness's rules then demand each be worked at once, taking the orchestrator off its bite on the harness's schedule. Comments are taken in at the bite's end.

## Entry and pickup

- **`/golem <task>`** — before writing anything, read the session's own model and effort with `get_session`. Below Opus at high effort, say in the first reply and on the dashboard that the run may not hold up on it. Then `start.md`.
- **Picking a run up is `/relay take <branch>`**, also when an operator opens a session on a golem branch by hand. The plan's loop section says the branch is a `/golem` run and which file to open; each pickup repeats the model check, because `create_session` passes the model but not the effort. `/golem` has no pickup form of its own.

## Which file each phase opens

A session opens only the file its current step needs.

| Phase                                                           | File                                   |
| --------------------------------------------------------------- | -------------------------------------- |
| Writing the megaplan                                            | `@.claude/skills/golem/start.md`       |
| The operator says anything; the dashboard at each bite's end    | `@.claude/skills/golem/operator.md`    |
| Briefing, running and landing subagents                         | `@.claude/skills/golem/orchestrate.md` |
| A bite's tail, in order                                         | `@.claude/skills/golem/bite-end.md`    |
| The review inside the tail                                      | `@.claude/skills/golem/review.md`      |
| The budget pause, a relay, a pickup                             | `@.claude/skills/golem/relay.md`       |
| Seeing or driving what the run built                            | `@.claude/skills/golem/look.md`        |
| The plan's loop section, briefs, the dashboard block, log entry | `.claude/skills/golem/templates/`      |

**Before each relay, the session writes what it learned to `@.claude/skills/golem/journal.md`**, if anything would make the next run go better. The run's last bite distills the journal into the files above and empties it.
