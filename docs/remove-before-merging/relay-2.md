# Relay 2 — no-pick-omit

## Standing constraints

- «да, байты передавай без моего одобрения сам» — bites hand over to the next
  session without the operator's review; each bite's end relays on its own.

## The conversation

This session was started by relay 1 with `/relay take claude/no-pick-omit-ikbd3v`;
no operator message arrived in it. The earlier conversation is in
`docs/remove-before-merging/relay-1.md` § "The conversation".

The agent resumed the paused plan, took bite 1 (the 21 flagged files outside
`src/pages/mushrooms/`), ran `/polish` and the `/pr` refresh, paused the plan
and relayed. The context-budget warning came mid-bite; the bite fit, so it was
finished rather than paused.

## Intent

Unchanged from relay 1: ban `Pick`/`Omit` over the repo's own types so narrow
types (and narrow zod schemas) are declared first and wide ones built from them.
Not urgent; one PR, landed whole; no review between bites.

## Decisions

Relay 1's stand. Added in this session:

- **Narrow bases live where the wide type is declared**, exported only when a
  consumer outside needs them (`SiteConfig` and `RssItem` lost their `export`
  once knip found them unused).
- **Narrow zod schemas, wide one `.extend(narrow.shape)`**, for the song
  frontmatter (`Released`, `Tracked`, `Mastered`, `Mp3Copied`, `CreditedSong`,
  `ScriptKept`, `UntitledSongText`) and the case (`Docketed`). A narrow
  `WithFrontmatter<BaseFrontmatter & Docketed>` replaces a pick, since
  `WithFrontmatter` requires `BaseFrontmatter`.
- **A meadow file may gain a base for a non-meadow site** — `Opened` in
  `src/pages/mushrooms/model/mouse-run-clock.ts`, for `scripts/lib/play-runs.ts`.
  The file stays in the override for its own sites.
- **`LaunchButtons` takes `Messages['music']` whole** (the plan's call), at ~3 KB
  more in the music index's RSC payload; named in the PR body.
- `/polish` and the `/pr` refresh ran in subagents to spare this session's
  context; both pushed.

## Errors and dead ends

None worth keeping.

## State

- Branch `claude/no-pick-omit-ikbd3v`, head `923d719` before this summary's
  commit, pushed.
- Draft PR https://github.com/vzakharov/vovazakharov.com/pull/158, title
  `chore: ban Pick and Omit over the repo's own types`; body and squash
  proposal refreshed to the elephant scope.
- Plan `docs/plans/no-pick-omit.paused.md`; bite 1 folded into
  `## Eaten so far`; `## Rest of the elephant` holds `model/` (49 sites in 27
  files) and `ui/`+`api/` (150 sites in 71 files, likely two bites).
- The override in `eslint.config.ts` lists the 96 meadow files left.
- Polish floor: `8ef4ebc` (`polish:` commit).
- Estimate: this session 3 h senior developer (bite 1). Remainder handed on:
  8 h senior developer — "the meadow's ~200 sites need its wide types (`Leg`,
  `Perches`, `MushroomGenes`, the scene classes) decomposed into named bases, a
  naming judgement per type that a codemod cannot make".
- Nothing running, no PR subscription. The muthur sync offer was made; do not
  make it again.

## Pointers

- `docs/plans/no-pick-omit.paused.md` — contract, recipe, loop, what is left.
- `docs/remove-before-merging/relay-1.md` — the operator's messages verbatim.
- `eslint/rules/no-pick-omit.ts` and its test; `eslint.config.ts`'s override.
- A meadow bite runs `VET_MEADOW=1 ./scripts/vet.sh` or `pnpm test:meadow`
  before it pauses (`src/pages/mushrooms/CLAUDE.md`).
- Checks this bite used: `pnpm -s typecheck`, `pnpm -s type-overlap`,
  `pnpm -s knip`, `pnpm -s lint`, `pnpm -s test`.
- Predecessor transcripts: https://claude.ai/code/session_01RX1shpsr6SPcZs4je8rKoS
  (this one), https://claude.ai/code/session_014kf4pQVj4A1ZWtBJR9onxj (relay 1).

## Next step

`go` — resume the paused plan from `/go` Step 1: take the next bite
(`src/pages/mushrooms/model/`), then Steps 3–4, pause, and `/relay go` to the
next bite without asking the operator.
