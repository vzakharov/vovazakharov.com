# pw2 — flight's ground under the finger (review-read2 item 5)

Done: `scripts/lib/play-walk-flight.ts` `playFlightDrag`, called from
`playWalk` after the taps check — taps the gait button, waits out the rise
(`RISE_EASE` + 30 frames), drags down 25 % of the screen from `BARE_START`,
asserts the ground under the crossing stays within 3 % of the swipe of the
finger on every move past the slop, read at `gaitHeight('flight')` (what
`lensAt` gives once risen), then flips back to steps. `crossingOf` is
mirrored in the script, since `walk.ts` keeps it unexported and was off
limits.

Run `--plays walk --screens tabL,phoneP`: played on both, at most 0.0 px
off over 11 moves.

Left: nothing.
