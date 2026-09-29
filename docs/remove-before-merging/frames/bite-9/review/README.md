# Bite 9 review frames

Visit seed 12345, grown by tapping `+` and a species in turn until `+`
refused (`tmp/review9/session.ts`). The numbers come from
`tmp/review9/meadows.ts` + `analyse*.py`: 600 visits (`VISITS[0..600]`) per
screen, grown by `visit-play.opened`, and each also measured on its turned screen.

| Frame | What it shows | The number it backs |
| --- | --- | --- |
| `six-grown-flat-depth-tabP.png` | The far fly agaric and russula are drawn as wide as, or wider than, the near chanterelle. The chanterelle's stem runs to the bottom edge. | A forest mushroom is drawn at 0.700 × unit at every depth: `depthScale` cancels out. In 48–51% of forest pairs, the farther cap is the wider one. |
| `six-grown-middle-third-tabL.png` | All six stand in the middle third of a landscape tablet. | On tabL the caps span a median of 27% (max 31%) of the screen width, all within x 401–782 of 1180. The unit is 171 px here, against 300 on tabP. |
| `six-grown-middle-third-phoneL.png` | The same on a landscape phone. | phoneL: caps span a median of 27% (max 33%) of the width. |
| `plus-refused-shake-phoneP.png` | `+` faded and shaking its head once six stand. | The refusal is recorded 0.5 s before the frame (`refusedAt`). |
| `turned-to-landscape-flowers-hidden-phoneP.png` | A portrait meadow turned to landscape: squeezed into the middle, with flowers behind the caps. | Turned phoneP: 64% of flower heads (2705/4200) sit under a nearer mushroom, against 4% before the turn. phoneS turned: 74%. |
