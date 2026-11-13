# Frames from `core`: the seam as the lead's tree draws it

Shot with `pnpm outside:cube --out "$PWD/tmp/eyes"`, 1280×800, SwiftShader, on
2026-11-13: sand's real layer and `islandHeight`, shell's doorway cut, sunbeam
and shadow, and core's stand-ins for sky, shell and sea.

- `wake-sea.webp` — the waking spot, propped on an elbow, looking out to sea:
  the stand-in's flat sea mirroring `skyRadiance`, the island's shoulder on the
  right.
- `wake-cube.webp` — the same spot turned to the cube: the real sand with its
  glitter, the stand-in shell's dark faces against the sun's glow, the cube's
  shadow lying to the left.
- `under.webp` — on the sand under the cube, looking up: the stand-in shell's
  underside fills the frame, black, as a matte face that sees no sky is.
- `ladder-foot.webp` — where the ladder stands, looking up the east face:
  sunlit, the ladder's shadow on it from shell's `cubeShadow`, the ladder itself
  and the doorway not drawn by the stand-in.
- `doorway-out.webp` — the sill looking out through floor 1's own lens, the
  interior a quarter-turn round in its shell: the sand, the sea's edge and the
  sun, bleached as an eye used to the room sees them. Decor keeps the opening
  clear.
- `room-doorway.webp` — floor 1's room looking at the doorway in the room's
  south wall: the opening, the beam and its haze, and the notice board standing
  in the daylight (shot before decor cleared the opening).
- `entering.webp` — a step inside the doorway, looking the way one climbs in,
  through floor 1's own lens: the shrubs and the bench straight ahead, the beam
  crossing to the far wall beside the bench, the hatch's quarter on the left
  unlit.
- `entering-fresh.webp`, `entering-halfway.webp` — the same at `--indoors 0` and
  `0.5`: an eye just in from daylight, and half used to the room.
- `in-beam.webp` — standing in the beam, looking down it at where it lands.
- `room-fresh.webp` — `room-doorway`'s pose before the turn, at `--indoors 0`:
  the room as an eye just in from daylight sees it, dim but for the beam, the
  sea plain through the doorway.
- `room-halfway.webp` — the same at `--indoors 0.5`.
- `doorway-down.webp` — the sill looking 40° down through floor 1's lens: the
  sand under the doorway, bleached, as an eye used to the room sees it.
- `sill-halfway.webp` — an eye on the sill looking out through the outside lens
  at `--indoors 0.5`: half used to the light.
- `sill-adapted.webp` — the same at `--indoors 0`: the eye used to daylight, the
  sand, the sea's edge and the sun.
- `wake-cube-before-film.webp` — `wake-cube` through the room's film curve, as
  it was: the sky about the sun one white area. `wake-cube.webp`,
  `wake-sea.webp` and `ladder-foot.webp` are through the outside's own curve,
  from the waking spot inland, with the real sky, sea and shell.
- `sun-film-before-06-04.webp` — the sky about the sun, cropped, three ways: the
  room's curve, the outside's with its tail at 0.6 (kept), and at 0.4 (greyer).
- `wake-cube-eyelids-045.webp` — `wake-cube` with `--eyelids 0.45`: the outside
  lens's lids half shut.

`wake-cube.webp` is re-shot with the interior turned. With the turn switched off
the same eye gives the same frame to the pixel: an eye outside is reckoned in
the world frame alone (`seenOutside`).

Every frame with a `<name>.shot.json` beside it was shot by `pnpm outside:cube`
at the eye, lens (`null` is the floor's own), clock, viewport and commit that
file gives; `--eyes <name>` at that commit, with `--indoors` as its lens says,
shoots it again.
