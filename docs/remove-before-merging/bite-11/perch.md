# Bite 11 — package "perch" hand-over

Package 3's last items: the `fliers.test.ts` run against the 14-flower
seeded bed, and step 5, a released insect's first perch in view.

## Step 1 — `fliers.test.ts` against the 14-flower bed: passes

- Run alone, `node --import tsx --test src/pages/mushrooms/ui/scene/fliers.test.ts`,
  590 s timeout: **48/48 pass in 354 s** (wall clock 354 s), with nothing
  changed. So it exceeds the old 290 s cap but not the 590 s one; no fix was
  needed and nothing was made faster.
- Where the time goes: "the flies in a full forest" 232 s (20 visits × 6
  screens × 5 minutes of ten fliers, 34–42 s a screen), "all ten fliers"
  80 s, "the bees among the butterflies" 32 s, the catch sweep 5 s. Any
  future run must keep the 590 s timeout.

## Step 2 — a released insect's first perch in view: done

- `model/flight-in.ts` (new): `Onscreen` — the world's stretch the screen
  shows, in `Places` units, and an `inset`; `shownOf(perches, onscreen)` cuts
  flowers, bee flowers, caps, spotted caps and air down to the ones placed
  `inset` inside either edge, and moves the away spots to just past the
  screen's edges, so the flight in is timed from where it enters;
  `enteringSide` is the edge nearer the chosen perch.
- `firstFlight(…, onscreen?)`: with `onscreen`, the perch is drawn from the
  shown perches, falling back to the whole world only where that draw finds
  nothing but away (every spot in view taken); the leg's `from` is the nearer
  edge. Without it, the random stream and result are exactly as before, so
  `visit-play.ts` and every flier test run unchanged. `nextFlight` untouched:
  later perches stay world-wide.
- Threaded as `released(…, onscreen?)` (`insects.ts`) and the `release`
  action's optional `onscreen` (`game.ts`, two lines).
- Scene: `onscreenOf(layout, crop)` in `perch-sight.ts` converts the screen's
  two edges through `Crop.toWorld` (no `− scrollX`), inset by half the widest
  butterfly span so a seated insect is wholly in view; `meadow-scene.ts`'s
  release dispatch passes it (one line and the import). `InsectView` itself
  is unchanged: its first-frame `nearerEdge` already picks the same edge from
  where the perch stands on screen.
- Test: `model/flight-in.test.ts` — the first perch is in view for every
  kind over 200 seeds, the entering edge is the nearer one (both sides seen),
  the away spots sit just past the screen's edges, the air in view is roamed
  while every seat in view is taken, a perch is still found where the screen
  shows none, and later legs reach perches out of view.
- Passing: flight-in, flight, flight-kinds, insects, game, roaming, swarm,
  perch-sight (128 s). `fliers.test.ts` not rerun: it releases without
  `onscreen`, whose path is byte-for-byte the old one.

## Decided

- "In view" is the perch's place (a butterfly's seat) at least half the
  widest butterfly span inside the screen's edge.
- Where nothing in view is open (all air in view taken), the first perch is
  drawn from the whole world rather than the insect leaving.

## Left

- Nothing in this package's two steps. `meadow-scene.ts` is 461 lines (was
  460), past the ~450 rule of thumb; it is the orchestrator.
