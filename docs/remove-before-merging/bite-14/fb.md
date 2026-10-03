# FB — the frame budget reports, never fails

Done. `scripts/lib/frame-budget.ts` drops `overBudget` for `budgetReport`
(one `frame budget: <median> ms median over <n> frames, within / over the
26 ms budget — reported, not failing` line) and `againstBudget` (the same
label for a single number). Every caller notes the line instead of failing:
`play-mushrooms.ts` per screen, `play-rain.ts` (closing, mid-shower,
reopening), `play-approach.ts` (the forest walk, and the lawn's heaviest
share of a sow frame from `__probe.tendFrames()`). The number stays 26.

Kept as failures: a screen that timed no frame at all (a broken probe, not a
slow frame), and the approach's "bees planted and no frame ran a tending
call".

Checked: `frame-budget.test.ts`, `pnpm typecheck`, eslint/prettier, and
`pnpm play:mushrooms --plays meadow --screens tabL` (10.8 ms, exit 0).

Left for the orchestrator (not edited, outside this package):
`.claude/skills/megabeast/notes/play-run-and-frames.md` lines 89–90 ("report
… and fail past a budget"), 140–142 ("fails it falsely") and 178–190 ("a
frame-budget red"); `docs/plans/mushroom-game-syama/rain.md:67` ("holds the
26 ms frame budget"); the plan's line 291 ("fails … past 26 ms").
