# b3-b7ap — the scripts on the sphere (B7a′), hand-over

Base 0994e722, branch `wt/b3-b7ap`.

## Done (pushed)

- **045f4654**: `scripts/lib/azimuthal.ts` gains `planeToUnit`,
  `unitToDegrees`, `planeToDegrees` (+ `azimuthal.test.ts`: origin is 10° N 0°,
  round trip through `worldToPlane`, a degree of arc north is a degree of
  latitude). `play-island.ts` `INLET` shots go through `planeToDegrees` once at
  load (same plane points, same heights). `film-descent.ts` `LANDING`/`START`
  are units from the plane points; the descent slerps from the landing toward
  the centre by `drift`, sent as degrees. `play-tab.ts` unchanged: `--world 0`
  already passes `assertWorldNumber` (B7a's regex), and `#0` is its hash.
- Gates on the scripts: eslint, prettier, `tsc -p sites/vova`, `check:masd`,
  `check:cycles`, `masd:clusters`, `type-overlap` green; root `tsc` red only on
  `tile-cover.test.ts` (B7a's, ported on `wt/b3-b7at`).

## Left

- Print `buildMs()` per screen once `wt/b3-b7at` lands it on the hook.
- One `pnpm play:island` on #1, `--out` into `notes/b3-b7-play/`, built in a
  scratchpad worktree.
