# The operator's side of a run

Opened whenever the operator says something, and at each bite's end when the dashboard is rewritten. The operator drops in at times of their choosing, sees where things stand in under a minute, and says something into the run. Nothing in the run waits for them.

## The dashboard

**A `## Where it stands` block opens the PR body**, rewritten — never appended to — at every bite's end and every wave report, from `templates/dashboard.md`, through `scripts/pr-body.py`'s pull and push. Everything "here and now" is in it, and nowhere else:

- the bite in flight and its step;
- what can be seen or used now, and how: an Artifact when the work can be wrapped in one (a standalone page, a component, a game); otherwise the way to reach it (a preview route, screenshots on the branch, a command to run); or "nothing to see yet";
- the **live session's link** and its relay depth, kept current at every relay, so the operator always knows where chat goes;
- the last re-steer and where it landed in the plan;
- **what waits on the operator**, in full, in their language: hand checks only a person can make, the taste calls the run took for them, the out-of-reach steps as exact commands, and the parked failures with what was tried. An item leaves the list when the operator answers it or the run makes it moot.

The block's own lines stay at ~10; the list is as long as it is, because a long list is itself what the operator needs to see. `@.claude/skills/qa-checklist/SKILL.md`'s checklist below it is untouched.

**Screenshots and the Artifact** are where the operator actually looks. Where the work has them: screenshots committed per bite, the previous bite's retired behind a tombstone; one Artifact URL, republished in place, mid-bite too whenever a visible batch lands.

## Two channels in, no subscription

- **Chat in the live session**, whose link is on the dashboard. A `/handle` typed there goes through the intake like any other message.
- **PR comments and reviews**, taken in at every bite's end before the fold (`bite-end.md`): the PR is re-exported, and each thread whose last comment is the operator's is a message — on any path, a committed screenshot and the run's own plan and skill files included. A comment waits at most until the current bite ends. A batched review is taken in whole, and every thread gets one reply naming the commit that answered it.

A comment on the run's process — its standing rules, the journal, this skill — is a change to the loop, placed like any other.

## The intake

Every message lands in the operator log first (below). A reply goes in the operator's language, also on a turn woken by an agent's English report. Then the message is sorted into exactly one of:

- **Question** — asks, changes nothing. Answered from the plan **and** the idea docs, with agents still running. It reaches the plan only if the answer changes what gets built. A "why?" about a call the run made is a question, not a request to undo it: it gets the call's reason and whether that reason still holds.
- **Change** — a fix, a tweak, an addition, a cut. It goes through `@.claude/skills/task/SKILL.md`'s plan-or-not call. **The orchestrator decides where it goes**: at once in parallel with the bite, into the bite, into a later bite, or into `## Rest of the elephant`, and writes that placement into the plan in a commit of its own, quoting the operator's words, before any code is touched — mid-tail too, as a numbered call, so it survives a relay. Never queued for "after this bite" unless placing it there is the call.
  - **Built by an agent**: a change placed at once is one file-disjoint step for one agent, launched in parallel with the bite. A defect whose cause is obvious is cheaper fixed by the orchestrator than briefed. In a fast stream of messages, wait for the next one before briefing.
  - **Work a running agent holds** goes to that agent by `SendMessage`, naming the earlier message it supersedes. A change that redesigns what an agent is building stops it at a pushed step rather than letting it finish to the old call.
  - **A conditional ask** ("if it's easy; if not, drop it") is the run's to decide; the reply says which way it went and the commit.
  - **A reorder** lands running agents at a pushed step, moves the open bite's text whole into `## Rest of the elephant`, and says which part of it is already built.
  - **A cut places the same way, as a removal**: an agent building the cut piece lands at a pushed step and stops, `## Rest of the elephant` drops it, and what is built is taken out in its own commit — unless something kept depends on it, in which case it stays and the plan says why.
- **Idea to weigh** — "don't put it in a plan yet", or a direction with open forks. Kept verbatim in `docs/plans/<slug>/ideas.md`. The plan gets only the task of writing the weighing doc; where one message splits "now" from "later", the "now" part is done at once and nothing more. Once an idea is partly built, the plan says which half is built and which is unplaced.
  - **Answers to a weighing doc's forks** land twice: a "what you decided" section on top of the doc, its body kept as the reasoning, and a plan item quoting them. A one-line "ok" to a recommendation approves that recommendation. The reply names every reading the run had to guess.
- **Re-steer** — changes what the thing _is_. Below.
- **Pause / take over** — "I'll take it from here". Running agents land a pushed step, a dirty tree proven equal to its patch before anything is dropped. Then a relay with no `create_session` (`relay.md`): the successor line goes to the operator, and the depth resets.

**A taste call is never held for the operator.** Some calls only a person can judge, by using the result: how a thing feels, how fast a UI has to answer, how a page reads, how a flow or an API sits in the hand. The run takes its recommended option, builds it, and puts the call on the dashboard's list: what it picked, the alternative, and what switching would cost. The recommended option is built on its own `wt/<name>` branch, so switching costs only that branch. Work that does not depend on the call goes ahead meanwhile. A fix built to the letter of a message that changes something the message never mentioned is a taste call too.

## A re-steer

1. The message is quoted into the plan's standing rules or decisions, and committed on its own.
2. **Each piece in flight and each piece already built is judged against the new direction.** One that still makes sense under it is finished or kept. One that doesn't is landed at a pushed step and marked unplaced. Where the operator names the timing themselves ("after this bite"), their words decide.
3. `## Rest of the elephant` is rewritten, what is already built marked built or unplaced.
4. **The new direction's forks are settled in one design doc before any of it is built.** The run settles them itself, and the doc says what it picked and why, so the operator can overturn any of it later. A direction built in stages, each fork settled only when the last stage hit it, throws away each stage with the next. Settling may take a whole session; the settled doc is then its natural stop, so the successor starts briefing at once.

## The operator log

`docs/plans/<slug>/operator-log.md` holds the run's whole conversation with the operator, verbatim and in order, with a `## Bite N` heading per bite, which the bite's start writes. `start.md` creates it, and its existence is what marks a branch as a run for the hooks and the context-budget hook.

**Hooks write it, not the agent**, so nothing in it is paraphrased or forgotten:

- **Chat** — `.claude/hooks/golem-operator-log.sh` appends each operator message as it arrives, with the time and the session's link. The run's reply is queued in `tmp/` when the turn ends and written at the next prompt, so a turn does not end on an uncommitted file. A prompt the harness injects — a task notification, a wake, a subagent's hand-back — is skipped, and so is the reply to it. Its header carries the detection's limits.
- **PR comments** — `scripts/golem-log-pr.sh`, run by the bite's end after its re-export, appends each thread whose last comment is the operator's, with the comment's link. The run's reply is on GitHub, so the entry links it rather than copying it.

Each append is committed with the session's next commit. **Before a relay's last commit and at the bite's end**, `.claude/hooks/golem-operator-log.sh flush "$(git rev-parse --show-toplevel)"` writes the queued reply, which `tmp/` would otherwise lose with the container, and the commit takes what is left. **Sessions never read the log whole**: the intake reads only the current bite's section. Tool calls stay out of it — each entry's session link leads to the transcript that holds them.
