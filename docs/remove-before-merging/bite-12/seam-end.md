# seam-end — hand-over note

Package: the three things `seam-tail.md` left — the flowers' sliver, the
mushrooms' and houses', and the walk play's `checkPops`. Paths under
`src/pages/mushrooms/ui/scene/` unless given.

## Done

1. d5bbaf8 — flowers and the walk play, together.
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

2. 1efc4d0 — mushrooms and houses. `mushroom-bed.ts` keeps `tall`,
   how far the tap area (cap, gills, stem at layout size, turned) reaches
   above the foot, written in `place` before it stands the mushroom, and
   `stand` passes it to `bedPlace`; the shadow and the house ride on the
   same place, so all three hide together. Walk green on tabL and phoneL,
   house green on phoneL. **Not exercised by a play**: neither walk carries
   a mushroom past the seam (the forest grows none behind the clump on
   these screens, and the rim is at −3.5), so the hide is covered only by
   `bed-place.test.ts`'s height rule.

3. A buried flower out of `inView` and taps: **holds since 1, with no
   further code.** A flower hidden by the sliver rule has `stands.drawn`
   false, which `inView` already requires, and its container invisible,
   which Phaser 4's `InputManager.inputCandidate` reads up the
   `parentContainer` chain (`willRender`), so its head takes no tap.

## Left

- A flower still drawn past the seam (more than `SHOWN_LEAST` showing)
  whose head is partly under the ground: a tap on the covered part of its
  head still reaches it, since the ground takes no taps, and `inView`
  counts it by its head's middle, which may be under the cover. Neither was
  asked for; closing either wants the cover row in `flower-bed.ts` (a hit
  test clipped at `groundTop + seamReach`).

## Decided

- **The play's sliver is relative, not a fixed few px.** On tabL a sunk
  flower at the seam is ~41 px tall, so the game hides it at ~8.3 px
  showing; a fixed 8 px failed three flowers by 0.3 px, and a fixed figure
  large enough for tabL's mushrooms would let a whole phone flower pop.
  The rule reads the game's own `SHOWN_LEAST`, plus 2 px for a frame's sink.
