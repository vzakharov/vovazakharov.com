> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source
> while this file is named `*.draft.do-not-implement.md` — prep and spikes go in
> `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md`
> and delete this banner (quoting the go-ahead in the commit) _before_ touching
> code.

# Split vet: a fast local check, and a full run only /finalize makes

## Why

#192 made the bare `scripts/vet.sh` dispatch the whole suite to GitHub's runners
and wait on it: ~2 min, and only on a pushed head. That broke the name's
contract with muthur, whose `vet.sh` is "the fast checks the agent runs before
pushing", and forced two local edits on `/finalize` Step 1 and `/sync-branch`
Step 5 (push before vetting) that every sync has to dodge. The operator, in the
session that landed #192:

> по сути у нас это то, что должно гоняться при finalize, нет? кажется, что
> нужно это разделить, оставив в vet то что действительно быстро и локально, а
> потом создать новый шаг который запускается именно при finalize. а заодно
> сказать muthur чтобы решил эту проблему … создав например заглушку для
> "тяжёлой" части (и заодно решив как это всё называть-обзывать).

## Measured here (4-core cloud container, `main` @ 4b194cf)

- `vet.sh source` 67 s, `typecheck` 23 s, `local` 2 s; the three in parallel
  **57 s**.
- Lint over the whole tree (`vet.sh lint 1/1`) **95 s**; over two files 8 s —
  the type-aware program build dominates only past a few dozen files.
- The builds are not measured again: four of them were most of the old 4.5 min.

## The split

### 1. `scripts/vet.sh` — fast, local, unpushed

Runs in the working tree, no push, no network, in about a minute:

- `source` + `typecheck` + `local`, overlapped as above;
- ESLint over **the files the branch changed** (`scripts/lib/changed-files.sh`,
  which the song checks already use), not the whole tree;
- no build and no export checks (`built`): those need the four builds.

So it catches format, type, lint-on-what-you-touched, tests, the agent-infra
gates. What it cannot catch — a broken page or route, a lint finding in an
untouched file that a changed type caused, the export checks — is the full
run's.

The phase entry points (`vet.sh build <site>`, `lint <k>/<n>`, …) stay as they
are: `vet.yml`'s jobs call them.

### 2. `scripts/vet-full.sh` — the full run, on GitHub, pushed head only

Today's bare `vet.sh` body moves here unchanged: refuse an unpushed tree,
dispatch `vet.yml`, run `local` meanwhile, wait, print failed job logs. The
whole roster, builds included, as it is now.

### 3. Who runs which

- **`/finalize`** — Step 1 and `/sync-branch` Step 5 go back to muthur's text:
  `./scripts/vet.sh`, locally, no push. A **new step between 6's sweep and 7's
  attestation** pushes and runs `scripts/vet-full.sh` on the head the
  attestation will name. After the sweep, because then the run verifies exactly
  the SHA attested; a red run there is fixed under the two-shot rule and makes
  the `and merge` gate stand down like a red Step 1 does now.
- **`/sync-branch` alone** — fast vet only; the merge gets its full run at
  `/finalize`.
- **Attestation** — two lines, `vet.sh` and `vet-full.sh`, each with its result;
  the full run's line carries the run link.
- **Everything else** that says "the vet run" (`/go`'s "not per commit",
  `/watch-ci`, `/qa-checklist`, `merge.md`'s gate rows) is re-read and pointed
  at whichever of the two it means.

### 4. Docs

- `.claude/rules/stack.md` — the roster says which checks the fast run skips,
  the "split across GitHub's runners" paragraph moves to `vet-full.sh`, and its
  `paths:` gains `scripts/vet-full.sh`.
- `CLAUDE.md` § "Vetting" (staged) — two sentences: the fast local check, and
  the full run `/finalize` makes; "Nothing runs on pull requests, so a green
  `./scripts/vet.sh` is the only pre-merge signal" in § "Deployment" becomes the
  full run.
- `.claude/skills/update-muthur/watermark.json` — the `/finalize` and
  `/sync-branch` rows stop warning about the push; they record the one added
  step instead, until muthur carries it. `scripts/vet-full.sh` gets a row.

### 5. Muthur — a separate session, after this lands

Per the operator, a session on muthur once this is merged: propose
`scripts/vet-full.sh` as a stub that `exec`s `scripts/vet.sh` — so an adopter
with nothing heavier gets the same run twice for free — and `/finalize`'s new
step calling it. This branch writes nothing to muthur.

## Naming — recommended `vet.sh` / `vet-full.sh`

1. **`vet.sh` + `vet-full.sh`** (recommended) — keeps muthur's meaning of
   `vet.sh` untouched, says the relation in the name (full ⊇ fast), and the stub
   is a one-line `exec`. `grep vet` finds both.
2. `vet.sh` + `land-check.sh` — names the moment rather than the scope; reads
   well in `/finalize`, worse anywhere else.
3. `vet.sh` + `gate.sh` — rejected: `deploy.yml` already has a `gate` job that
   means the publish switch.

The plan is written with option 1 in force.

## Open questions

1. Name — option 1 above unless you pick another.
2. Lint in the fast run on **changed files only** (recommended — 8 s against 95
   s; the full run lints everything) or the whole tree?

## DRY notes

- **Shared:** both entry points dispatch through one `vet.sh` phase vocabulary;
  `vet-full.sh` calls `scripts/vet.sh local` and `vet.yml` calls the phases, so
  the check lists stay in `vet.sh` alone. The changed-file set comes from the
  existing `scripts/lib/changed-files.sh`, not a second diff.
- **Moved, not duplicated:** `dispatched()` leaves `vet.sh` for `vet-full.sh`.
- **Not extracted:** a shared "verdict/logged" helper library for two scripts —
  `vet-full.sh` needs only the verdict, three lines; a sourced lib would be more
  surface than it saves.

## Steps

- [ ] `scripts/vet-full.sh` with `dispatched()`; bare `vet.sh` runs the fast set
      locally, lint over changed files.
- [ ] `/finalize` Step 1 and `/sync-branch` Step 5 back to the source's text;
      new full-run step before the attestation; attestation template; `merge.md`
      gate row.
- [ ] Re-point the other callers.
- [ ] `stack.md`, staged `CLAUDE.md`, watermark rows.
- [ ] Measure the fast run on this branch; `./scripts/vet.sh` then
      `scripts/vet-full.sh` green.
