# Bite 10 — play-fails hand-over

Group `play-fails`: make `pnpm play:mushrooms` green on every screen.

## Done

On 89abb21 the run failed on phoneL only, with both failures reproducing
(the run is seeded). Both were the check, not the game:

- a1baeef — "the fly-agaric's band leaves 3 gaps": the band check took a
  mushroom's ink to reach 0.025 × size + 1 px past a part; the ink is
  grown wholly outward, up to 1.3 × `inkWidth` (floor 2 px), so a small cap's
  stem ink (2.6 px) read as ground. The band there is whole at device
  resolution. The check now allows `INK_REACH × inkWidth(size) + 1`.
- 6696e8e — "no butterfly came down on the chanterelle": always open, never
  crowded, just about a 1-in-4 cap pick, and 20 s of meadow was too short in
  that seed. The wait now looks every `REST_LOOK` frames (~160 s of meadow,
  the same drawn frames).

## Left

- Full run on HEAD after both fixes (and picker's tuft commits): pending.
