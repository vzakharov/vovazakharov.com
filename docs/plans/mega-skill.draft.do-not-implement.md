> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) _before_ touching code.

# `/mega` — a huge task, run near-autonomously, with an operator who drops in

The ask, verbatim:

> давай сделаем скилл /mega исходя из #95 и заметок "мегазверя". основная суть: огромная задача, выполняется фактически автономно, но оператор (в силу длительности выполнения) периодически заходит, смотрит прогресс, вносит какие-то замечания, предложения и (иногда весьма драматично) меняет вектор

(#95 was a slip, corrected to #57, the mushroom game's PR.)

## Sources

- **The megabeast notes**: `.claude/skills/megabeast/notes/` (six files by theme, ~100 KB). What sessions on PR #57 learned about the loop, written for this skill.
- **PR #57's thread**: `docs/pr/57/pr.md` (exported). It shows how the operator actually dropped in: 19 bites (1–18 plus 12b), about 50 sessions over 9 days, two big re-steers, and a stream of play notes.
- **The run's own plan** at its last state: `git show 9bcb67b1:docs/plans/mushroom-game-syama.completed.md`, its § "How this elephant is eaten" and standing rules, plus `decisions.md` and `to-check.md` beside it.

#57 was a game, and `/mega` is not limited to games: the same loop has to carry a large feature inside an existing product with a client and a server. So the skill says "see" and "use" where the notes say "play", and keeps game specifics out (§ "Files").

## What the skill is

`/mega` runs one elephant (`.claude/skills/plan/elephant.md`) end to end without the operator in between bites. The loop is: plan, then for each bite a build, a review by subagents in the bite's tail, a fold into the plan, and a relay. The last bite ends in `/finalize` with no merge. The loop itself has already been worked out in the notes. What is new here is the **operator's side**.

**The operator's say is asynchronous.** The run is unattended and does not solicit: it makes every call itself — what to plan, where a change goes, which option a fork takes, how a re-steer lands — and never waits for an answer. The operator drops in at times of their choosing, sees where things stand in under a minute, and says something into the run. When they ask for a call to go the other way, the run reverses it like any other change. Nothing is held for them.

Two things are therefore designed here and not just distilled:

1. **The dashboard** — what the operator sees on dropping in.
2. **The intake** — how each message is sorted and where it lands, from a question up to a re-steer.

### Entry

- **`/mega <task>`** writes the megaplan in its run shape from bite 1, with every file and section below. It publishes the plan as a draft PR and stops at **one gate**: the operator reviews the plan. Their go-ahead is the last thing the run asks of them.
- **Picking a run up is `/relay take <branch>`**, which every relay already starts its successor with. It reads the relay summary and then the plan, whose loop section tells the session it is a `/mega` run and which reference file to open. An operator starting a session by hand on a mega branch types the same line. `/mega` has no pickup form of its own.

### The dashboard

From PR #57: the operator looked at committed frames (their largest idea, T93, was anchored on a PNG), played the per-bite Artifact, and read the plan. They did not use the PR body: it went stale (it missed bites 17–18), and its QA checklist grew to 380 lines that took ages just to scroll. So:

- **A `## Where it stands` block at the top of the PR body**, rewritten (not appended) at every bite's end and every wave report. It is at most ~15 lines and holds:
  - the bite in flight and its step;
  - what can be seen or used now, and how. An Artifact when the work can be wrapped in one (a standalone page, a game, a component); otherwise the way to reach it (a `/preview` route, screenshots on the branch, a command to run), or "nothing to see yet";
  - what waits on the operator: the count of the QA checklist's top list (below);
  - the **live session's link** and its depth, kept current at every relay, so the operator always knows where chat goes;
  - the last re-steer and where it landed in the plan.
- **What waits on the operator heads the QA checklist**, as a list of its own above every other step: hand checks only a person can make, and the taste calls the run took for them (§ "The intake"). It replaces #57's separate `to-check.md`, and is in the operator's language. `/mega` gets it there by passing that as focus guidance to `/qa-checklist`, so the vendored skill stays untouched.
- **Screenshots and the Artifact** keep the shape they had on #57 where the work has them: screenshots committed per bite, previous ones retired with a tombstone; one Artifact URL republished in place, mid-bite as well whenever a visible batch lands.

**The PR body has a size cap, with hysteresis**, for every PR and not only for `/mega`: #57's body grew until it stopped being read. `scripts/check-pr-body-size.sh` joins `vet.sh`. It reads the branch's PR body through `gh` and passes when there is no PR. A body may grow to **400 lines**; once it has crossed that, it passes again only at **300 or under**, so one trim buys room for many additions rather than a few lines each session. "Has crossed" is read off the body's edit history (GraphQL `userContentEdits`), the way `check-claude-md-size.sh` reads git history, so the check keeps no state. The failure message names what goes first: checked QA steps, then the summary's detail. The crossing rule is a pure function over the past lengths, with a test beside it.

### The intake

The operator reaches the run on two channels, and neither needs a subscription:

- **Chat in the live session**, whose link is on the dashboard. A `/handle` typed there is taken through the intake like any other message.
- **PR comments and reviews**, which every bite's end takes in before folding: it re-exports the PR and treats each thread whose tail is the operator's as a message. So a comment waits at most until the current bite ends.

Every message is first appended to the **operator log** (below). A reply goes in the operator's language, including on a turn woken by an agent's English report. Then the message is sorted into exactly one of these:

- **Question** — asks, changes nothing. Answered from the plan **and** the idea docs, with agents still running. It reaches the plan only if the answer changes what gets built. A "why?" about a call the run made is a question, not a request to undo it: it gets the call's reason and whether that reason still holds.
- **Change** — a fix, a tweak or an addition. It goes through `/task`'s plan-or-not call, and a subagent builds it. **The orchestrator decides where it goes**: at once in parallel with the bite, into the bite, into a later bite, or into `## Rest of the elephant`. It writes that placement into the plan in a commit of its own, quoting the operator's words. Work a running agent holds goes to that agent by `SendMessage`.
- **Idea to weigh** — "don't put it in a plan yet", or a direction with open forks. Kept verbatim in an ideas doc. The plan gets only the task of writing the weighing doc. Once ideas are partly built, the plan says which half is built and which is unplaced.
- **Re-steer** — changes what the thing _is_. See below.
- **Cut** — drops scope. Written into the plan with their words before anything else happens.
- **Pause / take over** — "I'll take it by hand". A relay with no `create_session`: the successor line goes to the operator, and the depth resets.

**A taste call is never held for the operator.** Some calls only a person can judge, by using the result: how a game feels, how fast a UI has to answer, how a page reads, how a flow or an API sits in the hand. #57 held such calls while the operator was present. `/mega` takes its recommended option, builds it, and puts the call at the top of the QA checklist: what it picked, the alternative, and what switching would cost. Groups that don't depend on the call go ahead meanwhile.

**A re-steer** follows what the notes learned, and adds the one lesson #57 paid most for:

1. The message is quoted into the plan's standing rules or decisions, and committed on its own.
2. **The orchestrator judges each piece in flight and each piece already built against the new direction.** One that still makes sense under it is finished or kept. One that doesn't is landed at a pushed step and marked unplaced. When the operator names the timing themselves ("after this bite"), their words decide.
3. `## Rest of the elephant` is rewritten, with what is already built marked built or unplaced.
4. **Then the new direction's forks are settled in one design doc before any of it is built.** The run settles them itself, and the doc says what it picked and why, so the operator can overturn any of it later. #57's walking arrived in stages (crop → pan → walk → endless field), and each stage threw away the one before.

### The operator log

`docs/plans/<slug>/operator-log.md` holds every operator message of the run, verbatim and in order, from the first to the last, with a `## Bite N` heading per bite. Each entry carries the time, the session's link and the channel (chat or the PR comment's link), followed by the run's reply condensed to a line. It is appended when the message arrives, not at relay, so a session that dies before relaying loses nothing. It makes the run's whole conversation readable without git archaeology. The relay summaries keep their own condensed copy, as `/relay` already writes it.

## Files

The skill reads by phase: a session opens only the reference file its current step needs. The notes measured ~38k tokens for a session that read them whole before its first brief.

- **`.claude/skills/mega/SKILL.md`** — the entry, the loop in one screen, the asynchronous-operator rule, the session-as-orchestrator rule, and which file each phase opens.
- **`.claude/skills/mega/start.md`** — writing the megaplan: the split shape from bite 1, the loop section and standing rules from the template, the run's model named, the dashboard block, a spike into the dependency's risky seam before bite 1, and a look recipe written alongside the work when it has something to see.
- **`.claude/skills/mega/operator.md`** — opened whenever the operator says something, and at each bite's end when the dashboard is rewritten: the dashboard, the intake and the operator log above.
- **`.claude/skills/mega/orchestrate.md`** — subagents: one step per agent; a committed common brief; waves by file, each staged by what its result depends on; per-agent worktrees landing one squash from `wt/<pkg>`; check-ins and 170k notices; restarts and resumes; the model passed explicitly to every agent.
- **`.claude/skills/mega/bite-end.md`** — the tail, in order: the PR's comments taken in; suite at the tail's start; quick gates including knip; `/polish` as sized waves with the bare `polish:` last; vet in parts; screenshots; retiring the last bite's leftovers; the 450-line check; folding and splitting the plan; resyncing the squash proposal; the Artifact; the dashboard and the QA checklist's top list; the journal; the relay.
- **`.claude/skills/mega/review.md`** — the review as tail subagents, a user and a reader. The user drives the built thing the way its users would, from screenshots first when it has a UI. Findings each carry an `Ask:`; a calls file comes before any fix; the agent-authorship marker; the five-percent file frozen; the device failure-mode list; sweeps over the states a user actually reaches.
- **`.claude/skills/mega/relay.md`** — the loop's own relay rules: depth read from `lineage`; never `reset --hard`, and a stale ref is renamed aside; dependencies installed after checkout; subagents stopped before the hand-off; `pull --no-rebase` early on; the cap-depth hand-off at a natural stop, with the line to paste.
- **`.claude/skills/mega/look.md`** — for work with something to see or drive: the drive script; stepping the clock instead of timing a screenshot; reading runtime state beside each shot; a red that is the work's gets fixed, one that is the harness's own goes to the QA checklist's top list; the Artifact recipe.
- **`.claude/skills/mega/templates/`** — the plan's loop section with its standing rules (calls numbered `22\.` so prettier leaves them alone), `brief-common.md`, `review-brief.md`, the dashboard block, the operator log's entry.
- **`.claude/skills/mega/journal.md`** — where each run session writes what it learned before its relay, as the notes did. A run's last bite distills the journal into the files above and empties it.
- **`.claude/skills/megabeast/retired.md`** — a tombstone: the last commit holding `notes/`, the `git show` recipe, and where each theme went.
- **`.claude/skills/plan/elephant.md` § "Unattended runs"** — the pointer moves from the notes to `/mega`.
- **`scripts/check-pr-body-size.sh`**, its test, and its line in `vet.sh` — the cap above.

**Game-only facts** (Phaser's `Graphics` re-tessellation, `Scale.RESIZE` ignoring DPR, the five screens, play notes as the main input) are not copied into the skill. `look.md` keeps the general lesson each one taught (for example "count draw calls, not milliseconds"), and the specifics stay readable through the tombstone.

**A coverage table** maps every note to its destination, or to "dropped, because …". It goes to `docs/remove-before-merging/mega-coverage.md`, so the review can check that nothing fell out. `/finalize` sweeps it.

## Not in this PR

Several notes ask for fixes in skills vendored from `vzakharov/muthur`:

- `/relay take` should read `relay.md` before the attach;
- `/from-branch` should never `reset --hard`, and never delete the auto-branch at pickup;
- `gh pr edit` → REST;
- the export's authorship label;
- the test glob reaching into `tmp/`.

`/mega` carries its own wording for each, where its sessions need it (for example the "never reset" line in the successor's prompt). The plan proposes them as muthur issues and files none. See question 1.

## Order

1. Write the coverage table first, against the notes and the thread. It is the skeleton every file is written to.
2. `SKILL.md` and `operator.md`, which hold the new design.
3. `start.md`, `relay.md`, `orchestrate.md`, `bite-end.md`, `review.md`, `look.md` and `templates/`, distilled from the table. These are file-disjoint, so they can go in parallel to agents briefed with their rows.
4. `journal.md`, the tombstone, and the `elephant.md` pointer.
5. `scripts/check-pr-body-size.sh` with its test, wired into `vet.sh`. It is independent of the skill files, so it can run beside step 3.
6. A fresh-eyes check: a subagent with only the skill, and none of the notes, walks a made-up run on a non-game task through four drop-ins (a question, a change mid-wave, an idea to weigh, a re-steer mid-bite) and reports where the skill left it guessing.
7. `scripts/check-skill-catalog.sh`, prettier, then `/polish`.

**The new `SKILL.md` adds a row to the skill listing every session loads**, so it enters through `scripts/staged.sh` if the script supports a new path. If it doesn't, it lands in place, and that is said in the PR.

## DRY notes

- **Reused by pointer, never restated:**
  - the elephant's shape and bite sizing: `plan/elephant.md`;
  - the relay mechanics and the pickup: `/relay`;
  - the plan-or-not call for a change: `/task`;
  - the QA checklist, with the top list passed as focus guidance: `/qa-checklist`;
  - the auto-relay opt-in, which already ends a budget pause with a relay: `.claude/context-budget/auto-relay/`. This replaces the notes' "the contract outranks the notice";
  - the quality passes: `/polish`;
  - land prep: `/finalize` (without `and merge`);
  - the 170k subagent notice: the context-budget hook;
  - the reply language: the operator's voice entry.

  `/mega` says what to run when, and in what order, never how those skills work inside.

- **Shared within the skill:** the brief conventions live once in `templates/brief-common.md`. Every per-agent brief points at it and adds only its own steps, files and off-limits list. On #57 that pattern ran six groups with no collisions.
- **Duplicated on purpose:** the few vendored-skill fixes above, written as `/mega`'s own instructions, because editing muthur's copies here forks them silently at the next `/update-muthur`.
- **Not extracted:** a script for the dashboard block. It is ~15 lines of prose rewritten by judgment at each bite's end, so a generator would have to know what "where it stands" means.
- **Not shared:** the body cap's hysteresis with `check-claude-md-size.sh`. The rule is the same, but one reads git history and the other GitHub's edit history, and the shared part is a two-line comparison. A common helper would also couple a repo-local script to a vendored one.

## Questions

1. **Where `/mega` lives.** **a)** Here, as this repo's own skill, with muthur issues proposed for the vendored fixes. **b)** Upstream in muthur from the start. _Recommendation: a._ The loop was learned on this repo's stack, and it needs a second run before anyone can tell which parts are general.
2. **The gate.** **a)** `/mega <task>` stops once, at the plan's review, then runs. **b)** No gate: the prompt is the go-ahead, and the plan is published only for reading. _Recommendation: a._ #57's plan was approved before "fully autonomous" was said, and the first bite's shape is the cheapest point to re-steer.
3. **The notes.** **a)** Distill them into the skill, retire them behind a tombstone, and have runs write into `journal.md` from now on. **b)** Keep `notes/` alive beside the skill as its journal. _Recommendation: a._ The notes are 100 KB, and a journal that grows without being distilled is the bloat the plan split was invented for.
4. **The run's model.** **a)** `/mega` names the starting session's own model in the plan, and passes it to every `create_session` and `Agent`. **b)** It always pins Opus. _Recommendation: a._ "Opus throughout" was #57's ruling for that task. What the skill must enforce is "named, never inherited", not which model it is.
5. **The operator's record.** **a)** The operator log above: one file, appended as each message arrives. **b)** Relay summaries kept instead of overwritten, renamed `relay-bite-0N-session-0M.md`, with `relay.md` always the latest. _Recommendation: a._ It is written when the message arrives, so chat to a session that dies before relaying is not lost. It holds the operator's words whole, where a summary condenses long ones. And it needs no edit to the vendored `/relay`, which (b) does, since `/relay` overwrites `relay.md`.
