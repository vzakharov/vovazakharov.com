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

Both shapes get built and run side by side on this PR, and the faster one stays;
the other is deleted before merge, its numbers kept in the PR body.

1. **`.github/workflows/vet.yml`**, one job that runs `./scripts/vet.sh`
   unchanged:
   - `on: pull_request` with
     `types: [opened, synchronize, reopened, ready_for_review]`, and the job
     `if: ${{ !github.event.pull_request.draft }}` — drafts are where plans and
     work in flight live, and a run per push there is noise. A PR comes out of
     draft at `/finalize`, the point where vet has always run, and its Step 4 —
     the flip to ready — is already where it starts watching CI.
   - `concurrency: { group: vet-${{ github.event.pull_request.number }}, cancel-in-progress: true }`
     — a newer push supersedes the run, which is also what `/watch-ci`'s
     `[no ci]` mid-run commits rely on.
   - `actions/checkout@v4` with `fetch-depth: 0`: `scripts/lib/changed-files.sh`
     takes the merge base with `origin/main`, which the song checks and the
     changed-test gate read, and a shallow clone has no merge base.
   - `./.github/actions/setup-toolchain`, the composite every lane already uses,
     so the pins stay stated once.
   - `permissions: contents: read`, `timeout-minutes: 30`.
2. **`.github/workflows/vet-matrix.yml`**, the sharded shape, same triggers,
   concurrency group `vet-matrix-<n>`:
   - `scripts/vet.sh` learns two flags: `--skip-build` (the builds are
     downloaded rather than run; the codegen still runs, being cheap) and
     `--only <label,…>` / `--except <label,…>`, filtering `run-parallel.sh`'s
     entries by label and failing on a label it does not know.
   - A `build` job per site (matrix `vova`, `lsa`, `bible`, `basilisk`) runs
     `pnpm build:<site>` and uploads `apps/<site>/out` and
     `apps/<site>/.next/types` as one artifact.
   - A `checks` job per group, `needs: build`, downloads all four and runs
     `vet.sh --skip-build` with its group: `--only eslint` (the long pole),
     `--only typecheck,knip,type-overlap`, and a last group
     `--except <every label above>`. The last group is what keeps a check added
     later from being skipped — it falls into "everything else" unless someone
     moves it out.
3. **Compare** on the same commits: wall-clock from push to the last job's end,
   over at least three pushes, in a table in the PR body. Keep the faster one
   unless the margin is under a minute, in which case keep the single job (it is
   one file and no flags). Delete the loser, and the `vet.sh` flags too if the
   single job wins.
4. **Prove it on this PR before relying on it.** The workflow runs on its own PR
   once that is ready; fix what a fresh runner surfaces that this container
   hides (likely: the browser `cv-pages` needs — the deploy lanes already print
   PDFs on `ubuntu-latest`, so it should be there — and Python for the infra
   tests). Confirm a red check by pushing a deliberate lint error on a scratch
   commit, then reverting it in the next commit.
5. **Conventions that say nothing runs on a PR**, changed with it:
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
6. **The subject.** `ci:` is in the deploy gate's publishing set, so the merge
   redeploys every site — the gate's own reason ("a run of it is the only test a
   change to it gets") holds for deploy.yml, and here it costs a rebuild of
   unchanged output. Acceptable; no `chore:` workaround.

## Decided

- **Single job vs. matrix** is settled by measurement (steps 1–3), not argued:
  locally vet is ~5 minutes, so sharding may save ~2, against a second place
  that groups the checks.
- **Drafts run nothing**; the PR leaves draft at `/finalize`, where vet runs.
- **No required check.** Branch protection is available here (the repository is
  public, which GitHub Free allows), but it stays off unless the operator turns
  it on.

## Open question (the recommendation is in force)

1. **When `/finalize` flips to ready.** **a (recommended)** At its Step 4, as
   now: two minutes after the local vet, and no edit to a skill this repo syncs
   from `vzakharov/muthur`. **b** Before Step 1, so the CI run and the local vet
   overlap — a local edit to `finalize/SKILL.md` that the next muthur sync has
   to keep.

## DRY notes

- The single job calls `./scripts/vet.sh` rather than restating its checks, so
  the list stays in one place (`stack.md` describes, `vet.sh` runs). The matrix
  names groups in YAML, which is the cost being measured; `--except` makes its
  last group "everything not named", so a new check is never silently skipped.
  If the matrix wins, `stack.md` says that a check whose cost moves the long
  pole gets its own group.
- `setup-toolchain` is reused as-is; no new composite action.
- No new skill path: `/finalize` and `/watch-ci` already cover a repository with
  CI on PRs.
