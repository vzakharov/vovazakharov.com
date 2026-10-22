# Relay 1 — parked

## Standing constraints

None stated by the operator.

## The conversation

1. **Operator** (opening prompt): «Задача-минимум предельно простая, по крайней
   мере внешне: заменить vet.sh на «вот то же самое», только в GitHub. Какие
   вылезут эджи, если делать это с таким небольшим бласт-радиусом, — выясни
   сам.»

   **Agent:** routed via `/task` → plan, then go. Built `.github/workflows/vet.yml`
   triggered on every pull request, running `./scripts/vet.sh` unchanged;
   rewrote the docs to say vet runs on PRs; opened draft PR #192. Reported the
   edges: shallow checkout (no `origin/main` → estimates gate passes vacuously,
   size cap checks only the ceiling), detached merge commit hides the branch
   name the `cost-ledger` lookup needs, no git identity for tests that commit,
   numpy needs `setup-python` (PEP 668), `run-parallel.sh` prints only failures
   so a vacuous pass looks green (fixed by uploading per-check logs as the
   `vet-logs` artifact), CI pins pnpm 9 vs pnpm 10 locally, `ci:` squash
   subject redeploys all sites. Offered a muthur sync (unanswered).

2. **Operator:** «> Nothing ran on pull requests, so a branch was first held to
   the repo's checks when someone ran ./scripts/vet.sh by hand, usually at
   /finalize.

   ты как будто не уловил главную причину зачем это делается: получить более
   мощную машину и возможность (в будущем параллелить). Речи про то чотбы
   гонять это как-то иначе как by hand не было, откуда у тебя такая идея
   появилась?»

   **Agent:** owned it: read "in GitHub" as "CI on PRs" off the docs' "nothing
   runs on pull requests", never asked why. Found that the standard runner is
   the same 4 cores / 16 GB as the session container, so the build as it stood
   bought no power. Made the workflow `workflow_dispatch`-only, restored the
   "nothing runs on pull requests" docs, rewrote squash proposal, PR title and
   body, logged the miss in `writing/notes/the-five-percent.md`. Dispatch on the
   branch ran green (~4 min). Asked, and stopped building pending the answer:

   > 1. Where does the power come from?
   >    a) (recommended) Split across parallel jobs — each a separate 4-core
   >    machine, free on a public repo; the four site builds (now sequential,
   >    most of the run) on four machines, the checks in groups. Cost:
   >    vet.sh stops being the one list of checks unless it learns to run a
   >    named group.
   >    b) Larger runners (8–64 cores) — as far as known, only for
   >    organizations on Team/Enterprise; this repo is personal.
   >    c) Leave it — one job, same power; only frees the session's container.
   >
   > Suggested first step for (a): measure how much of the ~5 min is builds.

No answer yet.

## Intent

Offload vet to a more powerful machine and, in the future, parallelise it. The
run is started by hand (in place of a local `./scripts/vet.sh`), never on its
own — the operator ruled out automatic PR triggering.

## Decisions

- **Dispatch-only trigger** over `pull_request`: the operator never asked for
  automatic runs.
- **vet.sh stays unchanged, called whole** — so far; option (a) would change
  that.
- **`/finalize` untouched** (byte-equal to muthur's): it still runs vet locally.
  Whether `/finalize` should dispatch vet.yml instead is not yet decided.
- **numpy and git identity in the job, not in `setup-toolchain`** — deploy lanes
  don't need them.
- **CI's setup is a fourth site a toolchain change wires** (CLAUDE.md staged
  copy, `.claude/rules/stack.md`).

## Errors and dead ends

- The PR-triggered workflow and the "vet now runs on PRs" doc rewrite — built on
  a misread of the motive; reverted. Operator's feedback is message 2 above.

## State

- Branch `claude/vet-on-pull-requests`, head 5781b71cb (pushed), clean tree.
- PR #192, draft, open, titled `ci: run vet on a GitHub runner by hand`; squash
  proposal posted as a comment and tracked in
  `docs/remove-before-merging/squash-message.md`.
- Plan: `docs/plans/vet-on-pull-requests.completed.md` (describes the
  PR-triggered version; stale on the trigger — update if work resumes).
- `CLAUDE.md` is staged at `.claude/staged/CLAUDE.md.staged` (swapped at
  `/finalize`).
- Last dispatch run 39779721074: success. Nothing running, no subscriptions or
  check-ins.
- Estimate unchanged: 3 h middle developer (CI job around an existing script,
  runner differences take runs to flush out) + 1 h senior architect (what CI may
  judge, which quiet passes are real gaps). Any option-(a) work is the
  successor's to estimate.
- The muthur sync offer was made; do not make it again.

## Pointers

- `.github/workflows/vet.yml` — the workflow.
- `.github/actions/setup-toolchain/action.yml` — pnpm 9 / Node 24 pins shared
  with deploy.
- `scripts/vet.sh`, `scripts/run-parallel.sh` — what a split would carve up.
- Logs of a run: `gh run download <id> --repo vzakharov/vovazakharov.com -n vet-logs -D tmp/ci-logs`.
- Dispatch: `gh workflow run vet.yml --repo vzakharov/vovazakharov.com --ref <branch>`.
- Predecessor transcript: https://claude.ai/code/session_011ykECeVk1ySGRdEgmcaDrU

## Next step

Wait for the operator's answer to question 1 (a / b / c). In line with their
request («получить более мощную машину и возможность (в будущем параллелить)»),
on (a) start by measuring the share of the run the builds take.
