> ⛔ **DRAFT — DO NOT IMPLEMENT.** This plan is not approved. Do not edit source
> while this file is named `*.draft.do-not-implement.md` — prep and spikes go in
> `tmp/`. On an explicit operator go-ahead, `git mv` it to `*.in-progress.md`
> and delete this banner (quoting the go-ahead in the commit) _before_ touching
> code.

# Cut the game's plays down

The first item of `docs/masd.md` § "Open directions". The plays
(`pnpm play:mushrooms`, 18 plays × 5 screens) were written to build the game; in
run 40453462582 22 of their 30 groups failed, identically on the pre-MASD base
(40454592494), on checks the game has outgrown. The operator checked the game by
hand and found it fine: «кажется, необходимость в них отпала после того как игру
уже написали». Their jobs sit commented out in `vet.yml`.

## The fork: how far to cut

1. **(a) Remove the plays and the probe whole — recommended, and in force
   below.** The plays served building the game; the game's own tests (the meadow
   suite, sharded under `VET_MEADOW=1`) stay and hold its logic. A play red on
   22 of 30 groups for checks nobody wants back is not a signal anyone will
   restore, and keeping ~10k lines of harness for a hypothetical revival is what
   git history is for.
2. **(b) Keep one smoke play**: open `/mushrooms` on the five screens from the
   ordinary export `built` already has, fail on a page error. Keeps `cdp.ts` and
   a ~80-line driver, no probe build, and could join vet's `built` phase
   unconditionally. Worth it only if a page error on load is a failure that
   could reach production unseen — the build does not catch a runtime throw.
3. **(c) Keep the plays that still pass** (`hold,keys,veer,rain`,
   `night-run,dark,keep`, `sprouts,map,dusk` on some screens) and delete the
   rest. Keeps the probe and most of the shared harness for a fraction of the
   coverage; not recommended.

## What (a) removes

- **The harness**, `src/mushrooms/scripts/`: `play-mushrooms.ts`, every
  `lib/play-*.ts`, `lib/mushroom-probe*.ts`, `lib/cdp.ts`, `lib/flier-watch.ts`,
  `lib/veer-watch.ts`, `lib/veer-report.ts` (+ its test), `lib/painted-cap.ts` —
  whatever only the plays import, confirmed by knip after the cut.
- **Kept**: `sweep-mushrooms.ts` and `lib/frame-budget.ts` (+ test), which it
  imports; `veer-away.ts` and `lib/veer-dash.ts`, a measurement script with no
  browser — its header's reference to the veer play's `DASH_SLACK` is rewritten
  to stand on its own (or `DASH_SLACK` moves into it, if it lives in a play
  module); `build-mushroom-artifact.ts`.
- **The probe hook in the game**: the `NEXT_PUBLIC_MUSHROOM_PROBE` branch in
  `src/mushrooms/pages/mushrooms/ui/start-game.ts`, the variable in
  `src/kernel/shared/config/env.d.ts`, and any game-side member that exists only
  for the probe to read (`house-view.ts`, `house-worm.ts`, `rain-view.ts` carry
  "as the probe reads it" docstrings) — dropped where knip finds no other
  reader, its docstring rewritten where the game reads it too. Any seeded-random
  or stepped-tween hook the probe installs from outside stays outside and goes
  with it.
- **The wiring**: `package.json`'s `play:mushrooms`; `scripts/vet.sh`'s `probe`
  and `play` phases, usage line and header; the commented `probe`/`play` jobs in
  `.github/workflows/vet.yml` and the `meadow` input's description ("tests and
  plays" → tests).
- **The prose**: `.claude/rules/stack.md`'s sentence on the plays;
  `docs/masd.md` § "Open directions" loses its first item ("Four" → "Three");
  `.claude/skills/megabeast/notes/play-run-and-frames.md` and the other
  megabeast notes, `take-issue/video-frames.md`, and any other mention, each cut
  or pointed at the meadow tests. A retired note still cited from the tree
  leaves a `*retired.md` tombstone per CLAUDE.md § "Writing things down".

Touching the game's own files makes this a game change, so the vet run is
`VET_MEADOW=1 ./scripts/vet.sh`.

## DRY notes

Nothing is added, so nothing is shared or duplicated. The one reuse question is
the reverse: modules the plays share with scripts that stay (`frame-budget.ts`
with `sweep-mushrooms.ts`, `veer-dash.ts` with `veer-away.ts`) stay where they
are rather than being inlined, since each still has a consumer; knip is what
decides the rest.
