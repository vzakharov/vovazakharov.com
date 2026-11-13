# Sky's frames: how each was shot

All by `pnpm -s outside:cube` on SwiftShader, viewport 1280×800, default lens.
The shooter pins no clock, so the clock is the wall clock at the shot, to the
second; the cumulus field drifts one tile an hour and closes on the hour, so the
minute and second within the hour are what place the clouds.

| Frame                     | Eye                                            | Clock (UTC)                           | Code     |
| ------------------------- | ---------------------------------------------- | ------------------------------------- | -------- |
| `opposite`                | `--at -21,1.9,21 --yaw 149 --pitch 9`          | about 11:27Z, not noted to the second | 89c6dae3 |
| `approved-eye`            | `--at -15.203,2.10,15.203 --yaw -45 --pitch 4` | 2026-11-13T11:50:40Z                  | 16db04f3 |
| `approved-eye-cloud-pair` | the same eye, cropped 520×260 at (0, 200)      | 2026-11-13T11:50:40Z                  | 16db04f3 |
| `wake-sea`                | `--eyes wake-sea`                              | 2026-11-13T11:36:25Z                  | 89c6dae3 |

The pair's upper half is sand's `frames/sand/1113-sky-approved-eye.webp`, shot
with the sky as of 54b3c2c7. The clock is when the frame was written, a second
or two after the frame's own instant. The other frames here were shot before
clocks were recorded.

`opposite` and `wake-sea` show the domed crown the operator turned down at
16db04f3; only the two `approved-eye` frames show the cloud as it stands.
