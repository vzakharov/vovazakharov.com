# v20-watch-fixes — the proportional pivot allowance, the tap-in-the-air check

Builds `leg-timing.md` § 5 (proportional) and v14-catch's tap in the air.

## Step 1 — the proportional allowance (done)

- `pivotAllowance(lifted)` (`scripts/lib/veer-dash.ts`) is
  `1 / (1 − PIVOT_SHARE·|lifted|/π)`, 1 for `null`.
- **Not clamped at π**, as the prompt's formula had it, because the code
  does not clamp: `pivot` (`model/insect-motion.ts`) is
  `PIVOT_SHARE · span · |lifted| / π` with no cap, and `setOffFor`
  (`insect-steering.ts`, `evenly`) may fix `lifted` the long way round near a
  half turn, `|lifted|` up to π + `EVEN` (0.35) — a pivot of up to 0.278 of
  the leg. Clamped, such a leg's allowance would be short of its own pivot.
- The report's bound line names the half-turn bound ("after a half-turn
  pivot").
- `scripts/lib/veer-report.test.ts`: 7 tests — the allowance at a half turn,
  a quarter, either sign, and past a half turn; `flicks` passes a step
  between the bounds after a half turn and fails it after a 0.04 rad turn.

## Left

- Step 2, the tap-in-the-air check; step 3, the play run.
