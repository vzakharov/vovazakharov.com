# Writing the megaplan

Opened by `/golem <task>`, once `SKILL.md` § "Entry and pickup"'s model check is done, to write the run's plan and publish it. The plan is drafted, published and gated per `@.claude/skills/plan/SKILL.md` Part 1, and shaped per `@.claude/skills/plan/elephant.md`; what follows is only what a run adds.

## Before the plan

**Spike the main dependency's riskiest seam before writing bite 1.** Spend minutes in its source — not its docs — on the seam the work leans on hardest: sizing, input, lifecycle, auth, transport. Ten minutes there find what an hour of documentation misses, and bite 1 is then written against how the dependency actually behaves. Scratch goes in `tmp/`, since the draft gate holds; what the spike settles enters the plan as calls.

## The plan

**Write it in `elephant.md`'s split shape from bite 1**, not when it first passes 450 lines: the plan file holds the loop section, `## Rest of the elephant`, `## This bite`, and `## Eaten so far` as its summary and index, both still empty; the calls go to `docs/plans/<slug>/decisions.md`. A run's plan grows a bite's worth of decisions per bite, and every resume until the split would pay to read it whole.

**The loop section opens the plan**, right under the draft banner, filled from `templates/loop.md`. Every successor reads the plan on attach, so the section is how a session learns it is in a run with no extra file to load. Name the run's model in it, as `get_session` reported it. Its standing rules start with every rule the opening message states, quoted verbatim.

**Bite 1 is written in full in `## This bite`**, so the operator reviews it at the gate, which is the cheapest point to turn the run. Size it in work packages, one agent's step each, per the loop section: more than two sequential packages is two bites, and a bite cut too big ends in a stop mid-bite.

**Each bite's contract names how its result gets seen**: the test, preview route, command or drive script, and which of them the bite builds (`SKILL.md` § "Rules that hold on every turn of a run"). The bite's end checks against that line, so green gates alone cannot close a bite — a run once shipped every tap dead with vet green. Bite 1 names it here; every later bite names it when it is taken.

## Publishing

**The operator log is created in the plan's commit.** Copy `templates/operator-log.md` to `docs/plans/<slug>/operator-log.md` and fill it: the opening `/golem` message goes in by hand, verbatim, as the first operator entry — its time the session's `created_at` from `get_session`, its link built the way `.claude/hooks/golem-operator-log.sh`'s `session_link` builds it — because the hook was not live when that message arrived. From this commit on, the file's existence is what turns on the log hooks and the context budget's auto-relay (`operator.md` § "The operator log").

**The gate's reply is logged by hand too**, as the template's run entry, in the last commit before the turn ends, with the text the turn ends on: the hook queues only replies to prompts it logged, and it never saw the opening one.

**Publish per `@.claude/skills/plan/SKILL.md` § "Publishing the plan".** Then open the PR body with the dashboard: `python3 scripts/pr-body.py pull <n>`, put `templates/dashboard.md`'s block at the top — the bite in flight reading "the plan, awaiting your go-ahead", the plan's open questions on the list with the option already in force for each, and the model warning if `SKILL.md`'s check raised one — and `python3 scripts/pr-body.py push <n>`.

## The gate

**Stop at the run's one gate.** The reply gives the PR's URL, the open questions with their recommendations, and asks for the go-ahead in this session, in place of `/plan`'s `/go` handoff block: the session goes on into bite 1 itself, since a run relays only at the budget pause. What counts as a go-ahead is `@.claude/skills/plan/SKILL.md` § "The approval gate"'s.

**On the go-ahead, flip the plan** as `@.claude/skills/go/SKILL.md` Step 1 does, quoting it in the commit, and take bite 1 per `SKILL.md` § "The loop". Nothing after this asks the operator for anything.
