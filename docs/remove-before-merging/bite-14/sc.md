# SC — steps (c) and (d), the probe, the play, the sweep; the shed retired

Built `map-spores.md` § 5 (c) and (d) with § 4, on SA's model and SB's scene.

## Done

- **(c)** `scripts/lib/mushroom-probe.ts`: `sprouts()` returns `planting`
  (the flower picker open), `spores` (`id`, `parent`, `shown`, `at` — the
  dot's screen point, `null` while hidden or covered — and `apart`) and
  `sprouts`; `shed`/`oldInSight` gone, so the probe no longer reads
  `bed.inSight`. It reads `bed.spores.dots`, a private field.
- `scripts/lib/play-sprouts.ts`: the front cap of the opening clump tapped
  three times (three spores of it, drawn, within `SPROUT_REACH × 1.5`),
  frame `sprouts-1-sown`; one dot tapped (gone, no flower picker), frame
  `sprouts-2-picked`; a cloud tapped, none sprouted a frame before
  `darkAt`, none left and every sprout up and of its parent's species by
  `darkAt + SPROUT_WINDOW_MS` + 30 frames, frame `sprouts-3-up`; 24 timed
  frames after.
- `ui/scene/visit-play.ts`: `opened(…, showers)` — a round taps every
  mushroom up to `SPORE_SEATS` times through `sporeOnTap` and the real
  `select`, stopping at the first tap that sows none, then rains and runs
  `sproutedInRain` at the stop. Test rewritten (each sprout of its
  parent's species within `SPROUT_REACH`; two rounds extend one).
- `scripts/sweep-mushrooms.ts --showers N`: reports spores sown and come
  up, the share of the standing mushrooms that found all six seats every
  round, and the clump checks as before.

## Decisions the map did not take

- **Three frames, no grown step**: the brief asked for three frames, so the
  map's 20 s grow check (`sprouts-4-grown`) is dropped.

## Measured

- `pnpm sweep:mushrooms --showers 1 --visits 50 --screens tablet`: 84
  spores over the forests, 0 over the opening crops (a crop at
  `MUSHROOM_SLOTS` has no room — spores count against it, call 31); 0% of
  the forests' mushrooms found all six; on the opening clump a sprout in
  50/50 visits, median 10. The showered clumps' R1 check: cap 90.8%
  hidden (bound 25%), stem 100% (bound 50%), 40 patchless — the sprouts
  judged at full size crowd the clump. Reported, not chased.

## Left

- (d), the shed retired — see below once built.
