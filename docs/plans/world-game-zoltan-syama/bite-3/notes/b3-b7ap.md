# b3-b7ap — the scripts on the sphere (B7a′), hand-over

Base 0994e722, branch `wt/b3-b7ap`.

## Done (pushed)

- **045f4654**: `scripts/lib/azimuthal.ts` gains `planeToUnit`, `unitToDegrees`,
  `planeToDegrees` (+ `azimuthal.test.ts`: origin is 10° N 0°, round trip
  through `worldToPlane`, a degree of arc north is a degree of latitude).
  `play-island.ts` `INLET` shots go through `planeToDegrees` once at load (same
  plane points, same heights). `film-descent.ts` `LANDING`/`START` are units
  from the plane points; the descent slerps from the landing toward the centre
  by `drift`, sent as degrees. `play-tab.ts` unchanged: `--world 0` already
  passes `assertWorldNumber` (B7a's regex), and `#0` is its hash.
- Gates on the scripts: eslint, prettier, `tsc -p sites/vova`, `check:masd`,
  `check:cycles`, `masd:clusters`, `type-overlap` green; root `tsc` red only on
  `tile-cover.test.ts` (B7a's, ported on `wt/b3-b7at`).

- **6829f9eb** (on `wt/b3-b7at` merged in): `play:island` prints
  `<screen>: world #N built in <ms>` from `buildMs()` once `ready` resolves.
- **Play on #1** (export built in a scratchpad worktree, `--no-build`, `--out`
  `notes/b3-b7-play/`): green, no page or console error. Built in 1374 ms
  (phone) / 1403 ms (desktop); webgl2, median 2.4 / 1.8 ms over 40 frames, load
  ~4.3–5.2 on 4 cores. All 16 frames show the island: orbit the globe with #1
  lit from the NW on black space; 1000 km lakes, hills and snow; 10 km green
  relief; 100 m and 2 m hills under a blue sky; the inlet the two peninsulas and
  the strait; inlet-head the pool at its head; west the same head turned.

## Left

Nothing of B7a′. `film:island` type-checks but was not run (not asked).
