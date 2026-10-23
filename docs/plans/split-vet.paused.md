# Split vet: a fast default, `vet all` for the long checks, and `attest` to record them

## Why

#192 made the bare `scripts/vet.sh` dispatch the whole suite to GitHub's runners
and wait on it: ~2 min, and only on a pushed head. That broke muthur's meaning
of the name — the fast check run before pushing — and forced local edits on
`/finalize` Step 1 and `/sync-branch` Step 5 (push before vetting) that every
sync has to dodge. The operator, in the session that landed #192:

> по сути у нас это то, что должно гоняться при finalize, нет? кажется, что
> нужно это разделить, оставив в vet то что действительно быстро и локально, а
> потом создать новый шаг который запускается именно при finalize. а заодно
> сказать muthur чтобы решил эту проблему … создав например заглушку для
> "тяжёлой" части (и заодно решив как это всё называть-обзывать).

And on the naming, after weighing `check`/`vet`, `vet-full`, and a separate
`attest-checks.sh` hook:

> пусть A всё-таки. как оформить "долгие проверки" пусть каждый потребитель
> (включая нас) решает сам, а идиоматически кажется, аргумент vet лучше (и
> концептуально дешевле) передаёт суть.

## Measured here (4-core cloud container, `main` @ 4b194cf)

- `vet.sh source` 67 s, `typecheck` 23 s, `local` 2 s; the three in parallel
  **57 s**.
- Lint over the whole tree (`vet.sh lint 1/1`) **95 s**; over two files 8 s.

## The shape

### 1. `scripts/vet.sh` — fast by default, `all` for the long checks

- **Bare**: the fast local check, in the working tree, no push, about a minute —
  `source` + `typecheck` + `local` overlapped, plus ESLint over the files the
  branch changed (`scripts/lib/changed-files.sh`). No build, no export checks.
- **`vet.sh all`**: every check this repo has — today's dispatched GitHub run,
  unchanged: refuse an unpushed tree, dispatch `vet.yml`, run `local` meanwhile,
  wait, print failed job logs. It prints `vet: run <url>` for its caller.
- The phase entry points `vet.yml`'s jobs call (`build <site>`, `lint <k>/<n>`,
  `typecheck`, `source`, `built`, `local`) stay as they are.
- The contract any adopter's `vet.sh` keeps: bare is fast and local; `all` is
  whatever the project wants checked before an attestation, and may be the same
  as bare.

### 2. `scripts/attest.sh` — runs `vet.sh all` and posts the attestation

Written stack-free, so muthur can take it verbatim:

- refuses a tree that differs from the pushed head;
- runs `scripts/vet.sh all`, keeping its exit status and any `vet: run <url>`;
- writes the sticky comment `/finalize` Step 7 describes — the
  `<!-- finalize-attestation <sha> -->` marker the cost ledger parses, head,
  base and its subject, green or red, the run link — finding it by marker and
  editing it in place, never `--edit-last`;
- `--note <file>` appends lines the caller owns (the CI-only bucket line, a
  conflict the base merge resolved);
- `--no-vet "<why>"` posts the "none required" form without running anything;
- exits with `vet.sh all`'s status, so a red run is both recorded and reported.

The attestation is then written by the script that saw the run, so it cannot
claim more than ran.

### 3. Who runs which

- **`/finalize` Step 1** and **`/sync-branch` Step 5** go back to the source's
  text: `./scripts/vet.sh`, locally, no push.
- **`/finalize` Step 7** becomes: push, then `scripts/attest.sh` (with `--note`
  where it has something to add, `--no-vet` in `no vet` mode). It already runs
  after the sweep, so `vet all` verifies exactly the SHA attested. A red
  `attest.sh` is fixed under the two-shot rule and stands the `and merge` gate
  down, as a red Step 1 does now.
- **`/finalize revoke`** keeps working off the marker; re-read to confirm.
- **Everything else** that says "the vet run" (`/go`'s "not per commit",
  `/watch-ci`, `/qa-checklist`, `merge.md`'s gate rows, `/check-merge`'s
  re-attest note) is re-read and pointed at bare `vet` or `attest`, whichever it
  means.

### 4. Docs

- `.claude/rules/stack.md` — the fast default vs. `all` in the opening
  paragraph; the "split across GitHub's runners" text becomes `all`'s; `paths:`
  gains `scripts/attest.sh`.
- `CLAUDE.md` § "Vetting" and § "Deployment" (staged) — bare vet is the fast
  check; `/finalize`'s `attest.sh` runs `vet all` and is the pre-merge signal.
- `.claude/skills/update-muthur/watermark.json` — the `/finalize` and
  `/sync-branch` rows stop warning about the push and record the Step 7 change
  instead, until muthur carries it; `scripts/attest.sh` gets a row naming it a
  candidate to upstream. Each of these rows says outright that it is temporary:
  once muthur carries the split, the row goes and the files are taken verbatim.

### 5. Muthur — a separate session, after this lands

Propose upstream: `vet.sh`'s contract as above (bare fast, `all` defaulting to
bare), `attest.sh` verbatim, and `/finalize` Step 7 calling it. This branch
writes nothing to muthur.

## Open question

1. Lint in the bare run over **changed files only** (recommended — 8 s against
   95 s; `vet all` lints everything) or the whole tree?

## DRY notes

- **Shared:** one check list, in `vet.sh`; `all`, the bare run and `vet.yml`'s
  jobs all draw on its phases. The changed-file set is the existing
  `scripts/lib/changed-files.sh`.
- **Moved, not duplicated:** the sticky-comment mechanics (find by marker, PATCH
  in place) leave `/finalize` Step 7's prose for `attest.sh`; the skill keeps a
  pointer. `/squash-message` has the same mechanic for its own comment and keeps
  it — a shared helper for two comment kinds in two languages (prose recipe vs.
  script) would couple a skill to a script for a dozen lines.
- **Not extracted:** `attest.sh` reads the head/base the way `vet.sh` already
  does (`git rev-parse`, `git ls-remote`); two call sites of one-liners do not
  earn a library.

## Steps

- [x] `vet.sh`: bare → fast local set with changed-file lint; `all` → today's
      dispatched run, printing `vet: run <url>`.
- [x] `scripts/attest.sh` with `--note` and `--no-vet`; a test over its comment
      body and marker against a fake `gh` on `PATH`.
- [x] `/finalize` Steps 1 and 7, `/sync-branch` Step 5, `merge.md`, `revoke.md`
      check; re-point the other callers.
- [ ] staged `CLAUDE.md` (§ "Vetting", § "Deployment"), watermark rows — `stack.md` done.
- [ ] Measure the bare run on this branch; then this branch's own `/finalize`
      attests through `attest.sh`.
