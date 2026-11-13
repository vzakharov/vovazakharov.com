# Sea — reports to the lead, newest first

## 2026-11-13 ~12:25Z — state of the package at 376d8709

Branch `claude/cube-intro-sea`, head 376d8709 plus this report; the lead merged
376d8709 unjudged at 6637594a. Typecheck, 73/73 shaders, eslint and prettier on
`src/cube/shared/{sea,outside}` and the sea/outside tests were green at
061a4e87; 376d8709 changed shaders only and compiles 73/73.

### Done and seen in frames

- **The breaker is one wave again** (061a4e87). The shore's cusps
  (`outside/shore-cusps.ts`, three rolled sines along the crest) scale only how
  far the swash is thrown: `swellLevel(run, bed, shelter, tongue, seconds)`
  passes `shelter * tongue` to the sheets alone, and `shoreClock` carries
  `tongue`. Seen at 061a4e87: the breaker continuous from the side, the
  waterline in tongues from dry sand.
- **The lace's beach plan** is log-polar round the island (33ad5cd2), which
  ended the hairline fans; seen at 501fa487 and 061a4e87.

### Done, not yet seen in frames

376d8709, both answering the lead's `wake-sea` frame at 49186bc5:

- Far foam is drawn as its pixel's mean: the lace's patches, the roller's ragged
  edge and the roller's width are filtered by the pixel's width
  (`foamThickness` takes `pixel`; `ROLLER_WIDE`). Meant to end the clipped white
  bar with a dithered end at the horizon, x 800–1280, y 415–425.
- Foam's sky light is `mix(SKY_FILL, HORIZON_FILL, FOAM_FLANKS = 0.4)`. Foam in
  the cube's shadow was lit by the zenith's fill alone, about a quarter of what
  the mirroring shallows beside it show, so its patches read as dark-blue dashes
  when foreshortened. Meant to end the dots at x 950–1150, y 435–450.

A shoot of `wake-sea` and the three standard eyes at 376d8709 was running when
this was written; nobody has judged it.

### Owed

1. Judge 376d8709 at `wake-sea` against the lead's
   `frames/lead/1113-1200-wake-sea.webp`; send before/after crops of the two
   places above.
2. Keeper frames into `frames/sea/` as `.webp` under 300 KB with README lines
   (eye, clock, commit, caption): `along-the-breaker`, `standing-dry`,
   `swash-at-the-feet` at the final head. The README's `standing-dry` line
   describes a stale frame at f8e1df6f.
3. `/dry` and `/tend-prose` over the diff since 07812481 (`shore-cusps.ts`, the
   lace rewrite in `sea-foam-wgsl.ts`, the `tongue` argument), then the full
   gates: `pnpm typecheck`, `pnpm shaders:cube`, eslint on the two directories,
   `pnpm test` on their tests, `pnpm type-overlap`, `pnpm check:masd`,
   `pnpm masd:clusters`, `pnpm check:cycles`, prettier.
4. `water-level.ts` stands at 398 lines of 400: anything added there has to
   move something out.

### Not the sea's, found on the way

A straight sand-coloured line a pixel wide and about 1.5 m long crosses the
swash's foam near (−19, 21), fixed in the world and axis-aligned. It looks like
the sand's mesh standing a hair above the thin sheet along one of its edges. See
it with `--at -19.5,1.75,19.5 --yaw 135 --pitch -30`, about x 690–960, y
320–470, or from above with `--at -19.5,7,19.5 --yaw 135 --pitch -75`.

### How to re-shoot

`pnpm outside:cube --out <absolute dir> --at x,y,z --yaw <deg> --pitch <deg> --name <name>`,
or `--eyes wake-sea`; about three minutes a frame in SwiftShader, a new out
directory each time, clock `PLAY_INSTANT`.

- `along-the-breaker`: `--at -42,2.2,10 --yaw 100 --pitch -12`
- `swash-at-the-feet`: `--at -19.5,1.75,19.5 --yaw 135 --pitch -30`
- `standing-dry`: `--at -15.2,2.05,15.2 --yaw 135 --pitch -8`
- `over-the-shallows`: `--at -30,1.7,22 --yaw 60 --pitch -14`
- `swimming-into-the-sun`: `--at 12,1.1,46 --yaw -31 --pitch -4`
