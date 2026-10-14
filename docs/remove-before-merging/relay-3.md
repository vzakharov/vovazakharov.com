# Relay 3 — no-pick-omit

## Standing constraints

- «да, байты передавай без моего одобрения сам» — bites hand over to the next
  session without the operator's review; each bite's end relays on its own.

## The conversation

This session was started by relay 2 with `/relay take claude/no-pick-omit-ikbd3v`;
no operator message arrived in it. The operator's own messages are in
`docs/remove-before-merging/relay-1.md` § "The conversation".

The agent resumed the paused plan, took bite 2 (`src/pages/mushrooms/model/`,
27 files), ran the meadow suite, `/polish` and the `/pr` refresh (both in
subagents), paused the plan and relayed. The context-budget warning came at
~200k mid-bite; the rest fit, so the bite was finished rather than paused.

## Intent

Unchanged: ban `Pick`/`Omit` over the repo's own types so narrow types (and
narrow zod schemas) are declared first and wide ones built from them. Not
urgent; one PR, landed whole; no review between bites.

## Decisions

Relays 1–2 stand. Added in this session:

- **Single-member bases are fine** where sites pick overlapping subsets (`Leg`'s
  `Origin`, `Destination`, `Leaving`, `OutFirst`; `Span`'s `Departing`,
  `Arriving`). Names avoid existing exports (`Routed`, `Airborne` were taken in
  `insect-paths.ts`, hence `Route`, `Scheduled`).
- **`pnpm type-overlap` floor 2 forces a named combination** wherever two types
  spell the same pair of bases (`Tilted`, `Classed`, `FlowersSeen`,
  `GroundedScreen` reused in `Camera`).
- **A base unused outside its file is declared without `export`** (knip); a
  `ui/` site needing it exports it then.
- **`KeptMeadow` moved into `game.ts`** beside `Meadow = Unkept & KeptMeadow`;
  `UNKEPT` now `satisfies Unkept`.
- **`Sized` in `src/shared/typings` gained `WithWidth`** for the pan's `View`.

## Errors and dead ends

- An import-merging Python script computed offsets once per file and then
  edited several modules, garbling four import blocks; repaired by hand. Merge
  duplicate imports one module at a time, or by hand.
- `pnpm test:meadow` in one Bash call overruns the 10-minute limit; chunked runs
  (`split -n l/12`) each finish in under 4 minutes. Noted in the plan.

## State

- Branch `claude/no-pick-omit-ikbd3v`, head `0022fa0` before this summary's
  commit, pushed.
- Draft PR https://github.com/vzakharov/vovazakharov.com/pull/158, OPEN, CLEAN;
  body refreshed to two bites done; squash comment unchanged (still accurate).
- Plan `docs/plans/no-pick-omit.paused.md`; bite 2 folded into
  `## Eaten so far`; `## Rest of the elephant` holds `ui/`+`api/` (150 sites in
  71 files, 69 files in the override).
- Polish floor: `37cea97`.
- Estimate: this session 2.5 h senior developer (bite 2). Remainder handed on:
  5.5 h senior developer — "the meadow ui's ~150 sites need its wide types
  (`MeadowLayout`, `Placed`, `Shown`, `Scened`, the scene classes) decomposed
  into named bases, a naming judgement per type that a codemod cannot make".
- Nothing running, no PR subscription. The muthur sync offer was made; do not
  make it again.

## Pointers

- `docs/plans/no-pick-omit.paused.md` — contract, recipe, loop, the model bases
  already declared and which `ui/` picks they cover.
- `docs/remove-before-merging/relay-1.md` — the operator's messages verbatim.
- `eslint/rules/no-pick-omit.ts`; `eslint.config.ts`'s override (69 files).
- Checks: `pnpm -s typecheck`, `lint`, `type-overlap`, `knip`; meadow tests
  chunked as the plan says.
- Predecessor transcripts: https://claude.ai/code/session_01Jx3urgG9XBCWWxUzKbbUBb
  (this one), https://claude.ai/code/session_01RX1shpsr6SPcZs4je8rKoS (relay 2),
  https://claude.ai/code/session_014kf4pQVj4A1ZWtBJR9onxj (relay 1).

## Next step

`go` — resume the paused plan from `/go` Step 1: take the next bite (half of
`src/pages/mushrooms/ui/` and `api/`, by the plan's "likely two bites"), then
Steps 3–4, pause, and `/relay go` to the next bite without asking the
operator. The last bite removes the override and completes the plan.
