# seam-end — hand-over note

Package: the three things `seam-tail.md` left — the flowers' sliver, the
mushrooms' and houses', and the walk play's `checkPops`. Paths under
`src/pages/mushrooms/ui/scene/` unless given.

## Done

1. (this commit) — flowers and the walk play, together.
   - `flower-bed.ts` `stand`: `bedPlace(view, foot, headR - headY)`, the
     `seam-tail-flowers.patch` line, so a sunk flower hides its last sliver.
   - `scripts/lib/play-walk.ts`: the walk's trace records each thing's top
     **and drawn height** (a flower's top is now its head's, foot less
     `(headR − headY)·scale`, where `container.getBounds()` gave none);
     `checkPops` counts a start or stop of drawing as a pop only where it
     showed over the cover row (`groundTop + seamReach`, less the bob) more
     than `SHOWN_LEAST` of its drawn height + `SLIVER_SLACK` (2 px), and
     notes how many came and went under the cover.
   - Played (scratch worktree, the step's diff applied): walk green on tabL
     (5 under the cover on ↓, at most 8.4 px over it) and phoneL (5, at
     most 4.0 px).

## Left

- `mushroom-bed.ts` `stand`: pass the mushroom's drawn height.
- Optional: a buried flower out of `inView` and taps.

## Decided

- **The play's sliver is relative, not a fixed few px.** On tabL a sunk
  flower at the seam is ~41 px tall, so the game hides it at ~8.3 px
  showing; a fixed 8 px failed three flowers by 0.3 px, and a fixed figure
  large enough for tabL's mushrooms would let a whole phone flower pop.
  The rule reads the game's own `SHOWN_LEAST`, plus 2 px for a frame's sink.
