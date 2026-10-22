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

## The edges

1. **Shallow checkout → quiet passes.** No `origin/main` means the estimates
   gate checks nothing and the size cap only the ceiling. `source` fetches full
   history; the other jobs read no history.
2. **Git identity** for the tests that commit into temp repos; **numpy** via
   `setup-python` (the system Python refuses pip under PEP 668).
3. **`.next` is hidden**, which upload-artifact skips unless told.
4. **A green run is not evidence by itself** — `run-parallel.sh` prints only
   failures, so `source` and `built` upload their per-check logs.
5. **CI pins pnpm 9** (`setup-toolchain`) where the container has 10 — CI's
   setup is now a site a toolchain change wires.
6. **`ci:` is a publishing type** — the squash redeploys every site (identical
   output).

Out of scope: `/finalize` still runs vet locally; pointing it at a dispatch is a
separate change to a muthur-owned skill.

## DRY notes

- `setup-toolchain` stays the one statement of the pnpm/Node pins.
- The workflow names phases, never checks; the lists live in `vet.sh`.
- The ESLint heap ceiling moves to `lint:files`, which `lint:check` and the
  shards both call, so it is still stated once.
- `place-vet-artifacts.sh` is the one place that maps artifacts back to paths,
  used by both jobs that download builds.
