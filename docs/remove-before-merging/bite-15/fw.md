# FW — the worms' review fixed (calls 26, 27, 28)

PR #57 review 5401128817, three inline comments on `model/worm.ts`.

## Done

- **Call 27** — `wormBody` keeps a segment within `END_SLACK` (1e-9) of
  either end of its path and clamps `along` into it, so a peek's head at
  exactly `WORM_LENGTH` survives a path length that rounds an ulp short.
  Test: the head shows whenever a peek is out, every species × 300 seeds ×
  every slot (fails on the old `along > length`). 8c0c11ca.
- **Call 26** — `peekPath(genes, from, girth)` rises
  `min(WORM_LENGTH, capSurface − MUSHROOM_INK − girth/2 − slot.y)`, never
  below 0; `wormPeek(elapsed, length, phase)` draws the body in to that
  length; `HouseWorm` passes the trip's `travel`. Test: at the peak every
  segment's top inside `headOutlines` and under `capSurface − MUSHROOM_INK`,
  every species × 300 seeds × every slot × girth 1× and 2×. A chanterelle's
  rounded lip and its funnel leave a ~0.002-unit sliver at the front rim; the
  test counts a top within `MUSHROOM_INK` of `capBase` there as on the cap.
  Measured on slot 0: fly agaric, porcini, chanterelle always a full body;
  **every russula shortened: median 0.46 of a body, least 0.21** (about a
  girth long, a stubby nub). The play's peek step checks
  `__probe.worm(id).head !== null` mid-hold.

## Left

- **Call 28** — girth floor and `WINDOW_REACH` in screen px over the zoom.
- Replies on GitHub.
