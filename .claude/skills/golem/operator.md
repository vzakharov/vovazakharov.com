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

**An out-of-reach step's command names a secret by its variable, never its value** — `gh secret set STRIPE_KEY`, the value left for the operator to supply — because the PR body is read by everyone who can read the repo, and its edit history keeps what a later rewrite removes.

**A bite whose seeing-means needs an out-of-reach step** closes on what the run can see without it — a stand-in for the blocked service, a test at the seam — and the rest of its contract goes on the list as a hand check naming the command it waits on. The plan keeps that remainder open under the bite, and work that depends on it waits with it.

**Items still on the list at the last bite** do not hold it: it ends in `/finalize` without `and merge` as always, the list stays at the top of the PR body, and the run's last reply names each item. A parked red gate stops `/finalize` where its own rules stop, with the list saying why. Merging is the operator's, made with the list in front of them.

**Screenshots and the Artifact** are where the operator actually looks. Where the work has them: screenshots committed per bite (`bite-end.md`); one Artifact URL, republished in place, mid-bite too whenever a visible batch lands.

## Two channels in, no subscription

- **Chat in the live session**, whose link is on the dashboard. A `/handle` typed there goes through the intake like any other message.
- **PR comments and reviews**, taken in at the go-ahead (`start.md` § "The gate") and at every bite's end before the fold (`bite-end.md`): the PR is re-exported, and each thread whose last comment is the operator's is a message — on any path, a committed screenshot and the run's own plan and skill files included. A comment waits at most until the current bite ends. A batched review is taken in whole, and every thread gets one reply naming the commit that answered it.

A comment on the run's process — its standing rules, the journal, this skill — is a change to the loop, placed like any other.

## The intake

Every message lands in the operator log first (below). A reply goes in the operator's language, also on a turn woken by an agent's English report. Then the message is sorted into exactly one of:

- **Question** — asks, changes nothing. Answered from the plan **and** `ideas.md`, with agents still running. It reaches the plan only if the answer changes what gets built. A "why?" about a call the run made is a question, not a request to undo it: it gets the call's reason and whether that reason still holds.
- **Change** — a fix, a tweak, an addition, a cut. It takes only `@.claude/skills/task/SKILL.md` § "Step 1"'s plan-or-not judgment, written as a numbered call in `decisions.md`: one that needs a plan is written into this run's plan as a bite or part of one, never into a plan file of its own. None of `/task`'s outcomes runs — no draft file, no `/pr`, no hand-off, no `/go` Planless with its `/polish` and `/pr` mid-bite — since the bite's tail does all of that for the run. **The orchestrator decides where it goes**: at once in parallel with the bite, into the bite, into a later bite, or into `## Rest of the elephant`, and writes that placement into the plan in a commit of its own, quoting the operator's words, before any code is touched — mid-tail too, so it survives a relay. Never queued for "after this bite" unless placing it there is the call.
  - **Built by an agent**: a change placed at once is one file-disjoint step for one agent, launched in parallel with the bite. A defect whose cause is obvious is cheaper fixed by the orchestrator than briefed. In a fast stream of messages, wait for the next one before briefing.
  - **Work a running agent holds** goes to that agent by `SendMessage`, naming the earlier message it supersedes. A change that redesigns what an agent is building stops it at a pushed step rather than letting it finish to the old call.
  - **A conditional ask** ("if it's easy; if not, drop it") is the run's to decide; the reply says which way it went and the commit.
  - **A reorder** lands running agents at a pushed step, moves the open bite's text whole into `## Rest of the elephant`, and says which part of it is already built.
  - **A cut places the same way, as a removal**, wherever the piece lives: `## This bite` and `## Rest of the elephant` drop it; `## Eaten so far` and its `bite-<nn>.md` keep their record and gain a line naming the cut and its commit; `decisions.md` gets a new call naming the calls it overturns, which stay as written. An agent building the cut piece lands at a pushed step and stops. **The orchestrator takes the built part out**, in its own commit, once the wave holding those files is stopped or done (`orchestrate.md`), so no agent is still writing them. A pushed migration is reversed by a new migration, not by deleting its file, since a database that ran it keeps its effects. What something kept depends on stays, and the plan says why.
- **Idea to weigh** — "don't put it in a plan yet", or a direction with open forks. The orchestrator quotes it verbatim into `docs/plans/<slug>/ideas.md`, a section per idea, in the intake's commit. The plan gets only the task of weighing it — the forks, the options and a recommendation, written under the quote by a subagent, in a package beside the bite in flight since it touches no source, or in the next bite when this one has no wave left. Where one message splits "now" from "later", the "now" part is done at once and nothing more. Once an idea is partly built, the plan says which half is built and which is unplaced.
  - **Answers to an idea's forks** land twice: a "what you decided" paragraph on top of its section in `ideas.md`, the weighing kept below as the reasoning, and a plan item quoting them. A one-line "ok" to a recommendation approves that recommendation. The reply names every reading the run had to guess.
- **Re-steer** — changes what the thing _is_. Below.
- **Pause / take over** — "I'll take it from here". Running agents land a pushed step, a dirty tree proven equal to its patch before anything is dropped. Then a relay with no `create_session` (`relay.md`): the successor line goes to the operator, and the depth resets.

**A taste call is never held for the operator.** Some calls only a person can judge, by using the result: how a thing feels, how fast a UI has to answer, how a page reads, how a flow or an API sits in the hand. The run takes its recommended option, builds it, and puts the call on the dashboard's list: what it picked, the alternative, and what switching would cost. The recommended option is built on its own `wt/<name>` branch and lands as one squash commit like any package (`orchestrate.md`), the branch kept until the operator answers, so switching costs reverting that one commit. Work that does not depend on the call goes ahead meanwhile. A fix built to the letter of a message that changes something the message never mentioned is a taste call too.

## A re-steer

1. **The message is quoted into the loop section's `### Standing rules`, and what it supersedes is retired in the same commit**: each standing rule it overturns is struck from that list, and each call in `decisions.md` it overturns gets a new call naming its number. The commit names every rule and call retired, so a successor never builds to one the operator turned away from.
2. **Each piece in flight and each piece already built is judged against the new direction.** One that still makes sense under it is finished or kept. One that doesn't is landed at a pushed step and marked unplaced. Where the operator names the timing themselves ("after this bite"), their words decide.
3. `## Rest of the elephant` is rewritten, what is already built marked built or unplaced.
4. **The bite in flight still runs its tail** (`bite-end.md`) over what landed, so the new direction starts from a vetted, folded tree; its review covers only what is kept.
5. **The new direction's forks are settled in `docs/plans/<slug>/design.md` before any of it is built.** The run settles them itself, and the doc says what it picked and why, so the operator can overturn any of it later. A direction built in stages, each fork settled only when the last stage hit it, throws away each stage with the next.

## The operator log

`docs/plans/<slug>/operator-log.md` holds the run's whole conversation with the operator, verbatim and in order, with a `## Bite N` heading per bite, which the bite's start writes. `start.md` creates it, and its existence is what marks a branch as a run for the hooks and the context-budget hook.

**Hooks write it, not the agent**, so nothing in it is paraphrased or forgotten:

- **Chat** — `.claude/hooks/golem-operator-log.sh` appends each operator message as it arrives, with the time and the session's link. The run's reply is queued in `tmp/` when the turn ends and written at the next prompt, so a turn does not end on an uncommitted file. A prompt the harness injects — a task notification, a wake, a subagent's hand-back, and the run's own check-ins (`send_later`, a scheduled trigger) — is skipped, and so is the reply to it: none is the operator's, so none goes through the intake either. Its header carries the detection's limits.
- **PR comments** — `scripts/golem-log-pr.sh`, run by the bite's end after its re-export, appends each thread whose last comment is the operator's, with the comment's link. The run's reply is on GitHub, so the entry links it rather than copying it.

Each append is committed with the session's next commit. **Before a relay's last commit and at the bite's end**, `.claude/hooks/golem-operator-log.sh flush "$(git rev-parse --show-toplevel)"` writes the queued reply, which `tmp/` would otherwise lose with the container, and the commit takes what is left. **Sessions never read the log whole**: the intake reads only the current bite's section. Tool calls stay out of it — each entry's session link leads to the transcript that holds them.
