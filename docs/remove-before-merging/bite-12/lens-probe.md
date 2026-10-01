# lens-probe — hand-over note

Package: the plan's «Re-decided: a panoramic lens with a bent screen», as a
probe: the opening frame drawn through the new lens, to judge by eye. Taps,
insects' flight and the tests are left as they fall. The code is
`lens-probe.patch` (applies on bac7c5a, type-checks), never source.

## The lens as built

- **Across:** `x = middle + arc · wrap(SPREAD · atan2(dx, dy) − heading)`,
  `arc = focal / SPREAD`, `SPREAD = 2π · focal_tabL / (4 · 1180) = 1.9617`.
  Of the two equivalent forms this is "keep `c` tied to today's focal and
  spread the meadow's angles": the spread is taken inside `viewOf`, about the
  eye, so no layout or plane data changes. At the opening eye (and any turn
  standing there) that is exactly the world spread about `OPENING_EYE`; once
  the eye walks it is not a rigid world any more — a built version spreads the
  plane itself (`planeOf`, `ofLayout`).
- **Down:** a point's row goes by its distance `d` from the eye, not its depth
  along the heading, so the `D_SEE` circle is the straight row `groundTop`;
  then `(row − horizon)` is multiplied by `bend = hypot(1, (x − middle) /
focal)` at today's focal. A thing's `scale` is `focal · bend / d` and
  `ahead` is `d / bend`, so its drawn size follows its bent row and `zoom`
  stays 1 at the opening clump.
- `browRow` is untouched: today's formula is already exactly "the straight
  `D_SEE` row bent by `hypot(1, dx / focal)`".
- The panorama (`panorama.ts`: `ringWave`, `crestAt`, `azimuthAt`,
  `screenAt`, `shownAzimuths`, cloud drift), the brow blades, seam grass, the
  sun's bowl and the clouds' lean read `arc` where they read `focal` as px per
  radian; `ringWave` is linear (no `tan`). `screenAt` never answers "behind".
- `walk.ts`: the heading is `left / arc` and a turn is `2π · arc` px; the
  cruise stays `TURN_CRUISE · focal` px/s, so the slide in px is today's and a
  full turn takes 8.4 s (0.75 rad/s).

## Numbers

Screens per full turn:

| screen | HEAD  | probe |
| ------ | ----- | ----- |
| tabL   | 7.85  | 4.00  |
| tabP   | 19.14 | 9.76  |
| phoneP | 18.50 | 9.43  |
| phoneL | 5.22  | 2.66  |
| phoneS | 18.24 | 9.30  |

Outermost visible things at the opening, moved inward (CSS px, % of their
distance from the middle):

- tabL: left flower 6.5 → 34.4 (27.9 px, 4.8 %), right flower 1123.8 →
  1102.1 (21.7 px, 4.1 %); each also rises ~3.5 px.
- phoneL: the left flower at x −12 (anchor just off the left edge) comes to
  x 33 (434 → 389 px from the middle, 45.5 px, 10.5 %) and is now wholly on
  screen; right flowers 819 → 784 (35.9 px, 9.0 %), rising 6–7
  px.
- Portraits: under 1 % (≤ 3.6 px).

Far less than the plan's "≈ 15 % at tabL's edge": the inward pull is
`tan θ − θ`, and tabL's edge is only 21.8° off the heading.

Things shown on screen at the opening (anchor inside the screen), HEAD →
probe: tabL 11 → 11, tabP 5 → 5, phoneP 5 → 5, phoneL 15 → 16 (the left-edge
flower above), phoneS 5 → 5. Nothing sinks that HEAD showed. The clump is
identical to the px on every screen (dx, dy 0.00).

Brow: `browRow` and the camera are unchanged, so the curve is HEAD's to 0 px
by construction. Measured on the frames (strongest edge per column round
`browRow`): median |row diff| 1.0 px on tabL, 0.3 on phoneL, 0.7 on phoneP;
the outliers are brow blades and seam tufts standing a few px over at the
sides, not the line.

Whole-frame differing pixels at the opening (`compare -fuzz 2%`): tabL 2.5 %,
tabP 1.9 %, phoneP 0.9 %, phoneL 2.8 %, phoneS 1.3 % (half-depth: 10–36 %).

## Frames

`frames/bite-12/lens-probe-opening-{tabL,phoneL,phoneP}-head-probe.png` (HEAD
above, probe below) and `lens-probe-quarter-tabL-head-probe.png` (90° on `→`,
HEAD above at 90.2°, probe below at 90.8°). At the quarter the probe still
shows three of the opening's right-side flowers at the left edge (45° of world
angle from the opening's middle, against HEAD's empty grass); the hills and
clouds are a different stretch of the ring, since 90° is now a quarter of 4
screens rather than of 7.9.

Shot from probe builds of bac7c5a and bac7c5a + the patch, seed 12 345, 30
frames in, by a scratch CDP script (not committed).

## Left

Everything past the probe: the operator's look at the frames; then, if it
holds, the world spread in the plane rather than in `viewOf`, the inverses
(`ofLayout`, `eye-crop`, `view-inverse`, `insect-away`, `distanceOfRow`), taps,
insects, and the tests.
