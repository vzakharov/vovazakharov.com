# A bite's end

Opened when a bite's build is done: the tail in the order below, then the next bite or the relay.

**The order is fixed because the passes change source.** Each step reads what the one before it left — the gates check the build, `/polish` rewrites code, vet checks the polished tree — and the last look at the result follows the last source commit.

**The tail is subagent work, split where it fills an agent** (`orchestrate.md`), because a whole tail outruns one context. Steps that touch nothing in common run side by side: the replies to the threads taken in, the screenshots, the Artifact's build. The orchestrator keeps the relay and whatever only its own tools can do.

**A step that leans on one repo's tooling says "where the repo has it"**: a repo without that tool runs its own counterpart, or skips the step.

## 1. The operator's comments

- **Re-export the PR, log it, then take it in, before any gate.** `python3 scripts/export-github-item.py <n>` refreshes `docs/pr/<n>/pr.md`; `scripts/golem-log-pr.sh <n>` appends the operator's threads from it to the operator log; each thread then goes through `operator.md` § "The intake". A change the intake places into this bite has to land before the gates check it.

## 2. The suite

- **Run the whole test suite once, at the tail's start.** A red that predates the tail is then fixed as a step of its own, rather than found at vet and read as the bite's.

## 3. Quick gates

- **Lint, type-check, the format check, and the dead-export check where the repo has one** (`knip` here). Their fixes are source, so they land before the passes that read it.

## 4. `/polish`, as sized waves, where the repo has it

- **Make the floor reachable before trusting an empty lookup.** `@.claude/skills/polish/SKILL.md` § "The floor" scopes on the last bare `polish:` commit, and a shallow clone that cannot see it reads the whole branch as floorless. Deepen (`git fetch --deepen=<n>`) until `git merge-base origin/<base> HEAD` resolves, and write the floor's sha into every polish brief.
- **Size the wave by changed lines: `/dry` cut by area at ~2k, `/tend-prose` at ~5k.** An agent given more spends its context and hands back findings it judged but never applied. All `/dry` runs before any `/tend-prose` on the same files; an area whose `/dry` is done may start its prose while another's runs; a finding that crosses areas goes to whichever agent next owns those files.
- **Plan a leftovers agent from the start**, briefed with the `/dry` agents' judged-but-unapplied findings as a numbered list and no re-read of the diff. Some slice nearly always runs out before it applies everything.
- **Each slice commits as `polish(<slice>):`; only the closing agent or the orchestrator writes the bare `polish:`, last.** The bare commit is the floor the next bite's `/polish` starts from; the lookup skips a scoped one, so without it every later run re-reads the whole branch.

## 5. Vet

- **Vet runs once every bite.** Nobody reviews between bites, so a red tree would otherwise reach the next bite unnoticed.
- **Run it in parts when the whole outruns one foreground call** — the gates, then the suite in as many calls as it takes — and never in the background, where a run stalls with no sign of why.
- **A gate parked red under `SKILL.md`'s failure rule** (§ "Rules that hold on every turn of a run") **carries into the next bite**: the bite closes with the red named in its fold and on the operator's list, and every later bite's vet runs that gate and names it again until it is green. Any other red holds the bite.

## 6. Screenshots

- **Commit the screenshots worth showing under `docs/plans/<slug>/screenshots/bite-<nn>/`, picked rather than the whole run, never only in `tmp/`.** The operator looks and comments through them, and `tmp/` goes with the container. How to capture them is `look.md`.

## 7. The review

- **The review runs here, over the vetted tree and its screenshots** — `review.md`. **Its fixes end with their own vet**, and fresh screenshots where they change what is seen, because the bite's vet and captures predate them.

## 8. The previous bite's working files

- **Once this bite's screenshots and notes are committed, retire the previous bite's**: its `bite-<nn>-…` files in `docs/plans/<slug>/briefs/`, `handover/`, `review/` and `screenshots/`, with one row per directory in `docs/plans/<slug>/retired.md` naming the last commit that held them. Otherwise the branch fills with files no session opens again. This step is the only one that retires screenshots.

## 9. The 450-line check

- **List the files past ~450 lines and brief a split for each logic module.** `/polish` reads only what changed, so a module that crept past the line over several bites goes unflagged. A split is source, so it ends with its own vet, like the review's fixes.

## 10. The plan

- **Fold the bite in and split the plan as `@.claude/skills/plan/elephant.md` § "The plan's shape" says.** The fold is written whole at every bite's end, so a relay can land anywhere after it.
- **A structural change to the plan is recorded as a decision in the same commit, unasked.** The next session learns the plan's shape from the plan, not from the history.
- **Run the format check after every format write on the plan, and never wrap a line inside a code span.** A code span broken across lines is one the formatter can mangle.

## 11. The squash proposal

- **Re-read the squash proposal against the bite's calls and re-sync it with `@.claude/skills/squash-message/SKILL.md`.** It drifts as bites change what the branch ships, and where the repo deploys by the squash subject, that subject decides what merging deploys.

## 12. The Artifact

- **Republish the one Artifact in place**, where the work has one — `look.md` § "The Artifact".

## 13. The dashboard

- **Rewrite `## Where it stands`** per `operator.md` § "The dashboard", with `scripts/pr-body.py pull` and `push`, **then run `scripts/check-pr-body-size.sh`**: vet read the body before this rewrite. The PR body is this step's to write: a run calls `/pr` once, at the start (`start.md`), never per bite.

## 14. Closing the bite

- **Flush the operator log's queued reply, write the journal, then commit and push.** `.claude/hooks/golem-operator-log.sh flush "$(git rev-parse --show-toplevel)"` writes the reply `tmp/` holds, and the commit takes what is left of the log; `journal.md` gets whatever this bite taught that would make the next run go better.

## Then

- **The budget pause has fired** → `relay.md`.
- **The last bite** → distill `journal.md` and empty it, then `@.claude/skills/finalize/SKILL.md` without `and merge` (`SKILL.md` § "The loop"). Its rounds are its own, and its last miss counts as one attempt under `SKILL.md`'s failure rule.
- **Otherwise the next bite, in this session**: whoever takes a bite writes its `## Bite N` heading into the operator log first — here, at bite 1's go-ahead (`start.md`), and on a pickup (`relay.md` § "On picking up") — then takes it per `@.claude/skills/plan/elephant.md` § "Taking a bite".
