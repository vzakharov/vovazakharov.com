# Vet on pull requests

## Goal

`./scripts/vet.sh`, unchanged, runs in GitHub Actions on every pull request, so
a PR shows red or green without anyone having run vet locally. Small blast
radius: one new workflow, `vet.sh` stays the single definition of what vet is,
and the docs that say "nothing runs on pull requests" stop saying it.

## Approach

`.github/workflows/vet.yml`:

- `on: pull_request` (opened, synchronize, reopened, ready_for_review), plus
  `workflow_dispatch` for a hand run on any ref.
- `concurrency: vet-${{ github.head_ref || github.ref_name }}`,
  `cancel-in-progress: true` — an agent commits and pushes after every unit of
  work, so only the latest head matters.
- `permissions: contents: read`.
- One job: checkout → `./.github/actions/setup-toolchain` (the pins stated once,
  shared with deploy) → the extras below → `./scripts/vet.sh`.

## The edges, and what each gets

1. **Shallow checkout breaks every check that reads the branch against its
   base.** `actions/checkout` defaults to depth 1 and no `origin/main`, so
   `scripts/lib/changed-files.sh`, `check-claude-md-size.sh`,
   `check-squash-message.sh` and `check_estimates.py` all fall to their "no
   base" path — and that path is _quiet_: the estimates gate checks only the
   running session, of which CI has none, so it passes vacuously. Fix:
   `fetch-depth: 0`, which also fetches `origin/main`.
2. **`pull_request` checks out the merge commit, detached.** That is the better
   tree to judge (the branch as it will land), but `git branch --show-current`
   is empty there, so `check_estimates.py`'s `cost-ledger` lookup by branch name
   — the only place a finalized branch's rows live — finds nothing. Fix: check
   out the PR head by branch name (`ref: head_ref`), so vet judges exactly what
   it judges locally, and the ledger lookup works. The merge with `main` is
   `/finalize` Step 2's job either way.
3. **The tests that build throwaway repositories need a git identity.** The
   runner has none; `.claude/costs/` tests commit into temp repos. Fix: set
   `user.name`/`user.email` for the job (the github-actions bot).
4. **numpy for `scripts/song-intake/test_song_facts.py`.** The runner's system
   Python lacks it. Fix: `pip install numpy` in the job (or the setup action, if
   the run shows deploy never needs it — it doesn't, so the job).
5. **Chromium for `--cv-pages`.** `scripts/lib/chromium.ts` already looks at
   `/usr/bin/google-chrome`, which `ubuntu-latest` ships, and deploy's PDF
   render proves it. Nothing to add — confirmed by the first run.
6. **`ci:` is a publishing type.** The squash subject `ci: …` deploys every site
   on merge. The rebuild is identical output, so it is harmless, but it is a
   production decision: name it in the PR so the merge is deliberate.
7. **Whatever only the run reveals.** Hooks and keepalive tests may assume the
   Claude container (`CLAUDE_CODE_REMOTE`, `~/.claude/…`). The PR's own run is
   the test: fix what it shows in the workflow (env, setup), never by skipping a
   check.

8. **A green run is not evidence by itself.** `run-parallel.sh` prints only
   failures, so a vacuous pass and a real one look the same in the job log. The
   job uploads `tmp/run-parallel/` and the build logs as the `vet-logs`
   artifact; the first run's logs show every base-reading check read the branch
   against `origin/main`.

Out of scope, stated so it is a choice:

- **Making the check required** is branch protection, a repository setting no
  file here holds — the operator's to switch on once it has been green a while.
- **Local vet at `/finalize` stays.** `/finalize` already reads "a workflow runs
  on PRs" as: vet here _and_ watch that run (its § "What actually gates this
  PR"), so the skill needs no edit and stays byte-equal to muthur's.
- **Caching `.next/`** across runs — four uncached builds are the accepted cost;
  revisit if the run gets annoying.

## Docs that change

- `CLAUDE.md` § "Deployment" — "Nothing runs on pull requests…" (staged copy).
- `.claude/rules/stack.md` — the type-overlap bullet's "since nothing runs on
  pull requests"; and the three-sites roster gains the workflow as a fourth site
  a toolchain change wires (it shares `setup-toolchain`, but numpy is the job's
  own).
- `.claude/skills/update-muthur/watermark.json` — the `test-on-gh` rationale
  leans on "nothing runs on pull requests here"; reword to the true reason (the
  whole suite fits one CI job too).

## DRY notes

- Reuse `.github/actions/setup-toolchain` rather than restating pnpm/Node pins —
  it exists to be the one statement of them.
- The workflow calls `./scripts/vet.sh`; it restates no check, so the list of
  checks keeps one home.
- numpy goes in the job, not the shared action: only vet needs it, and deploy's
  lanes would pay for it on every publish.
