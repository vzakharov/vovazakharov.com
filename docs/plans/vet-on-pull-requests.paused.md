# Vet on a GitHub runner

## Goal

Move a vet run off the session's container onto GitHub's runners, split across
parallel jobs so it finishes faster. Run by hand (`workflow_dispatch`), in place
of a local `./scripts/vet.sh` — nothing triggers it on its own, and nothing runs
on pull requests. (The first cut ran on every PR; the operator ruled that out:
the point is a more powerful machine and parallelism, not automatic checks.)

## Approach

`scripts/vet.sh` gains phases that together run exactly what the bare script
does, so the list of checks keeps one home:

- `build <site>` — one site's build;
- `lint <k>/<n>` — ESLint over the k-th of n shards of the lintable files;
- `source` — the codegen and every check no build feeds;
- `built` — the checks that read a build (type check, Mantine, i18n payload, CV
  pages).

`.github/workflows/vet.yml`: four build jobs (matrix by site) and `source` start
at once; when the builds land, three lint shards and `built` run side by side,
reading the builds' route types and exports through artifacts.

ESLint is one program over the whole repo (`tsconfig.json` includes every app's
`.next/types`), so it shards by file, not by app; each shard still builds the
whole program.

## Measured

- One job: ~3m30s of job time (setup 30s, builds 80s, fan-out 93s with ESLint
  the long pole at 90s).
- Split: ~2m25s from first job to last; critical path is the vova build job
  (~90s) then a lint shard or `built` (~55s).
- GitHub sometimes reports a finished job as in progress for a minute or two,
  holding the run's status; not ours to fix.
- An uncompressed export upload made the download 90s instead of 6s — kept
  compressed.

## Done: the lint shards and the type check no longer wait on the builds

Operator, on the lint shards and `built` waiting for the vova build: «а это
обязательно, чтобы все -- даже не связанные с ней -- шарды её ждали?»

They need only `apps/*/.next/types`, which `next typegen` writes in under a
second per site, identical to the build's bar an extra `cache-life.d.ts`.
`stack.md`'s warning against typegen is about racing a build in the same tree; a
job with no build has no race. `pnpm typegen` runs it for every site; the `lint`
and `source` phases call it first, `typecheck` moved into `source`, the lint
shards have no `needs`, and the types artifacts are gone.

Verified from a clean tree: lint shard 1/3 in 52s, `source` in 80s, both green.
Also found: the type check passes with no route types at all — `skipLibCheck`
hides `next-env.d.ts`'s missing import, and no code reads the `PageProps` /
`LayoutProps` globals yet — so typegen is what keeps it honest once one does.

Dispatched (run 39797392079, green): 2m28s against 2m38s before this step
(run 39794389326) — 10s, because two paths now tie at ~2m25s:

- `source`: full-history checkout 36s, then checks 88s (70s before, the type
  check now runs there);
- the vova build (1m31s), then `built` (45s, of which setup and the export
  download are 24s and the checks 18s).

## Done: the next cut (go-ahead: «давай попробуем, что уж»)

- The type check is a phase and a job of its own (30s).
- `built` has no `needs`: it sets up beside the builds and
  `.github/scripts/wait-for-exports.sh` waits on the run's artifacts, which list
  as soon as they upload. Per-site export checks were the proposal, but the
  Mantine check's unused-sheet direction needs every site's export at once. Run
  39804987378: the vova path ends at 1m56s, the wait 3s behind the upload.
- A blobless `source` checkout (36s → 4s) made the estimates gate take over a
  minute — it reads every `cost-ledger` row, one lazy fetch each — so the full
  checkout stays.

Run 39805671524 (green, full checkout): 2m24s. `source` 1m26s; the vova path is
the whole critical path, and it varies by runner — build 60s here against ~70s
before, but the export upload 15s and the export checks 35s, against 15s in
run 39804987378. So the floor is ~2m–2m25s, ~1.5–1.75× the single job.

## Done: the history checks stay local

Operator: «давай прогонять estimates (и что ещё локальнее быстрее) локально, а
остальное в CI». `vet.sh local` runs the four checks that read the branch
against its merge base or the cost ledger — songs, squash, CLAUDE.md size,
estimates — in 2s locally; `source` drops them and checks out one commit.

## Done: one command

Operator: «а нельзя чтобы локальный скрипт просто сам запускал workflow?»
`scripts/vet-ci.sh` refuses an unpushed tree, dispatches, runs `vet.sh local`
meanwhile, finds the run by head SHA and waits on it, printing failed jobs'
logs. Measured: 2m11s wall clock (run 39810429946: 2m05s, shallow `source`
1m38s) against a bare local run in the session container of 4m37s — 2.1×.

## Done: the bare run is the split run

Operator: «нужно переписать "голый" vet.sh так, чтобы он делал всё то, что мы
сейчас нагородили» and «если сохранить опцию "всё на локальной машине" значит
сохранить много кода которым никто не будет пользоваться, то не надо». Bare
`vet.sh` does the dispatch itself (`vet-ci.sh` folded in, nothing else called
it); the one-machine run is gone, and with it the build-before-typecheck
ordering. Measured: 1m49s (run 39816552252).

Swept for what assumed the old run («и просвипи на похожее»): `/sync-branch`
vetted before pushing, which the new vet refuses, so its Step 5 pushes first;
`/finalize` Step 1, README, `vet.sh`'s header and the `test-on-gh` watermark
reason say "after pushing" / "dispatches to CI". The two skills are muthur-owned
— the next sync carries them back or flags the drift.

Left: `/go` Steps 3–4 (polish, PR body).

## The edges

1. **Shallow checkout → quiet passes.** No `origin/main` means the estimates
   gate checks nothing and the size cap only the ceiling, so the checks that
   read history are `vet.sh local`'s and no job runs one.
2. **Git identity** for the tests that commit into temp repos; **numpy** via
   `setup-python` (the system Python refuses pip under PEP 668).
3. **`.next` is hidden**, which upload-artifact skips unless told.
4. **A green run is not evidence by itself** — `run-parallel.sh` prints only
   failures, so `source` and `built` upload their per-check logs.
5. **CI pins pnpm 9** (`setup-toolchain`) where the container has 10 — CI's
   setup is now a site a toolchain change wires.
6. **`ci:` is a publishing type** — the squash redeploys every site (identical
   output).

## DRY notes

- `setup-toolchain` stays the one statement of the pnpm/Node pins.
- The workflow names phases, never checks; the lists live in `vet.sh`.
- The ESLint heap ceiling moves to `lint:files`, which `lint:check` and the
  shards both call, so it is still stated once.
- `place-vet-artifacts.sh` is the one place that maps artifacts back to paths,
  used by the one job that downloads the exports.
