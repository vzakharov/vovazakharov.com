# Run vet on pull requests in GitHub Actions

## Why

Nothing runs on a pull request here, so a branch's only pre-merge signal is
whoever last ran `./scripts/vet.sh`, on whatever machine they had — which is how
the ESLint heap failure (#189) went unnoticed until two attestations tripped on
it. The repository is public, so Actions minutes are free, and `ubuntu-latest`
runners have 16 GB. A workflow that runs vet on every PR gives a signal from one
known machine that reviewers see in the Checks tab.

It replaces `/finalize`'s local run: the PR leaves draft at its Step 4, and the
run it watches there (via `/watch-ci`) is the vet it attests to.

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
     every PR out of draft, and that run is the pre-merge signal; § "Vetting"
     likewise stops naming `/finalize` as vet's canonical caller —
     `./scripts/vet.sh` stays the check anyone runs by hand to know sooner.
   - `.claude/rules/stack.md`'s type-overlap bullet ("Since nothing runs on pull
     requests, the vet run is the only place it fires") and a line saying where
     `vet.yml` runs vet; add `.github/workflows/vet.yml` to its `paths:` if the
     frontmatter lists the files it governs.
   - **`/finalize` stops running vet locally where a PR workflow runs it** — the
     same script on the same commit twice, the local copy being the slower and
     the machine-dependent one. In `.claude/skills/finalize/SKILL.md`: the "What
     actually gates this PR" branch for a repo with a PR workflow says Step 1 is
     skipped and Step 4's watched run is the verification; Step 2 calls
     `/sync-branch no vet` there; the base-advanced re-verify
     (`finalize/base-advanced.md`) re-runs the workflow by pushing the merge
     rather than vetting locally; the attestation's vet line reads "run by the
     PR workflow (run link)". `finalize/merge.md`'s Step 1 stand-down reads the
     same against the watched run. These files sync from `vzakharov/muthur`, so
     the edit is local until the same option lands there (a separate PR, the
     operator's call when).
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
- **Drafts run nothing**; the PR leaves draft at `/finalize` Step 4, and that
  run is the one `/finalize` waits on.
- **One vet per finalize, in CI** — the local run goes (step 5 above).
- **No required check.** Branch protection is available here (the repository is
  public, which GitHub Free allows), but it stays off unless the operator turns
  it on.

## DRY notes

- The single job calls `./scripts/vet.sh` rather than restating its checks, so
  the list stays in one place (`stack.md` describes, `vet.sh` runs). The matrix
  names groups in YAML, which is the cost being measured; `--except` makes its
  last group "everything not named", so a new check is never silently skipped.
  If the matrix wins, `stack.md` says that a check whose cost moves the long
  pole gets its own group.
- `setup-toolchain` is reused as-is; no new composite action.
- No new skill path: `/finalize` already branches on whether a PR workflow
  exists, and `/watch-ci` already fixes a red run; the edit narrows that branch
  to one vet instead of two.
