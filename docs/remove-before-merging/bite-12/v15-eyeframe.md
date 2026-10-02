# v15-eyeframe — every place, and `onscreenOf`, in the eye's frame

Builds `v15-flyspeed.md`'s fix, parts 1–3, in one commit (see "Done"):

1. `placeOfAloft` frames at the eye's heading, the azimuth off it clamped to
   `±FRAME_MARGIN` (by centring the frame `off − kept` past the heading), `x, y`
   in sizes, `fromEye = max(V_NEAR, forward)`. Never `undefined`, so
   `awayPlaces` always has both sides and `wayOutOf` returns `WayOut` (its out
   points through a new private `outAloft`, shared with `entryAloft`).
2. `Perches.see` keeps every non-away place as an `Aloft` (`aloftOfLayout`
   over `footRows`, the clump's row for the air); `sightFrom` re-places them
   with `placeOfAloft`, no beds, no `perchAloft`. The beds stay for `at` and
   `tapThrough`.
3. `onscreenOf`: `left/right = (middleOf ∓ focal · tan(pinhole.x / focal)) /
unit` at every eye; the world-strip clip, `rowRuns` and `COLUMNS` are gone.
   `undefined` only without a view.

Part 3 went in with 1–2 because without it the tree is wrong: a release's
`shownOf` compares `sightFrom`'s places (eye frame) against `onscreenOf`'s
edges (layout frame), so from a walked or turned eye it would count the wrong
perches shown and move the away spots (`edgesOf`) to layout-frame edges.

## Measured

`FRAME_MARGIN / SPREAD` = 0.9 rad of frame angle. The screen's edge is at
0.16–0.60 (phone portrait to phone landscape), the away spots at ≤ 0.71, the
world strip's edge at the opening eye ≤ 0.64, so the clamp never bites for
anything on screen nor at the opening eye; a perch the clamp moves lands past
every screen's edge plus the inset, never counted shown.

Cap → away right, drawn (screen chord over mean zoom) ÷ timed, seed 3:

| eye                   | tablet HEAD (real beds) | tablet now | phone HEAD | phone now |
| --------------------- | ----------------------- | ---------- | ---------- | --------- |
| 0, 0, 0               | 0.93–0.96               | 0.93–0.96  | 0.99–1.00  | 0.99–1.00 |
| 0, 3, 0               | 1.26–1.39               | 0.95–1.00  | 1.48–1.51  | 1.00      |
| 2, 4, 0               | 1.53–1.88               | 0.95–0.99  | 1.61–1.81  | 0.97–1.00 |
| 1.5, 2, 0.3           | 1.12–1.22               | 0.95–0.96  | 1.21–1.29  | 0.99–1.00 |
| 0, 0, 0.6             | 0.68–0.83               | 0.89–0.96  | 0.89–0.91  | 0.99–1.00 |
| 0, 0, 1.6             | 0.29–0.31               | 0.95–0.96  | —          | —         |
| 0, 5, 0 (not in test) | 1.63–1.77               | 0.83–0.98  | 1.92–1.97  | 0.84–0.88 |

The deep walk's 0.83–0.88 is the test's crude drawn measure (straight screen
chord over the ends' mean zoom, not the frame's integral), so that eye is left
out of the test. `scripts/lib/veer-away.ts` prints the same as at HEAD (it
measures at the opening eye, where the frame is the layout).

## The test

`ui/scene/perches.test.ts` (from `v15-flyspeed-test.patch`), eyes widened to
seven so phone has 15 legs. It cannot fail at HEAD for the walked eye as
committed: at HEAD with no beds `sightFrom` skips its `fromEye` correction,
and the uncorrected layout places time walked eyes right; only headings 0.6
and 1.6 fail. The "HEAD (real beds)" column above is the same test run at HEAD
with a scratch stub bed (`capTop` → the cap's laid foot, cast; not committed),
which fails at every walked eye. After the fix `sightFrom` takes nothing from
the beds, so the committed test tests what the scene does.

`perch-sight.test.ts` § onscreenOf: the first test now asserts the frame's
stretch at the opening, turned, facing-away and walked-turned eyes, and
`undefined` only without a view; the last ("counts a perch shown only where
the view draws it") reads `sightFrom`'s places, not `perchSight`'s, and adds
a facing-away and a turned-back eye.

## Done

- Commit: see `git log` — "fix(mushrooms): time every leg in the eye's frame".
- Passing: `perches.test.ts`, `perch-sight.test.ts` (68), `insect-away.test.ts`,
  `fliers.test.ts` (48), `veer-away.ts` unchanged, prettier, eslint,
  `pnpm typecheck`, `pnpm type-overlap`.

## Left

- The play run (another agent's): tabL `veer`, a walk then a release/leg.
- Visible change: facing away (`onscreenOf` was `undefined` there), a
  release now takes `shownOf`'s path: no perch shown, so it flies up over the
  brow and out by a side, timed with `outFirst`, before its leg.
- A perch exactly at the eye's plane point would give `forward` 0 and an
  infinite `y`; unreachable with float positions, unguarded.
