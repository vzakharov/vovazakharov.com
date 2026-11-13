# Walk's strips

Shot with `pnpm scenes:cube --scenes <name> --every <seconds> --out <abs dir>`:
each scene is played through the walk's own outside controller from its opening,
at 1/30 s a frame, and drawn through the page's play hook. Viewport 1280×800,
the page's clock stopped at `PLAY_INSTANT` (2026-11-01T12:00:00Z), the
controller's own clock at 0 s into the hour. The script prints each frame's eye
and lens after its `shot` line; the ones below are copied from it. A file's name
ends in the seconds into its scene.

## waking — coarse pass, `--every 2.4`, commit 877a26f5

| file               | what it shows                                                                                            | eye `[x, y, z]`, yaw, elevation, roll · lens exposure, eyelids |
| ------------------ | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `waking-00.0.webp` | Dark: the lids are shut.                                                                                 | `[-16.566, 0.470, 16.566]`, 2.956, 0.03, 1.1 · 0.45, 0         |
| `waking-02.4.webp` | Dark again, after the first look at 1.3 s that was too bright to keep.                                   | same eye · 0.45, 0                                             |
| `waking-04.8.webp` | Open, coming up on an elbow: the world on its side, sand close, the surf and the horizon down the beach. | `[-16.634, 0.599, 16.602]`, 2.892, −0.026, 0.778 · 0.3, 1      |
| `waking-07.2.webp` | Sitting: the beach runs down to the sea, the horizon level.                                              | `[-17.168, 1.103, 16.883]`, 2.656, −0.08, 0 · 0.3, 1           |
| `waking-09.6.webp` | Getting to its feet, nothing but sea ahead.                                                              | `[-17.464, 1.798, 17.040]`, 2.656, −0.071, 0 · 0.3, 1          |
| `waking-12.0.webp` | The turn begins, over the shoulder along the shore.                                                      | `[-17.451, 1.887, 17.033]`, 3.477, 0.017, 0.038 · 0.3, 1       |
| `waking-14.4.webp` | The turn ends: the cube whole in frame, hanging over the berm, the ladder under it, the sun behind.      | same eye, 5.510, 0.135, 0 · 0.3, 1                             |
