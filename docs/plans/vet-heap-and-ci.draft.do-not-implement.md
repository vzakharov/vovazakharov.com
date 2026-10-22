> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source
> while this file is named `*.draft.do-not-implement.md` — prep and spikes go in
> `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md`
> and delete this banner (quoting the go-ahead in the commit) _before_ touching
> code.

# ESLint out of memory in vet: one TypeScript program, then CI on PRs

## The cause, measured

`projectService` gives every file the nearest `tsconfig.json`, so the linter
holds five TypeScript programs — the root one and one per `apps/*/` — each of
which pulls in nearly all of `src/` and the Mantine/Next/React types. Pointing
every file at the root `tsconfig.json` alone makes one program, and that is
enough: at this container's default heap ceiling (2240 MB) the current config
dies of "heap out of memory" and the one-program config passes, linting the same
847 files with the same zero errors.

Measured on `main` at c982698 after `pnpm build`, 4 cores, Node 24.14, with a
`process.memoryUsage()` sampler preloaded (spike files under `tmp/heap-spike/`):

- **Today, cap 8192** — peak `heapUsed` 4958 MB, 126 s.
- **One program, cap 8192** — 3567 MB, 99 s.
- **One program, no `react-compiler`, cap 8192** — 2836 MB, 94 s.
- **One program, no `boundaries/*`, cap 8192** — 3551 MB (boundaries costs
  nothing).
- **Today, cap 2240** — OOM, exit 1.
- **One program, cap 2240** — passes; peak `heapUsed` 1683 MB, RSS 2090 MB.
- **`tsc --noEmit` on the root config** — 933 MB, 2968 files: the program itself
  is under a gigabyte.

Why the 8192 figures overstate the need: with a high cap V8 collects lazily, so
peak `heapUsed` counts garbage nobody was holding. The cap-2240 run is the
number that answers "does it fit" — about 1.7 GB live, 0.5 GB of headroom in
this container, more on a 16 GB laptop (~4 GB default).

## Approach

This PR fixes the local vet run and stops there; CI on PRs is the next slice,
its own issue and PR (§ "The next slice").

1. **One program.** In `eslint.config.ts`'s type-aware block, replace
   `projectService: true` with `project: ['./tsconfig.json']` plus
   `tsconfigRootDir: import.meta.dirname`. The root `tsconfig.json` already
   includes every file ESLint lints (`**/*.ts{,x}`, `apps/*/.next/types/**`),
   and its `paths` maps `@/*` to `./src/*` the same way each app's does — so a
   file under `apps/*/app/` resolves its imports identically. A file the root
   program does not include fails loudly ("not included in any of the
   projects"), which is the right failure. Rewrite the comment above it, and the
   "Type-aware linting is enabled via parserOptions.projectService" line in the
   file header, to say why one program: memory, with the measurement's gist.
2. **A fixed heap ceiling, stated once.** A new `lint:check` script,
   `NODE_OPTIONS=--max-old-space-size=3072 eslint .`, and `lint` becomes
   `pnpm lint:check --fix`. Vet's fan-out calls `pnpm lint:check` instead of
   `pnpm exec eslint .`. The point is determinism rather than room: Node's
   default ceiling is a function of the machine, so without a fixed one the same
   tree passes on a laptop and fails in a container — exactly how this went
   unnoticed until two attestations tripped on it. 3072 is ~1.8× today's live
   peak; growth past it fails the same way everywhere, which is the signal to
   look again rather than to raise the number.
3. **Docs that name the command.** `.claude/rules/stack.md`'s list and its
   "Never call `pnpm lint` from vet" bullet name `pnpm exec eslint .`; they
   switch to `pnpm lint:check`, and the bullet gains the ceiling's one-line why.
   `scripts/vet.sh`'s comment ("Not `pnpm lint` — it carries --fix") follows.
   `stack.md` loads only on path, so it is edited in place; nothing here is in
   the staged set.
4. **Verify.** `./scripts/vet.sh` green with no `NODE_OPTIONS` in the
   environment; then `NODE_OPTIONS=--max-old-space-size=2240 pnpm lint:check` to
   confirm the script's own flag wins over an inherited one (the later
   `--max-old-space-size` does, but it is checked, not assumed).

## The next slice: CI on pull requests

Proposed as an issue for its own PR, coarse here. It is whole without this one —
a workflow is a workflow — and this one is needed without it: `/finalize` runs
vet locally even where a PR workflow exists (its Step 1, and Step 4 watches the
workflow on top), so CI adds a signal but never removes the local OOM.

- A `vet.yml` on `pull_request`: a build job per site uploading `apps/*/out` and
  `.next/types` as artifacts, then the checks that read them (`typecheck`,
  `mantine-styles`, `i18n-payload`, `cv-pages`) in a job that downloads them,
  and the build-independent checks (eslint, format, stylelint, fsd, knip, tests,
  infra tests) in parallel jobs from the start.
- Conventions it changes: CLAUDE.md § "Deployment"'s "Nothing runs on pull
  requests", `stack.md`'s type-overlap bullet ("the vet run is the only place it
  fires"), and which branch of `/finalize` applies — the existing `/watch-ci`
  one, so no skill grows a new path.
- Open there, not here: whether vet stays the full list locally or sheds the
  slow checks to CI, and the minutes the matrix spends per push.

## Alternatives weighed

- **Only raise the heap in vet and `lint`.** Green tomorrow, but it pays for
  four redundant programs forever (1.4 GB at the 8192 cap, and 27 s) and leaves
  the ceiling as the only fix, so the next growth is met by another raise. It
  survives as step 2, on top of the fix rather than instead of it.
- **CI instead of a local fix.** Moves the eslint run to a 16 GB runner, but
  agents still run vet at `/finalize`, so the local OOM stays.
- **Dropping `react-compiler`.** Its rule costs ~0.7 GB; not on the table, since
  one program already fits and the rule guards compiler compatibility.

## DRY notes

- The ceiling has one home, `lint:check`; `lint` and vet both go through it
  rather than each spelling `--max-old-space-size`.
- The parser setting stays the single `parserOptions` block it is today; no
  per-app override is added, which is what one program means.
- No helper is extracted: the change is two config lines and two scripts.
