> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) _before_ touching code.

# `/golem` — a huge task, run near-autonomously, with an operator who drops in

The ask, verbatim:

> давай сделаем скилл /mega исходя из #95 и заметок "мегазверя". основная суть: огромная задача, выполняется фактически автономно, но оператор (в силу длительности выполнения) периодически заходит, смотрит прогресс, вносит какие-то замечания, предложения и (иногда весьма драматично) меняет вектор

(#95 was a slip, corrected to #57, the mushroom game's PR.)

## Sources

- **The megabeast notes**: `.claude/skills/megabeast/notes/` (six files by theme, ~100 KB). What sessions on PR #57 learned about the loop, written for this skill.
- **PR #57's thread**: `docs/pr/57/pr.md` (exported). It shows how the operator actually dropped in: 19 bites (1–18 plus 12b), about 50 sessions over 9 days, two big re-steers, and a stream of play notes.
- **The run's own plan** at its last state: `git show 9bcb67b1:docs/plans/mushroom-game-syama.completed.md`, its § "How this elephant is eaten" and standing rules, plus `decisions.md` and `to-check.md` beside it.

#57 was a game, and `/golem` is not limited to games: the same loop has to carry a large feature inside an existing product with a client and a server. So the skill says "see" and "use" where the notes say "play", and keeps game specifics out (§ "Files"). It is written for `vzakharov/muthur` from the start: nothing in it names this repo's stack, and what this repo needs beyond that is said where it already lives (`.claude/rules/`, this repo's `CLAUDE.md`).

## What the skill is

`/golem` runs one elephant (`.claude/skills/plan/elephant.md`) end to end without the operator in between bites. The loop is: plan, then for each bite a build, a review by subagents in the bite's tail, and a fold into the plan. The last bite ends in `/finalize` with no merge. The loop itself has already been worked out in the notes. What is new here is the **operator's side**. A plain elephant stops after every bite for the operator's review and the next `/go`; `/golem` is that elephant with nobody between the bites, and `elephant.md` § "Unattended runs" becomes a one-line pointer to it.

**A run relays at the context-budget pause, never at a bite's end as such.** A session with room left goes on to the next bite, skipping the ~58–115k a fresh session spends on orientation and the pickup's friction (a stale branch, the wrong lockfile installed, the reply language drifting to English). The fold at a bite's end is still written whole, so a relay can land anywhere after it. In practice one bite fills a session on #57's scale, so most relays still fall near a bite's end. **The pause always relays**, whatever the operator's own `auto-relay/<handle>` says: the context-budget hook reads a run's operator log (§ "The operator log") as `on`, and its notice names that as the reason.

**The operator's say is asynchronous.** The run is unattended and does not solicit: it makes every call itself — what to plan, where a change goes, which option a fork takes, how a re-steer lands — and never waits for an answer. The operator drops in at times of their choosing, sees where things stand in under a minute, and says something into the run. When they ask for a call to go the other way, the run reverses it like any other change. Nothing is held for them.

**Its reach ends at its own branch and PR.** Inside them it decides everything. Outside them it decides nothing: merging (which here is deploying), pushing to another branch or repo, deleting a ref it did not create, posting anywhere but its own PR, any external service or paid account, anything public. Such a step is never taken; it goes on the operator's list (§ "The dashboard") as the exact command, with what it is for, and the work that needs it waits while everything else goes on. The auto-mode classifier is a second line behind this rule, never the first. **The same list catches a stuck run**: a failure that survives three attempts of different kinds is parked there with what was tried, and the run moves on to work that does not depend on it, rather than escalating its means.

**A bite is not done until the run has seen its result with its own means.** Unattended means nobody checks a result but the run, and on #57 bite 3 shipped every tap dead with vet green. The means fit the bite: `/preview` routes, a test, a command that exercises the API, a script that drives the UI. They are built inside the bite that first needs them, beside its work, never as a bite of their own ahead of the features: test-first where the behavior is known before the code (logic, an API's contract), after the code where it is known only by looking (a screen, a feel). The general part, a harness every later bite reuses, stays in the tree; the plan's bite contract names how that bite's result gets seen.

Two things are therefore designed here and not just distilled:

1. **The dashboard** — what the operator sees on dropping in.
2. **The intake** — how each message is sorted and where it lands, from a question up to a re-steer.

### Entry

- **`/golem <task>`** writes the megaplan in its run shape from bite 1, with every file and section below. It publishes the plan as a draft PR and stops at **one gate**: the operator reviews the plan. Their go-ahead is the last thing the run asks of them. Before writing anything it reads its own model and effort with `get_session`; below Opus at high effort it says, in its first reply and on the dashboard, that the run may not hold up on it. Each pickup repeats the check, because `create_session` passes the model but not the effort.
- **Picking a run up is `/relay take <branch>`**, which every relay already starts its successor with. It reads the relay summary and then the plan, whose loop section tells the session it is a `/golem` run and which reference file to open. An operator starting a session by hand on a golem branch types the same line. `/golem` has no pickup form of its own.

### The dashboard

From PR #57: the operator looked at committed frames (their largest idea, T93, was anchored on a PNG), played the per-bite Artifact, and read the plan. They did not use the PR body: it went stale (it missed bites 17–18), and its QA checklist grew to 380 lines that took ages just to scroll. So:

- **A `## Where it stands` block at the top of the PR body**, rewritten (not appended) at every bite's end and every wave report. Everything "here and now" is in it, and nowhere else:
  - the bite in flight and its step;
  - what can be seen or used now, and how. An Artifact when the work can be wrapped in one (a standalone page, a game, a component); otherwise the way to reach it (a `/preview` route, screenshots on the branch, a command to run), or "nothing to see yet";
  - the **live session's link** and its depth, kept current at every relay, so the operator always knows where chat goes;
  - the last re-steer and where it landed in the plan;
  - **what waits on the operator**, in full, in their language: hand checks only a person can make, the taste calls the run took for them (§ "The intake"), and the out-of-reach steps and stuck failures above. It replaces #57's separate `to-check.md`. An item leaves the list when the operator answers it or the run makes it moot.

  The block's own lines stay at ~10; the list is as long as it is, because a long list is itself what the operator needs to see. The QA checklist below it is `/qa-checklist`'s, untouched.

- **Screenshots and the Artifact** keep the shape they had on #57 where the work has them: screenshots committed per bite, previous ones retired with a tombstone; one Artifact URL republished in place, mid-bite as well whenever a visible batch lands.

**The PR body has a size cap, with hysteresis**, for every PR and not only for `/golem`: #57's body grew until it stopped being read. `scripts/check-pr-body-size.sh` joins `vet.sh`. It reads the branch's PR body through `gh` and passes when there is no PR. The cap counts **characters**, since an agent may write a paragraph as one line: a body may grow to **32,000**; once it has crossed that, it passes again only at **24,000 or under**, so one trim buys room for many additions rather than a few lines each session. Those are the 400 and 300 lines first proposed, at a standard 80 characters a line. Of this repo's last 60 PR bodies only #57's crosses it (106k characters in 449 lines); the next largest is 21k, and the median 5.6k. "Has crossed" is read off the body's edit history (GraphQL `userContentEdits`), the way `check-claude-md-size.sh` reads git history, so the check keeps no state. The failure message names what goes first: checked QA steps, then the summary's detail. The crossing rule is a pure function over the past lengths, with a test beside it.

### The intake

The operator reaches the run on two channels, and neither needs a subscription:

- **Chat in the live session**, whose link is on the dashboard. A `/handle` typed there is taken through the intake like any other message.
- **PR comments and reviews**, which every bite's end takes in before folding: it re-exports the PR and treats each thread whose tail is the operator's as a message. So a comment waits at most until the current bite ends.

**A run never calls `subscribe_pr_activity`, and never offers to**, though the host harness asks it to offer after opening a PR. A subscription wakes the session on every comment, CI result and conflict, mid-bite, and the harness's rules for a PR the session opened then demand each be worked at once, which takes the orchestrator off its bite on the harness's schedule rather than the run's. The bite's end is where comments are taken in.

Every message is first appended to the **operator log** (below). A reply goes in the operator's language, including on a turn woken by an agent's English report. Then the message is sorted into exactly one of these:

- **Question** — asks, changes nothing. Answered from the plan **and** the idea docs, with agents still running. It reaches the plan only if the answer changes what gets built. A "why?" about a call the run made is a question, not a request to undo it: it gets the call's reason and whether that reason still holds.
- **Change** — a fix, a tweak, an addition or a cut. It goes through `/task`'s plan-or-not call, and a subagent builds it. **The orchestrator decides where it goes**: at once in parallel with the bite, into the bite, into a later bite, or into `## Rest of the elephant`. It writes that placement into the plan in a commit of its own, quoting the operator's words. Work a running agent holds goes to that agent by `SendMessage`. A cut places the same way, as a removal: an agent building the cut piece lands at a pushed step and stops, `## Rest of the elephant` drops it, and what is already built is taken out in its own commit, unless something kept depends on it, in which case it stays and the plan says why.
- **Idea to weigh** — "don't put it in a plan yet", or a direction with open forks. Kept verbatim in an ideas doc. The plan gets only the task of writing the weighing doc. Once ideas are partly built, the plan says which half is built and which is unplaced.
- **Re-steer** — changes what the thing _is_. See below.
- **Pause / take over** — "I'll take it by hand". A relay with no `create_session`: the successor line goes to the operator, and the depth resets.

**A taste call is never held for the operator.** Some calls only a person can judge, by using the result: how a game feels, how fast a UI has to answer, how a page reads, how a flow or an API sits in the hand. #57 held such calls while the operator was present. `/golem` takes its recommended option, builds it, and puts the call on the operator's list in `## Where it stands`: what it picked, the alternative, and what switching would cost. Groups that don't depend on the call go ahead meanwhile.

**A re-steer** follows what the notes learned, and adds the one lesson #57 paid most for:

1. The message is quoted into the plan's standing rules or decisions, and committed on its own.
2. **The orchestrator judges each piece in flight and each piece already built against the new direction.** One that still makes sense under it is finished or kept. One that doesn't is landed at a pushed step and marked unplaced. When the operator names the timing themselves ("after this bite"), their words decide.
3. `## Rest of the elephant` is rewritten, with what is already built marked built or unplaced.
4. **Then the new direction's forks are settled in one design doc before any of it is built.** The run settles them itself, and the doc says what it picked and why, so the operator can overturn any of it later. #57's walking arrived in stages (crop → pan → walk → endless field), and each stage threw away the one before.

### The operator log

`docs/plans/<slug>/operator-log.md` holds the run's whole conversation with the operator, verbatim and in order, from the first message to the last, with a `## Bite N` heading per bite. It makes that conversation readable without git archaeology. The relay summaries keep their own condensed copy, as `/relay` already writes it.

**Hooks write it, not the agent**, so nothing in it is paraphrased or forgotten, and both halves are kept whole:

- **Chat**: a `UserPromptSubmit` hook appends the operator's message as it arrives, with the time and the session's link; a `Stop` hook appends the run's reply to it, the turn's last message. A prompt the harness injects (a task notification, a wake, a subagent's hand-back) opens with its own tag and is skipped by it. Both hooks do nothing on a branch with no operator log, so they cost every other session one file check.
- **PR comments**: `scripts/golem-log-pr.sh`, run by the bite's end after its re-export, appends each thread whose tail is the operator's, with the comment's link. The run's reply is on GitHub, so the entry links it rather than copying it.

The hooks append on the spot, so a session that dies before relaying loses nothing. Each append is committed with the next commit the session makes; the bite's end commits what is left. Sessions never read the log whole: the intake reads only the current bite's section. Tool calls stay out of it: they would bury the conversation the log exists to keep readable, and each entry's session link already leads to the transcript that holds them.

## Files

The skill reads by phase: a session opens only the reference file its current step needs. The notes measured ~38k tokens for a session that read them whole before its first brief.

- **`.claude/skills/golem/SKILL.md`** — the entry, the loop in one screen, the asynchronous-operator rule, the session-as-orchestrator rule, and which file each phase opens.
- **`.claude/skills/golem/start.md`** — writing the megaplan: the split shape from bite 1, the loop section and standing rules from the template, the run's model named, the dashboard block, a spike into the dependency's risky seam before bite 1, and each bite's contract naming how its result gets seen.
- **`.claude/skills/golem/operator.md`** — opened whenever the operator says something, and at each bite's end when the dashboard is rewritten: the dashboard, the intake and the operator log above.
- **`.claude/skills/golem/orchestrate.md`** — subagents: one step per agent; a committed common brief; waves by file, each staged by what its result depends on; per-agent worktrees landing one squash from `wt/<pkg>`; check-ins and 170k notices; restarts and resumes; the model passed explicitly to every agent.
- **`.claude/skills/golem/bite-end.md`** — the tail, in order: the PR's comments taken in; suite at the tail's start; quick gates including knip; `/polish` as sized waves with the bare `polish:` last; vet in parts; screenshots; retiring the last bite's leftovers; the 450-line check; folding and splitting the plan; resyncing the squash proposal; the Artifact; the dashboard; the journal. Then the next bite, or the relay when the budget pause has fired.
- **`.claude/skills/golem/review.md`** — the review as tail subagents, a user and a reader. The user drives the built thing the way its users would, from screenshots first when it has a UI. Findings each carry an `Ask:`; a calls file comes before any fix; the agent-authorship marker; the five-percent file frozen; the device failure-mode list; sweeps over the states a user actually reaches.
- **`.claude/skills/golem/relay.md`** — the loop's own relay rules: depth read from `lineage`; dependencies installed after checkout; subagents stopped before the hand-off; `pull --no-rebase` early on; the cap-depth hand-off at a natural stop, with the line to paste. The safe attach is not here: it moves into `/relay take` itself (§ "Vendored fixes").
- **`.claude/skills/golem/look.md`** — for work with something to see or drive: the drive script; stepping the clock instead of timing a screenshot; reading runtime state beside each shot; a red that is the work's gets fixed, one that is the harness's own goes on the operator's list; the Artifact recipe.
- **`.claude/skills/golem/templates/`** — the plan's loop section with its standing rules (calls numbered `22\.` so prettier leaves them alone), `brief-common.md`, `review-brief.md`, the dashboard block, the operator log's entry.
- **`.claude/skills/golem/journal.md`** — where each run session writes what it learned before its relay, as the notes did. A run's last bite distills the journal into the files above and empties it.
- **`.claude/skills/megabeast/retired.md`** — a tombstone: the last commit holding `notes/`, the `git show` recipe, and where each theme went.
- **`.claude/skills/plan/elephant.md` § "Unattended runs"** — the pointer moves from the notes to `/golem`.
- **`scripts/check-pr-body-size.sh`**, its test, and its line in `vet.sh` — the cap above.
- **`.claude/hooks/golem-operator-log.sh`**, its `UserPromptSubmit` and `Stop` entries in `.claude/settings.json`, and **`scripts/golem-log-pr.sh`** — the operator log's writers, with tests for the injected-prompt skip and the no-log no-op.

**Game-only facts** (Phaser's `Graphics` re-tessellation, `Scale.RESIZE` ignoring DPR, the five screens, play notes as the main input) are not copied into the skill. `look.md` keeps the general lesson each one taught (for example "count draw calls, not milliseconds"), and the specifics stay readable through the tombstone.

**A coverage table** maps every note to its destination, or to "dropped, because …". It goes to `docs/remove-before-merging/golem-coverage.md`, so the review can check that nothing fell out. `/finalize` sweeps it.

## Vendored fixes

Several notes ask for fixes in skills vendored from `vzakharov/muthur`, and this PR makes them in the vendored copies here, an elephant inside the elephant:

- **`/relay take` attaches safely.** It reads `relay.md` from `origin/<branch>` with `git show` before attaching, so the summary's rules arrive before the attach rather than after it. The attach unshallows, fast-forwards when it can, and moves a genuinely diverged local ref aside (`git branch -m <branch> stale/<…>`) rather than running `reset --hard`. On #57, a successor attached by `create_session` came up detached or stale, a `reset --hard` that auto mode let through got bite 9's and bite 10's sessions refused every later command, and the "never reset" line rode in every successor's prompt only because the summary was read too late to say it.
- **`/from-branch`'s force-pushed case** renames the stale ref aside the same way, in place of its `reset --hard`.
- **`gh pr edit` → REST**, the export's authorship label, and the test glob reaching into `tmp/`.
- **The context-budget hook** reads a branch with an operator log as `auto-relay` `on`.

muthur already fixed the notes' other pickup complaint, the auto-branch deleted at pickup (vzakharov/muthur#132), and this repo is three commits behind it. So the first step is `/update-muthur`, and the fixes above land on top of what it brings. Each fix is recorded against its path in `.claude/skills/update-muthur/watermark.json` as a local change, so the next sync reads it rather than overwriting it.

**Once the PR is finalized**, the run files one issue on `vzakharov/muthur` linking it, asking for `/golem` and these fixes to be adopted in general form. The operator asked for that issue, so it is in the run's reach.

## Order

1. `/update-muthur`, so the vendored fixes start from muthur's current copies.
2. Write the coverage table, against the notes and the thread. It is the skeleton every file is written to.
3. `SKILL.md` and `operator.md`, which hold the new design.
4. `start.md`, `relay.md`, `orchestrate.md`, `bite-end.md`, `review.md`, `look.md` and `templates/`, distilled from the table. These are file-disjoint, so they can go in parallel to agents briefed with their rows.
5. `journal.md`, the tombstone, and the `elephant.md` pointer.
6. Beside step 4, each file-disjoint from it and from the others: `scripts/check-pr-body-size.sh` with its test, wired into `vet.sh`; the operator log's hook and script with their tests; the vendored fixes, with their watermark notes.
7. A fresh-eyes check: a subagent with only the skill, and none of the notes, walks a made-up run on a non-game task through five drop-ins (a question, a change mid-wave, a cut, an idea to weigh, a re-steer mid-bite) and one out-of-reach step, and reports where the skill left it guessing.
8. `scripts/check-skill-catalog.sh`, prettier, then `/polish`.
9. After `/finalize`, the muthur issue.

**The new `SKILL.md` adds a row to the skill listing every session loads**, so it enters through `scripts/staged.sh` if the script supports a new path. If it doesn't, it lands in place, and that is said in the PR.

## DRY notes

- **Reused by pointer, never restated:**
  - the elephant's shape and bite sizing: `plan/elephant.md`;
  - the relay mechanics and the pickup: `/relay`;
  - the plan-or-not call for a change: `/task`;
  - the QA checklist: `/qa-checklist`, untouched;
  - the budget pause ending in a relay: the context-budget hook's auto-relay path, which a run turns on by its operator log. This replaces the notes' "the contract outranks the notice";
  - the thread export and its authorship label: `scripts/export-github-item.py`, which `golem-log-pr.sh` reads rather than re-fetching;
  - the quality passes: `/polish`;
  - land prep: `/finalize` (without `and merge`);
  - the 170k subagent notice: the context-budget hook;
  - the reply language: the operator's voice entry.

  `/golem` says what to run when, and in what order, never how those skills work inside.

- **Shared within the skill:** the brief conventions live once in `templates/brief-common.md`. Every per-agent brief points at it and adds only its own steps, files and off-limits list. On #57 that pattern ran six groups with no collisions.
- **Fixed where they live:** the vendored fixes go into the vendored copies, not into `/golem` as its own wording, so there is one statement of each. The watermark note is what keeps the next `/update-muthur` from overwriting them silently, until muthur takes them.
- **Not extracted:** a script for the dashboard block. It is ~10 lines of prose rewritten by judgment at each bite's end, so a generator would have to know what "where it stands" means.
- **Not shared:** the body cap's hysteresis with `check-claude-md-size.sh`. The rule is the same, but one reads git history and the other GitHub's edit history, and the shared part is a two-line comparison. A common helper would also couple a repo-local script to a vendored one.

## Questions

Questions 1–3 and 6 are settled and folded in above: `/golem` lives here first, written for muthur; one gate, at the plan's review; the notes are distilled and retired; and the skill the ask called `/mega` is `/golem`, which works without rest by the words put in its head (here, the plan) and, left unwatched, needs exactly the reach rule above. Upstream-first was ruled out because the loop needs a second run before its general parts are known; no gate, because the first bite's shape is the cheapest point to re-steer; keeping `notes/` as a live journal, because 100 KB that grows undistilled is the bloat the plan split exists to stop. For the name, `/mega` named only the size; `/behemoth`, `/roc`, `/jumbo`, `/mahout`, `/kraken`, `/leviathan`, `/autopilot` and `/yolo` were weighed, and the operator picked the golem.

4. **The run's model.** **a)** `/golem` names the starting session's own model in the plan, and passes it to every `create_session` and `Agent`, warning when it is below Opus at high effort (§ "Entry"). **b)** It always pins Opus. _Recommendation: a._ "Opus throughout" was #57's ruling for that task. What the skill must enforce is "named, never inherited", and that a weaker start is said out loud, not which model it is.
5. **The operator's record.** **a)** The operator log above: one file, written by hooks as each message and reply arrives. **b)** Relay summaries kept instead of overwritten, renamed `relay-bite-0N-session-0M.md`, with `relay.md` always the latest. _Recommendation: a._ It is written when the message arrives, so chat to a session that dies before relaying is not lost. It holds both sides whole, where a summary condenses them. And a run that goes on past a bite's end without relaying writes no summary at all for that bite.
