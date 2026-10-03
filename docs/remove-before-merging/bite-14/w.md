# W — the watch allows the bend's slope (call 42)

`bite-14.md` § "Left, in order" item 2.

## Done

- `scripts/lib/flier-watch.ts`: `MOST_TURN_RATE` is `TURN_RATE × BEND_SLOPE`
  (1.01, was × 1.001 for rounding). The bound is a named margin, not derived:
  the drawn turn's excess over the model's comes from `bentTurn`
  (`insect-drawn.ts`) through `viewOf`'s row bend, `aloftFramed`'s ease onto
  the grass and the flier's own move across the screen in the frame, so no
  one closed-form slope of the lens bounds it cheaply and exactly. 1 % covers
  the measured 1.005 with room. Nothing else the watch checks changed.
- `pnpm play:mushrooms --plays meadow --screens tabL`: **played**, green —
  fastest turn 36.18 rad/s (fly) against 36.36; frame budget 14.1 ms median.

## Left

Nothing.
