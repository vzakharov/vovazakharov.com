# Sand frames

## In the assembled scene

- `approved-standing-toward-sun.webp` — **the reference frame**: the operator
  said of it «это прямо топчик, можно на доску». Standing 21.5 m south-west of
  the cube's middle, looking at it:
  `pnpm outside:cube --at -15.203,2.10,15.203 --yaw -45 --pitch 4`. Shot on the
  lead's ee1852cb with the sand as of 1a56691b.

- `1113-gold-approved-eye.webp` — the same eye after the gold pass (sand
  e4ee6c73): lit sand gold, ripples in fields across the sun's bearing.
- `1113-gold-wake-lying.webp` — lying at the waking spot (head at bed 0.34 m,
  23.43 m out, eye 0.35 m up), looking at the cube: it sits on the dune.
- `1113-gold-wake-standing-sun.webp` — standing there, toward the sun.
- `1113-wake-lying-seaward.webp` — lying there, head turned to the sea (shot
  before the gold pass; the sun is behind).

- `1113-sky-approved-eye.webp` — the approved eye again under the sky package's
  light and core's quarter-pixel fringe: the sparks are white. **The future
  splash screen.** To shoot it again exactly: on sand's f0ff9882 (in the lead's
  branch as 43c24a67),
  `pnpm outside:cube --at -15.203,2.0962,15.203 --yaw -45 --pitch 4` — the eye
  1.6 m over the bed, roll 0, the default lens, a 1280 × 800 viewport at device
  scale 1. The clock is the one every script page is stopped at, `PLAY_INSTANT`:
  2026-11-01T12:00:00Z, 1793534400000 ms, hour 498204 and 0 s into it. It moves
  the sea, the swash's wetness and the clouds; the sun stands where `SUN_DIR`
  puts it at any clock.
- `1113-sky-wake-lying-sun.webp` — lying at the waking spot, toward the sun.
- `1113-sky-wet-foreshore.webp` — standing on the foreshore toward the sun: the
  wet band mirrors the sky, more the further it lies, with the sun's glare along
  it.

- `1113-wet-edge-seaward.webp` — the wet sand's mirror meeting dry sand in the
  cube's shadow, wetness asked at each pixel: eye 1.554 m over the bed at −15.2,
  15.2 (`--at -15.2,2.05,15.2 --yaw 135 --pitch -8`), the clock `PLAY_INSTANT`.
- `1113-wet-edge-before-after.webp` — that edge at twice its size: above with
  wetness asked at the mesh's vertices, below at each pixel.

## In the first harness

Shot in a throwaway harness (SwiftShader, a stand-in sky, a flat stand-in sea, a
black box for the cube) with the contract's sun and `SKY_FILL` as they stand.

- `lying.webp` — 30 cm over the waterline where the player wakes, looking at the
  cube: wet foreshore, damp band, dry beach.
- `stand.webp` — standing a little up the beach, same direction.
- `down.webp` — looking down from standing height where the cube's shadow
  crosses rippled sand.
- `shadow.webp` — the cube's shadow across the ripples, lit by the sky alone.
- `door.webp` — from the doorway, 3.7 m up, looking east into the sun.
- `edge.webp` — the edge of the cube's shadow from 2 m.
