# Sky's frames: how each was shot

All by `pnpm -s outside:cube` on SwiftShader, viewport 1280×800, default lens,
clock `PLAY_INSTANT` (2026-11-01T12:00:00Z), where a script's page opens
stopped.

| Frame                     | Eye                                            | Code     |
| ------------------------- | ---------------------------------------------- | -------- |
| `opposite`                | `--at -21,1.9,21 --yaw 149 --pitch 9`          | 89c6dae3 |
| `approved-eye`            | `--at -15.203,2.10,15.203 --yaw -45 --pitch 4` | 16db04f3 |
| `approved-eye-cloud-pair` | the same eye, cropped 520×260 at (0, 200)      | 16db04f3 |
| `wake-sea`                | `--eyes wake-sea`                              | 89c6dae3 |

The pair's upper half is sand's `frames/sand/1113-sky-approved-eye.webp`, shot
with the sky as of 54b3c2c7.

`opposite` and `wake-sea` show the domed crown the operator turned down at
16db04f3; only the two `approved-eye` frames show the cloud as it stands.
