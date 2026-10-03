# ST — the showered clump's layout red, traced

## Cause

`roomFor` judged each spore against the meadow's **mushrooms only**: the
spores already lying stood in `pickFoot`'s `feet` (foot spacing) and in the
crowding count, but not in `standingOn`'s `others` (what it hides and what
hides it), `doorsKept` or `patchesAround`. So the sixth spore round a cap was
laid clear of the cap but not of the five siblings beside it — each passing
alone, all of them failing together once the rain stood them up full-grown.
None of (i)–(iii): the sweep sows through the game's own `sporeOnTap` and
`roomFor`, and the measure holds against the old shed.

## Measured (tablet, `--showers 1 --visits 50`)

| run                               | clump: cap / stem hidden | patchless | clump sprouts (median) | forests: stem hidden |
| --------------------------------- | ------------------------ | --------- | ---------------------- | -------------------- |
| old shed (1b684305)               | 22.5 / 48.3              | none      | 150 (3)                | 29.6                 |
| spores, before the fix (eb66ec9b) | 90.8 / 100               | 40        | 495 (10)               | 61.1                 |
| spores, fixed                     | 24.8 / 50.0              | none      | 345 (7)                | 39.0                 |

- Before the fix, a scratch who-hides-whom count over the 50 clumps: 257
  parts past `MOST_HIDDEN`, every one hidden by at least one sprout, 0 by
  old mushrooms alone.
- Fixed, phone and desktop: clump 24.8 / 50.0, no patchless, median 7;
  phone's "under a fingertip" 62.2% (old shed: 47.8% over 2000 visits).

## Done

- `ui/scene/mushroom-room.ts`: `roomFor` judges the meadow `risen` — every
  lying spore stood as the full-grown mushroom it comes up as (memoised on
  the spores and mushrooms arrays, so the standings cached on them hold);
  `feet` reads the risen mushrooms; `keptRoom` answers again when the spores
  change (`FOUND_FROM` gains `spores`); the stale "sprout shed round `near`"
  doc now says a spore.
- `ui/scene/visit-play.test.ts`: three showered visits (1, 316763, 950283)
  keep every cap and stem within `MOST_HIDDEN` and every patch — fails
  without the fix (visit 1).

## Decided

- The risen stand also replots the flowers off the spores' feet when
  judging, as the meadow will once they sprout; a `+` is judged against that
  meadow, not the one drawn now.
