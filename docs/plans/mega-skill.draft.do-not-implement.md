> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source while this file is named `*.draft.do-not-implement.md` — prep and spikes go in `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md` and delete this banner (quoting the go-ahead in the commit) _before_ touching code.

# `/mega` — a huge task, run near-autonomously, with an operator who drops in

The ask, verbatim:

> давай сделаем скилл /mega исходя из #95 и заметок "мегазверя". основная суть: огромная задача, выполняется фактически автономно, но оператор (в силу длительности выполнения) периодически заходит, смотрит прогресс, вносит какие-то замечания, предложения и (иногда весьма драматично) меняет вектор

(#95 was a slip, corrected to #57, the mushroom game's PR.)

## Sources

- **The megabeast notes**: `.claude/skills/megabeast/notes/` (six files by theme, ~100 KB). What sessions on PR #57 learned about the loop, written for this skill.
- **PR #57's thread**: `docs/pr/57/pr.md` (exported). It shows how the operator actually dropped in: 19 bites (1–18 plus 12b), about 50 sessions over 9 days, two big re-steers, and a stream of play notes.
- **The run's own plan** at its last state: `git show 9bcb67b1:docs/plans/mushroom-game-syama.completed.md`, its § "How this elephant is eaten" and standing rules, plus `decisions.md` and `to-check.md` beside it.

## What the skill is

`/mega` runs one elephant (`.claude/skills/plan/elephant.md`) end to end without the operator in between bites. The loop is: plan, then for each bite a build, a review by subagents in the bite's tail, a fold into the plan, and a relay. The last bite ends in `/finalize` with no merge. The loop itself has already been worked out in the notes. What is new here is the **operator's side**. Because the run takes days, the operator comes back at times of their choosing. They need to see where things stand in under a minute, and say something into the run — a nit, an idea, or a turn of direction — without knowing which session is live, or caring.

Two things are therefore designed here and not just distilled:

1. **The dashboard** — what the operator sees on dropping in.
2. **The intake** — how each message is sorted and where it lands, from a question up to a re-steer.

### Entry points

- **`/mega <task>`** writes the megaplan in its run shape from bite 1, with every file and section below. It publishes the plan as a draft PR and stops at **one gate**: the operator reviews the plan, and answers its forks if there are any. Their go-ahead is the last thing the run asks of them, apart from the unrecoverable.
- **`/mega` bare, or `/mega <branch>`** picks up a run: attach, read the plan's loop and the relay summary, then take the next step. `/relay take` on a mega branch lands here through the plan's loop section, so no relay edit is needed for it.

### The dashboard

From PR #57: the operator looked at committed frames (their largest idea, T93, was anchored on a PNG), played the per-bite Artifact, and read the plan. They did not use the PR body, which went stale (it missed bites 17–18), or the 380-line QA checklist. So:

- **A `## Where it stands` block at the top of the PR body**, rewritten (not appended) at every bite's end and every wave report. It is at most ~15 lines and holds:
  - the bite in flight and its step;
  - what is playable or viewable now, with the Artifact link and the frames directory;
  - what waits on the operator: the `to-check.md` count, and any open fork with its "taken at the tail if unanswered" default;
  - the **live session's link** and its depth;
  - the last re-steer and where it landed in the plan.
- **The live session's link** goes in that block at every relay, so the operator always knows where chat goes.
- **Frames, the Artifact and `to-check.md`** keep the shape they had on #57 (committed frames per bite, previous ones retired with a tombstone; one Artifact URL republished in place; a standing Russian hand checklist). The Artifact is published mid-bite as well, whenever a visible batch lands.

### The intake

Each run session calls `subscribe_pr_activity` on the PR, so a comment or review wakes whichever session is live. Chat in the live session is the other channel. Every operator message, from either channel, is sorted into exactly one of these:

| Kind                  | Tell                                                         | What happens                                                                                                                                                                                                             |
| --------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **question**          | asks, changes nothing                                        | Answered from the plan **and** the idea docs, with agents still running. It reaches the plan only if the answer changes what gets built.                                                                                 |
| **note**              | a fix or tweak, usually from playing                         | A plan edit in its own commit, quoting their words. It then becomes a one-step agent at once, in parallel with the bite. If it touches work a running agent holds, it goes to that agent by `SendMessage`.               |
| **feel call**         | latency, motion, sound — something they judge by playing     | Held for them while they are present. Groups that don't depend on it are briefed meanwhile, and the recommended option is built on a `wt/` side branch.                                                                  |
| **idea to weigh**     | "don't put it in a plan yet", or a direction with open forks | Kept verbatim in an ideas doc (in the operator's language when they ask). The plan gets only the task of writing the weighing doc. Once ideas are partly built, the plan says which half is built and which is unplaced. |
| **re-steer**          | changes what the thing _is_                                  | See § "A re-steer" below.                                                                                                                                                                                                |
| **cut**               | drops scope                                                  | Written into the plan with their words before anything else happens.                                                                                                                                                     |
| **pause / take over** | "I'll take it by hand"                                       | A relay with no `create_session`: the successor line goes to the operator, and the depth resets.                                                                                                                         |

**A re-steer** follows what the notes learned, and adds the one lesson #57 paid most for:

1. The running agents are wrapped up at a **pushed step**, not dropped.
2. The message is quoted into the plan's standing rules or decisions, and committed on its own.
3. `## Rest of the elephant` is rewritten, with what is already built marked built or unplaced.
4. **Then the new direction's forks are settled in one design doc before any of it is built.** #57's walking arrived in stages (crop → pan → walk → endless field), and each stage threw away the one before. If the forks were not settled first, the doc is the next bite's first task.

**Timing:** by default a re-steer takes effect at once. "After this bite" in their words defers it to the bite boundary, as with T49.

**Standing posture during a drop-in** (from the notes, said once in the skill):

- ask only about the unrecoverable;
- a budget notice relays unasked;
- a "why?" gets the old rule's reason and whether it still holds;
- replies go in the operator's language even when the turn was woken by an English agent report.

## Files

The skill reads by phase: a session opens only the reference file its current step needs. The notes measured ~38k tokens for a session that read them whole before its first brief.

| File                                                  | Holds                                                                                                                                                                                                                                                                                                                              |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.claude/skills/mega/SKILL.md`                        | Entry points, the loop in one screen, the session-as-orchestrator rule, and the phase → file table                                                                                                                                                                                                                                 |
| `.claude/skills/mega/start.md`                        | Writing the megaplan: the split shape from bite 1, the loop section and standing rules from the template, the run's model named, the dashboard block, a spike into the dependency's risky seam before bite 1, and a look recipe written alongside the page when the work is visual                                                 |
| `.claude/skills/mega/operator.md`                     | The dashboard and the intake above                                                                                                                                                                                                                                                                                                 |
| `.claude/skills/mega/orchestrate.md`                  | Subagents: one step per agent; a committed common brief; waves by file, each staged by what its result depends on; per-agent worktrees landing one squash from `wt/<pkg>`; check-ins and 170k notices; restarts and resumes; the model passed explicitly to every agent                                                            |
| `.claude/skills/mega/bite-end.md`                     | The tail, in order: suite at the tail's start; quick gates including knip; `/polish` as sized waves with the bare `polish:` last; vet in parts; frames; retiring the last bite's leftovers; the 450-line check; folding and splitting the plan; resyncing the squash proposal; the Artifact; the dashboard; the journal; the relay |
| `.claude/skills/mega/review.md`                       | The review as tail subagents (a player and a reader, frames first): findings each carry an `Ask:`; a calls file comes before any fix; the agent-authorship marker; the five-percent file frozen; the device failure-mode list; sweeps over the states a user actually reaches                                                      |
| `.claude/skills/mega/relay.md`                        | The loop's own relay rules: depth read from `lineage`; never `reset --hard`, and a stale ref is renamed aside; dependencies installed after checkout; subagents stopped before the hand-off; `pull --no-rebase` early on; the cap-depth hand-off at a natural stop, with the line to paste                                         |
| `.claude/skills/mega/look.md`                         | For visual or interactive work: the play script; stepping the clock instead of timing a screenshot; reading runtime state beside each shot; a play red that is the game's gets fixed, one that is the harness's own goes to `to-check.md`; the Artifact recipe                                                                     |
| `.claude/skills/mega/templates/`                      | The plan's loop section with its standing rules (calls numbered `22\.` so prettier leaves them alone), `brief-common.md`, `review-brief.md`, the dashboard block                                                                                                                                                                   |
| `.claude/skills/mega/journal.md`                      | Where each run session writes what it learned before its relay, as the notes did. A run's last bite distills the journal into the files above and empties it                                                                                                                                                                       |
| `.claude/skills/megabeast/` → `retired.md`            | A tombstone: the last commit holding `notes/`, the `git show` recipe, and where each theme went                                                                                                                                                                                                                                    |
| `.claude/skills/plan/elephant.md` § "Unattended runs" | The pointer moves from the notes to `/mega`                                                                                                                                                                                                                                                                                        |

**Mushroom-only facts** (Phaser's `Graphics` re-tessellation, `Scale.RESIZE` ignoring DPR, the five screens) are not copied into the skill. `look.md` keeps the general lesson each one taught (for example "count draw calls, not milliseconds"), and the specifics stay readable through the tombstone.

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
5. A fresh-eyes check: a subagent with only the skill, and none of the notes, walks a made-up run through four drop-ins (a question, a note mid-wave, an idea to weigh, a re-steer mid-bite) and reports where the skill left it guessing.
6. `scripts/check-skill-catalog.sh`, prettier, then `/polish`.

**The new `SKILL.md` adds a row to the skill listing every session loads**, so it enters through `scripts/staged.sh` if the script supports a new path. If it doesn't, it lands in place, and that is said in the PR.

## DRY notes

- **Reused by pointer, never restated:**
  - the elephant's shape and bite sizing: `plan/elephant.md`;
  - the relay mechanics: `/relay`;
  - the auto-relay opt-in, which already ends a budget pause with a relay: `.claude/context-budget/auto-relay/`. This replaces the notes' "the contract outranks the notice";
  - the quality passes: `/polish`;
  - land prep: `/finalize` (without `and merge`);
  - the 170k subagent notice: the context-budget hook.

  `/mega` says what to run when, and in what order, never how those skills work inside.

- **Shared within the skill:** the brief conventions live once in `templates/brief-common.md`. Every per-agent brief points at it and adds only its own steps, files and off-limits list. On #57 that pattern ran six groups with no collisions.
- **Duplicated on purpose:** the few vendored-skill fixes above, written as `/mega`'s own instructions, because editing muthur's copies here forks them silently at the next `/update-muthur`.
- **Not extracted:** a script for the dashboard block. It is ~15 lines of prose rewritten by judgment at each bite's end, so a generator would have to know what "where it stands" means.

## Questions

1. **Where `/mega` lives.** **a)** Here, as this repo's own skill, with muthur issues proposed for the vendored fixes. **b)** Upstream in muthur from the start. _Recommendation: a._ The loop was learned on this repo's stack, and it needs a second run before anyone can tell which parts are general.
2. **The gate.** **a)** `/mega <task>` stops once, at the plan's review, then runs. **b)** No gate: the prompt is the go-ahead, and the plan is published only for reading. _Recommendation: a._ #57's plan was approved before "fully autonomous" was said, and the first bite's shape is the cheapest point to re-steer.
3. **When a re-steer takes effect.** **a)** At once by default: running agents land a pushed step, then re-plan, unless they say "after this bite". **b)** At the bite boundary by default. _Recommendation: a._ #57 had both ("можно после окончания этого байта", then «всё-таки хочу… уже сейчас»), and waiting costs more when the bite is building toward the old direction.
4. **The notes.** **a)** Distill them into the skill, retire them behind a tombstone, and have runs write into `journal.md` from now on. **b)** Keep `notes/` alive beside the skill as its journal. _Recommendation: a._ The notes are 100 KB, and a journal that grows without being distilled is the bloat the plan split was invented for.
5. **The run's model.** **a)** `/mega` names the starting session's own model in the plan, and passes it to every `create_session` and `Agent`. **b)** It always pins Opus. _Recommendation: a._ "Opus throughout" was #57's ruling for that task. What the skill must enforce is "named, never inherited", not which model it is.
