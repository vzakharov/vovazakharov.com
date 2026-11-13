# The lead's frames

Every frame is `pnpm outside:cube --eyes <name>` — the named eye in
`src/cube/scripts/outside-cube.ts` — at 1280×800, device scale 1, SwiftShader,
the page's clock pinned at `PLAY_INSTANT` (2026-11-01T12:00:00Z, 1793534400000
ms), the default lens unless a row says otherwise.

| Frame                         | Eye            | Lens          | Commit   |
| ----------------------------- | -------------- | ------------- | -------- |
| `1113-1200-wake-cube.webp`    | `wake-cube`    | outside's     | 49186bc5 |
| `1113-1200-wake-sea.webp`     | `wake-sea`     | outside's     | 49186bc5 |
| `1113-1200-under.webp`        | `under`        | outside's     | 49186bc5 |
| `1113-1200-ladder-foot.webp`  | `ladder-foot`  | outside's     | 49186bc5 |
| `1113-1200-room-doorway.webp` | `room-doorway` | floor 1's own | 874eab51 |
| `1113-1210-doorway-out.webp`  | `doorway-out`  | `--indoors 0` | b0852de6 |
| `1113-1210-doorway-down.webp` | `doorway-down` | `--indoors 0` | b0852de6 |

| `1113-1230-aerial.webp` | see below | `--indoors 0` | 7a2ab712 |

`aerial` is no named eye: `--at -15,60,70 --yaw -90 --pitch -45 --name aerial`,
60 m up south of the island, looking north and down — the whole island, the
cube, its shadow running off the south-west shore onto the water.

The `1113-1210-*` and `1113-1230-*` frames carry the script's own record beside
them (`*.shot.json`: the eye's pose, lens, clock, viewport, commit).

The `1113-0930-*` and `1113-1050-*` frames are the same eyes at 315051b5 and
ba9210cc, kept for comparison.
