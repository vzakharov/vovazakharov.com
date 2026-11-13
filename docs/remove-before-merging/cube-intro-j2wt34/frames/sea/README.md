# The sea's frames

Shot in SwiftShader with `pnpm outside:cube`; the first four are the reference,
from the sea's own stand before the shared renderer (sun at azimuth +8°).

- `swimming-into-the-sun.webp` — the bar: the reference stand, eye about a metre
  over deep water.
- `standing-on-the-shore.webp`, `wading-through-foam.webp`,
  `from-the-doorway.webp` — the reference stand's shore, lace and far view.
- `swimming-into-the-sun-new-renderer.webp` — the same sea in the shared
  renderer at 5f46f3b7, under the real sky,
  `--at 12,1.1,46 --yaw -31 --pitch -4`, lens at its default 0.3: the path
  sparkles, the ripples read, the water is green-blue against a lit sky.
- `from-forty-metres-up.webp` — c2db03a4, `--at 30,40,60 --yaw -31 --pitch -35`:
  no tile repeats in the water or the glitter from height.
- `swash-at-the-feet.webp` — 376d8709,
  `--at -19.5,1.75,19.5 --yaw 135 --pitch -30`: the lace in cords and cells on a
  plan laid round the island, the swash's edge in tongues; a sand-coloured line
  crosses the foam right of centre, the sand's mesh through the thin sheet.
- `along-the-breaker.webp` — 376d8709, `--at -42,2.2,10 --yaw 100 --pitch -12`:
  one breaker, whole along its crest, breaking from the right; a tongue of swash
  on the wet sand.
- `wake-sea.webp` — 7abe3943, `--eyes wake-sea`: the waking eye low on the sand;
  the far breaker fades along its crest, the foam in the cube's shadow is pale.
- `wake-sea-horizon-before-after.webp` — x 780–1280, y 400–470 of that eye at
  2×, the lead's 49186bc5 over 7abe3943: the clipped white bar with a dotted end
  and the dark-blue dashes in the shadow, then neither.
- `over-the-shallows.webp` — a2aad5c3, `--at -30,1.7,22 --yaw 60 --pitch -14`:
  the eye over knee-deep water, the bed showing through, a swell standing up
  behind.
- `standing-dry.webp` — 376d8709, `--at -15.2,2.05,15.2 --yaw 135 --pitch -8`:
  the shore from dry sand, the waterline in tongues, the cube's shadow across
  the shallows.

All at the clock `PLAY_INSTANT`, 1280×800.
