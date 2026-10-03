# FW — the worms' review fixed (calls 26, 27, 28)

PR #57 review 5401128817, three inline comments on `model/worm.ts`.

## Done

- **Call 27** — `wormBody` keeps a segment within `END_SLACK` (1e-9) of
  either end of its path and clamps `along` into it, so a peek's head at
  exactly `WORM_LENGTH` survives a path length that rounds an ulp short.
  Test: the head shows whenever a peek is out, every species × 300 seeds ×
  every slot (fails on the old `along > length`).

## Left

- **Call 26** — the peek bounded by its cap.
- **Call 28** — girth floor and `WINDOW_REACH` in screen px over the zoom.
- Replies on GitHub.
