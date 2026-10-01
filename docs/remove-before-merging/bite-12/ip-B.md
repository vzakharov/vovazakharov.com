# ip-B — perches on the plane

Contract: `insect-plane.md` § R3.3, package B. Additive: today's paths stay
live; package C switches the view over and deletes the old ones.

## Step 1 — air perches as world points, distances from the eye

- `perch-sight.ts`: `aloftOfLayout(camera, point, footRow): Aloft` —
  `ofLayout`'s construction as a fixed world point; `airAlofts(layout)`, each
  air spot by id over the clump's row; `perchDistance(view, at: Aloft)` —
  `framedOf(view, view.eye.heading, at).forward`, floored at `V_NEAR`.
  `perchSight` still measures `fromEye` at the opening eye
  (`perchDistanceAtOpening`, today's seam, renamed).
- `perch-hosts.ts`: `PerchHosts.alofts`; `perchAloft(hosts, camera, perch)`
  — a cap's or flower's foot (`aloftOfLayout` of `host.laidFoot` on its own
  row), an air spot's `Aloft`, none for `away`.
- `perches.ts`: `see` stores the air `Aloft`s and every placed perch by
  name; `sightFrom(view): Sight` is the last sight with each place's
  `fromEye` measured from `view`'s eye (`away` keeps the opening's).
- Tests (`perch-sight.test.ts`): at the opening eye every air spot's and
  shown flower's `perchDistance` is its place's `fromEye` (1e-9); every air
  `Aloft` drawn by `drawnAloft` where `ofLayout` draws today's spot (0.1
  px); a flower's foot `Aloft` drawn where `bedPlace` places it (1e-6 px,
  opening and a walked, turned eye); the `V_NEAR` floor over 16 headings.

### Decided

- **A host's distance is its foot's frame forward, not `stands.ahead`.**
  R3.3 names `stands.ahead` for a bed host and says it equals today's at the
  opening eye; it does not: `ahead` is distance over the screen's bend, so
  off the middle at the opening eye it runs up to ~2% over the row's
  opening distance on the tablet (flower-1: 10.71 vs 10.50), growing toward
  the screen's edge. The frame's forward of the foot is the
  row's opening distance exactly at the opening eye, is what `apartIn`'s
  length-in-sizes needs in frame px, and is the one measure for every perch.
- **`V_NEAR` floor**: in the frame turned to the heading, `forward` falls to
  0 and below for a point straight behind the eye (`cos θ < 0` past
  `SPREAD · π/2`), which `logMean` cannot take. No insect is drawn nearer
  than the veer (≥ `V_NEAR`), so the floor costs nothing on screen.
- **`away` keeps the opening's distance**: its spot moves with the screen,
  it is not a world point.
- `perch-sight.ts` is ~470 lines until C deletes `footRows`/`airSpots`.
