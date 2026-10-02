# v15-watch — the flier watch skips a shying flier's heading

From `v15-play.md`'s first red (fly-7's worst heading, 2.79 / 2.53 rad): a
caught flier darts (`insect-dart.ts`), which moves its point without turning
it, so the watch's heading check read the dart as the way it flew.

## Done

- `scripts/lib/flier-watch.ts`: the heading check (and the per-kind
  `headings` count) skips a flier while `flier.shied === flier.legs` — the
  same test as `isShying` in `src/pages/mushrooms/model/insects.ts`, read off
  the scene's own flier, so no probe or `src/` change. Every other check is
  unchanged.

## Left

- No unit test: the watch is a script string run in the page against the
  live scene, not a pure function, and no test covers it today.
- No play run (out of scope); the next play run confirms the red is gone.
