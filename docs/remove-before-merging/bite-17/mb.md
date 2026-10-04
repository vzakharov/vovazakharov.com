# mb — the bed and the walk under the line-count rule

Done, as one step (a refactor, no frame changes):

- `ui/scene/mushroom-bed.ts` 486 → 432: the per-frame move of one mushroom
  (breath, wobble, growth, rain swell, shadow spread, house following) is
  `moveMushroom` in the new `ui/scene/mushroom-frame.ts` (66), with
  `WOBBLE_ROCK`, `SHADOW_SPREAD` and `RAIN_SWELL`. The bed keeps the
  sink-away destroy and the selection's pose around the call.
- `model/walk.ts` 454 → 449: `turningFrom` (one caller) inlined into
  `locking`, its rationale merged into `locking`'s comment; `crossingOf`
  exported.
- `scripts/lib/play-walk-flight.ts` imports `crossingOf` from `walk.ts`
  instead of its copy.

Left: nothing.
