> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source
> while this file is named `*.draft.do-not-implement.md` — prep and spikes go in
> `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md`
> and delete this banner (quoting the go-ahead in the commit) _before_ touching
> code.

# Run vet on pull requests in GitHub Actions

## Why

Nothing runs on a pull request here, so a branch's only pre-merge signal is
whoever last ran `./scripts/vet.sh`, on whatever machine they had — which is how
the ESLint heap failure (#189) went unnoticed until two attestations tripped on
it. The repository is public, so Actions minutes are free, and `ubuntu-latest`
runners have 16 GB. A workflow that runs vet on every PR gives a signal from one
known machine that reviewers see in the Checks tab.

It does not replace the local run: `/finalize` vets locally first (its Step 1)
and then watches the PR's workflow to green (its Step 4, via `/watch-ci`) — that
branch of the skill already exists and only starts applying.

## Approach

1. **`.github/workflows/vet.yml`**, one job that runs `./scripts/vet.sh`
   unchanged:
   - `on: pull_request` with
     `types: [opened, synchronize, reopened, ready_for_review]`, and the job
     `if: ${{ !github.event.pull_request.draft }}` — drafts are where plans and
     work in flight live, and a run per push there is noise; the run starts when
     `/finalize` Step 4 flips the PR to ready, which is exactly where that step
     starts watching.
   - `concurrency: { group: vet-${{ github.event.pull_request.number }}, cancel-in-progress: true }`
     — a newer push supersedes the run, which is also what `/watch-ci`'s
     `[no ci]` mid-run commits rely on.
   - `actions/checkout@v4` with `fetch-depth: 0`: `scripts/lib/changed-files.sh`
     takes the merge base with `origin/main`, which the song checks and the
     changed-test gate read, and a shallow clone has no merge base.
   - `./.github/actions/setup-toolchain`, the composite every lane already uses,
     so the pins stay stated once.
   - `permissions: contents: read`, `timeout-minutes: 30`.
2. **Prove it on this PR before relying on it.** The workflow runs on its own PR
   once that is ready; fix what a fresh runner surfaces that this container
   hides (likely: the browser `cv-pages` needs — the deploy lanes already print
   PDFs on `ubuntu-latest`, so it should be there — and Python for the infra
   tests). Confirm a red check by pushing a deliberate lint error on a scratch
   commit, then reverting it in the next commit.
3. **Conventions that say nothing runs on a PR**, changed with it:
   - CLAUDE.md § "Deployment", last paragraph — through
     `scripts/staged.sh stage CLAUDE.md`, since it loads every turn: vet runs on
     every PR out of draft, and a green local vet plus a green run is the
     pre-merge signal.
   - `.claude/rules/stack.md`'s type-overlap bullet ("Since nothing runs on pull
     requests, the vet run is the only place it fires") and a line saying where
     `vet.yml` runs vet; add `.github/workflows/vet.yml` to its `paths:` if the
     frontmatter lists the files it governs.
   - `.claude/skills/finalize/SKILL.md` needs no edit — it already branches on
     whether a workflow runs on PRs — but its attestation template's "nothing
     runs on a PR" line stops applying, which it handles by construction.
   - Search the tree for "nothing runs on" / "no workflow runs" and fix each
     statement that this makes false.
4. **The subject.** `ci:` is in the deploy gate's publishing set, so the merge
   redeploys every site — the gate's own reason ("a run of it is the only test a
   change to it gets") holds for deploy.yml, and here it costs a rebuild of
   unchanged output. Acceptable; no `chore:` workaround.

## Open questions (the recommendation is already in force above)

1. **One job or a matrix?**
   - **a (recommended)** One job running `vet.sh` as it is. Locally the whole
     run is ~5 minutes on 4 cores (2 min of builds, ~2.5 min of checks, eslint
     the long pole at ~2 min), so sharding saves perhaps 2 minutes. What it
     costs is a second statement of what vet runs: a matrix needs `vet.sh` split
     into selectable groups, the four builds as separate jobs uploading
     `apps/*/out` and `apps/*/.next/types` as artifacts (eslint and `tsc` both
     read the generated route types), and `cv-pages` re-pointed at an export it
     currently finds in the OS temp directory. Every check added later then has
     two homes to wire.
   - **b** A matrix: four build jobs, then the checks fanned out over jobs that
     download the builds. Fastest wall-clock, at the cost above.
   - **c** One job now, and a matrix only once a run goes past ~10 minutes. Same
     as (a) with the trigger for revisiting written into `stack.md`.
2. **Drafts too?** **a (recommended)** Only PRs out of draft, as above. **b**
   Every push, drafts included — earlier signal, at a run per agent push.
3. **Required check?** Making `vet` a required status check is a branch
   protection setting, the operator's, not the repository's to state. The plan
   leaves it off; say so if you want it, and the report will name the setting.

## DRY notes

- The workflow calls `./scripts/vet.sh` rather than restating its checks, so the
  list stays in one place (`stack.md` describes, `vet.sh` runs); option (b)
  above is rejected chiefly because it would break that.
- `setup-toolchain` is reused as-is; no new composite action.
- No new skill path: `/finalize` and `/watch-ci` already cover a repository with
  CI on PRs.
