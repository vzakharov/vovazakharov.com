# FS — the review's spores/sprouting findings

## Done

1. **The hidden spore** (blocking). Cause measured on phoneP before the fix:
   spore-3's dot at depth 661 sat under mushroom-2 (depth 782, its own
   parent, nearer) — `topAt` named `mushroom:mushroom-2`. Fix:
   `ui/scene/spore-sight.ts` `dotInSight(view, covers, foot)` (bedPlace +
   `flower-cover.ts`'s `inSightPast`, no second cover test); `roomFor`'s
   `near` search admits a foot only where the dot is in sight past
   `coversShown(view, stand.layout, stand.mushrooms)` and off every
   `keepOff` circle. `opened` returns `sowed` (the meadow as the last rain
   found it); the sweep's `--showers` prints covered dots on the clumps.
   `sprouts` play expects `at !== null`. `spore-seats.test.ts` moved to
   visit 2 (visit 1's first mushroom now finds 5 seats, not 6).
   - Sweep `--showers 1 --visits 50`, clumps: tablet before 59/345 dots
     covered, after 0/319, cap/stem hidden 24.8/50.0, median 6 sprouts;
     phone before 52/347, after 0/324, 24.8/50.0, median 6 (ST: 24.8/50.0,
     median 7).
   - `sprouts` play: tabL and phoneP pass, three dots shown and reachable,
     both sprouts visible. Frames `frames/bite-14/fs-phoneP-*.png`.

## Left

2. Dead hidden phase (`mushroom-bed.ts:237`, `sprouting.ts:27`): start the
   sprout clock at its moment (`sproutedInRain` stamps `at = moment`), drop
   `sproutScale`'s 0 branch, the bed's `young > 0` gates and `isOld`'s
   `+ SPORE_FALL_MS`; reword `SPORE_FALL_MS` as the tap's fall time; update
   `sprouting.test.ts`; `visit-play.ts`'s `SHOWER_EVERY` drops the term.
3. Nits: `placement.ts` lines 4/143 "a sprout's parent" → a spore's;
   `SPROUT_REACH` → `SPORE_REACH` (used in mushroom-room, play-sprouts,
   spore-seats.test); `spore-drift.ts:107` swing toward
   `sign(end.x - start.x)`, a centred foot by the spore's seed.

## FS2

Picks up § Left. Call 40's late spore (sprouting past the stop) left as is.

- Step 2 done: the sprout's clock starts at its moment (`at = moment`);
  `sproutScale` has no hidden 0 phase, `isOld`, the bed's visibility,
  `mushroom-shown`'s `plantedAt` and `visit-play`'s `SHOWER_EVERY` drop
  `SPORE_FALL_MS`, now documented as the tap's fall time. Tests updated
  (`sprouting`, `perch-sight`). Visible timing unchanged.
- Step 3 done: `placement.ts`/`mushroom-room.ts` say a spore's parent;
  `SPROUT_REACH` is `SPORE_REACH`; `fall` takes the spore's seed and swings
  its arc toward the foot's side (`sideOf`, fixed at set-off), a foot
  straight under the crown by the seed's parity.
- `sprouts` play, tabL: passes — three dots 0.96/0.99/0.70 apart, one
  picked, rain brings 2 sprouts up at start size, 0 spores left, frame
  14.2 ms. Nothing left.
