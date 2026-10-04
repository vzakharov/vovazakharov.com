# Briefing, running and landing subagents

Opened once a bite's calls are settled and the session is about to brief agents, and again on any restart or resume with agents out. The session orchestrates from its first turn (`SKILL.md` § "Rules that hold on every turn of a run"); this file is how.

## The orchestrator's own budget

- **Pickup costs ~60–115k before any work, so spend nothing the agents can.** Open only the files the plan names as the slice's contracts, give exploration to agents, and check the budget before starting a fix round.
- **One session orchestrates about one bite's specs and two build waves.** Each report costs ~2–4k plus its brief, and the pause usually lands after the wave that holds the integration, even in a one-package bite of six steps. Size the waves so the pause falls between them, and open one result per report, not everything it names.

## Settling the calls

Each call goes into the bite's calls in the plan before the brief that cites it, with the alternative it beat, so every later brief is a pointer and every reply has something to cite. Each report's decisions are written there as the report arrives, so a restart loses none of them.

- **A call with an unmeasured bar names its fallback in writing**, so the agent drops back without a re-brief.
- **A number is stated as "derive it from `<file>`", never as a figure copied from prose**, and carries its unit as read off the function that consumes it. A figure from a hand-over note or a call's wording goes stale the moment the code moves.
- **A tolerance names the visible thing it protects.** One that protects nothing a user sees is not written: an agent will spend its whole context proving no design meets it.
- **"Unchanged by construction" is a claim about one projection.** Before promising it, list every quantity the result depends on and check each, or write "a probe will show it". A risky call goes through a quick probe before a build agent is briefed.

## Shaping the work

- **A bite whose shape is unclear — how something looks or feels, a subject nobody has mapped — runs research → spec → step 0 → parallel groups by file.** A research agent writes the spec, not code: each item names what the references do, the change in the code's terms, a checkable property and a cost. The orchestrator settles its open calls, runs step 0 (the shared split, a pure module both groups need) alone, then the groups in parallel with file lists disjoint down to named functions.
- **Specs are one agent per theme or package, ~190k each**, each writing its own file and ending with its collision list: the files and types it shares with the others. A single spec agent fills before it maps half the ground; the collision lists make the waves trivial to plan.
- **Code nobody has read this session costs a reader before a builder.** The reader writes a fact sheet and the next step's design; the builder is briefed "read the note first, open only what it names, first commit within ~50k".
- **A switch-over after additive packages gets a mapping agent first**: the call sites, the files outside the list that read the old shape, the design calls. The switch is then one step.
- **A full check across configurations is one agent per configuration**, and the reds it finds are other agents' work, so checking and fixing run side by side.
- **Checking runs beside each build wave**, from a commit in its own worktree, never after all the building.
- **Parallel groups are followed by a fix round by default**, briefed from the orchestrator's own look at the seams; each group's report is right about its own half and blind to the other's. The fix round owns the final gates.

## Briefs

**Every brief points at `templates/brief-common.md`** and adds only its own steps, files, off-limits list and the calls it builds to. Before it goes out:

- **One build step plus its tests per agent**, a second only "if context allows", and the brief names the step that ends it. Writing a check, running it, looking at the results and tracing a red are each an agent of their own: every agent briefed "build, then look" runs out before the look. The hand-over note is the next brief's spine.
- **A fix that needs a check run is a brief of its own**; nits and wording batch together.
- **Every path is checked with `ls`**, or each agent spends a search on a file that moved.
- **Any sweep or check is capped at one foreground call**, and the full run is named as the orchestrator's, if anyone's. A detached run fires no tool calls, so it is invisible to check-ins and to the context-budget hook.
- **A constraint-tightening fix is briefed with the invariants it must not break**, named from the plan's decisions; the agent sweeps them and reports each place it departs from a design line.
- **The agent stops at the first rule it cannot keep** and reports its options, measured. Only the orchestrator can weigh one standing decision against another.
- **A fix from the operator's report is briefed "measure the cause first; stop if it differs from the plan's account."** A guessed cause in any report is a hypothesis for the brief, never its instruction, and a fix round first tests the check against its rule at the commit before, then tunes the code.
- **Every fix carries a check of what the user sees.** A fix green in tests and invisible in use has its cause one layer out; on a second miss, send a research agent for the layer below rather than a third fix.
- **A downstream agent may change upstream code** for an invariant its result exposes, and lists each change in its report so the plan absorbs it.
- **The `Agent` call passes the plan's model** (`SKILL.md`): an inherited one lands on the operator's default.

## Waves by file

- **Group work by the files it touches and run disjoint groups in parallel.** Each brief names the other groups' files off limits; the plan file is the orchestrator's alone; anything that builds or serves runs under a lock (`flock`).
- **Stage the waves by what each result depends on**: of each pair, ask "does one measure what the other produces?". **A wave is per package, not a barrier**: start each package the moment its inputs land.
- **Of each parallel pair, ask whether both might declare the same shared thing** — a type, a base, a schema. They collide at landing, not in their worktrees: sequence them, or name one owner.
- **Grant a package the functions that build the types it changes, by name**, wherever they live, not only its files.
- **Lines of a shared file are granted by name and by net line count**, both written into the calls; grants that precise merge clean.
- **A helper two parallel packages need is landed by the orchestrator before the wave**, or has one named owner. "Whoever needs it first" races, and the branch ends up with two.
- **Parallel groups build only on each other's committed API.** A step that breaks a shared type lands first and alone, and a package whose pause left a patch relaunches first.
- **A refactor runs one agent at a time**, in steps that each pass the checks, the old API kept as a shim until the last step, first commit within ~60k. A half-migrated tree has nothing that passes, so parallel refactor agents fill with nothing pushed.
- **A migration step lands additive-then-patch**: the additive half as a green commit, then the switch as a patch an agent applies, fixing fixtures and never changing an assertion.
- **A stricter check lands in the same wave as its fix**, or the pause note says red is expected.

## Worktrees and landing

- **Each agent works in its own worktree outside the repo**, in the scratchpad, with its own dependency install, nothing symlinked. The shared checkout is the orchestrator's: in a shared tree a sibling's half-written module fails the checks, and `git stash`, `git checkout -- <path>` and `git restore` sweep up siblings' edits, so a brief that does share the tree bans all three.
- **An agent pushes each passing step to its own `wt/<pkg>` and lands its package on the run's branch as one squash commit**, so a restart loses nothing and the branch's history stays the work's, not one merge per push. The mechanics are `templates/brief-common.md`'s.
- **As each report lands, remove the agent's worktree and delete its `wt/<pkg>` ref** with `gh api -X DELETE repos/<owner>/<repo>/git/refs/heads/wt/<pkg>` (`git push --delete` can hang at a proxy). The run created the ref, so deleting it is in reach. A taste call's branch stays until the operator answers, since it is what switching costs (`operator.md` § "The intake"). A worktree left inside the repo — `isolation: "worktree"` puts one under `.claude/worktrees/` — shows untracked on every turn and sits in the test glob. Never remove a dead agent's worktree before trying to resume it.

## Reports

- **"For you to decide" lines are the orchestrator's**, decided against the plan's tests and written as a call with the alternative it beat, never forwarded or footnoted. Each group sees only its own files. A call only a person can judge by using the result is a taste call: `operator.md` § "The intake".
- **A report's "not mine" list is a work queue**: dispatch each item then and there, since the other package's agent is usually gone.
- **A red traced to a running sibling's commit goes to that sibling by `SendMessage`.** The owner asks whether the test measures what it replaced before loosening anything.
- **A red with several causes converges one class per agent**, each report naming the next class with numbers. A residue the size of the bound's own slack is accepted in writing, not traced.
- **A measured departure accepted in the calls beats a re-brief.**

## Watching agents

- **A subagent cannot see its own context.** The context-budget hook tells it at 170k to commit, bring its note current and report (`.claude/context-budget/CLAUDE.md`).
- **The backstop is a `send_later` check-in armed with each wave**, ~10–12 minutes for a build or check agent, rarely needed for a reader: an agent stuck in one long command fires no tool call, so the hook never reads it. The check-in reads the branch's new commits and the agent's usage off its output file, never its content, and its prompt says to relaunch from the note if the agent is gone:

  ```sh
  jq -c 'select(.message.usage) | .message.usage | (.input_tokens + (.cache_read_input_tokens//0) + (.cache_creation_input_tokens//0))' <output_file> | tail -1
  ```

- **An agent at ~120–170k with nothing pushed is nudged to land a commit within ~25k**, which it does. Past ~200k, stop it and start a fresh one on the same brief from its note.
- **Never relay mid-wave**: it orphans the running agents and their reports. On the budget pause, launch nothing new, wait out an agent near its report and pause the rest (below), then relay (`relay.md`).

## Pauses

- **A pause is a hand-over, never a reset.** `SendMessage` each agent to commit what passes and write its note, work that does not pass committed as a `git apply`-able `.patch` beside it, the tree left as it is. Nothing promises the container outlives the pause, so the note is the part that counts.
- **A paused dirty tree is dropped or kept only once proven equal to its patch**: `git diff` it against the patch, the sorted `+` and `-` lines identical, then `git apply -R` or commit the tree as source.

## Restarts and resumes

A container restart or a usage limit kills running agents and their notifications, but not their pushed work or their worktrees, and nothing reports it.

- **Keep each agent's id until its report lands.**
- **Before re-dispatching anything, read `origin`'s log, the remote `wt/*` refs, the hand-over notes, `git worktree list` and each tree's `git status`**, since a dead agent may have finished.
- **Resume a dead agent by `SendMessage` to its id**, saying where it stopped and that its worktree is intact; it revives whole from its transcript. A worktree whose agent cannot be revived is rescued with `git -C <wt> add -A`, a `wip` commit and a push, and its successor reviews that commit first. A lost report comes back off the agent's output file: `jq -r 'select(.type=="assistant") | .message.content[]? | select(.type=="text") | .text' <output_file> | tail -c 5000`.
- **When the Stop hook flags uncommitted edits while agents run**, they are the agents' work in progress: run `git status`, push what the orchestrator owns, and stop. Committing an agent's half-done files collides with its own commit.
