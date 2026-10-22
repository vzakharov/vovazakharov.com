# Relay 2 — context budget

Relay 1 (`relay-1.md`) covers the session up to the parking; this one continues
it. Read relay-1 for the earlier conversation (the PR-trigger misread and its
reversal).

## Standing constraints

None stated by the operator.

## The conversation (since relay-1)

1. **Operator:** «разнести по параллельным. не знаю общий ли у нас линт или на
   каждый -- свой, но если последнее, можно, например, матрицей разнести по
   аппам. как идея.»

   **Agent:** lint is shared — one `eslint .` over the root `tsconfig.json`, one
   TS program (by design, #189), which includes every app's `.next/types`, so it
   can't split by app. Measured the single-job run: setup ~30s, four builds
   ~80s, fan-out ~93s with ESLint the long pole at 90s. Proposed: builds as a
   matrix by site, ESLint in 2–3 file shards, rest as one job; ~3.5 → ~1.5–2
   min; asked whether "~2 minutes" was worth it.

2. **Operator:** «ну давай с шардами, чого нет? или есть минусы?» — and
   mid-turn: «"примерно двух минут" звучит как "не стоит", а вот "в два раза
   быстрее" -- уже нет ;)»

   **Agent:** built it (commits on the branch): `vet.sh` phases, `vet.yml`
   matrix. First split gave no gain (checks waited on the vova build), so split
   checks into `source` (starts with builds) and `built`. Measured ~2m25s–2m35s
   vs ~3m30s — ~1.45×, not 2×. Tried an uncompressed export upload: download
   went 6s → 90s, reverted. Reported downsides: every shard rebuilds the whole
   TS program; more runner minutes (free, public repo); GitHub sometimes keeps
   a finished job "in progress" for 1–2 min, delaying the run's status.

3. **Operator:** «> дольше всех собирается vova, ~90 с, и шарды линта и built
   ждут именно её

   а это обязательно, чтобы все -- даже не связанные с ней -- шарды её ждали?»

   **Agent:** no — they need only route types. Measured on `lsa`: build 30s,
   `next typegen` 0.7s, identical `.next/types` except typegen's extra
   `cache-life.d.ts`. Wrote the next step into the plan and paused for the
   context budget before replying further; the operator has not yet heard this
   answer.

## Intent

Vet on GitHub runners, dispatched by hand in place of a local run, as fast as
parallelism allows — the operator measures it as "how many times faster", and
aims at 2×. Ruled out: running on PRs automatically.

## Decisions

- Phases in `vet.sh` (`build <site>`, `lint <k>/<n>`, `source`, `built`) add up
  to the bare run; the workflow names phases, never checks.
- ESLint shards by file (round-robin over the sorted `git ls-files` list of
  lintable extensions, `--no-warn-ignored`), 3 shards. Heap ceiling moved to
  `lint:files` in `package.json`.
- Artifacts: `types-<site>` (needs `include-hidden-files: true`, `.next` is
  hidden) and `out-<site>` (keep default compression).
- `/finalize` still vets locally; changing it is a separate change to a
  muthur-owned skill.

## Errors and dead ends

- First split: no gain, because everything waited on the builds.
- `compression-level: 0` on the export: much slower download. Reverted.

## State

- Branch `claude/vet-on-pull-requests`, head 6cbbae109, pushed, clean.
- PR #192, draft, titled `ci: run vet split across parallel GitHub jobs`; body
  and squash comment reflect the split (not yet the typegen change); proposal in
  `docs/remove-before-merging/squash-message.md`.
- Plan: `docs/plans/vet-on-pull-requests.paused.md` — section "Left: stop the
  lint shards and the type check waiting on the builds" is the next step.
- Last green dispatch: run 39794389326.
- `CLAUDE.md` staged at `.claude/staged/CLAUDE.md.staged`.
- Estimate for this session: 5 h middle developer (splitting one script into
  phases that still add up to the whole, artifact plumbing, timed runs) + 1.5 h
  senior architect (choosing the cut, telling GitHub noise from real cost).
  Remainder for the successor: 1 h middle developer (moving lint and typecheck
  onto typegen types and verifying parity).
- The muthur sync offer was made; do not make it again.

## Pointers

- `scripts/vet.sh`, `.github/workflows/vet.yml`,
  `.github/scripts/place-vet-artifacts.sh`, `package.json` (`lint:files`).
- `.claude/rules/stack.md` — the typegen warning (builds and codegen bullet).
- Dispatch: `gh workflow run vet.yml --repo vzakharov/vovazakharov.com --ref claude/vet-on-pull-requests`.
- Job timings: `gh api repos/vzakharov/vovazakharov.com/actions/runs/<id>/jobs`.
- Predecessor transcript: https://claude.ai/code/session_011ykECeVk1ySGRdEgmcaDrU

## Next step

Answer the operator's last question in Russian («а это обязательно, чтобы все
… шарды её ждали?»): no — the shards and the type check need only route types,
which `next typegen` writes in under a second with the same content. Then
implement the plan's "Left" section, verify locally and with a dispatch, and
report the new time against ~3m30s single-job and ~2m30s current.
