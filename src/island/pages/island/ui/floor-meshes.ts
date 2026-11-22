import {
  band,
  BARK,
  type Build,
  shaded,
  type TreeDetail,
  vertex,
} from './tree-mesh-parts';

/** A log's radius as a share of its length, and how far its middle sits over the ground. */
const THICK = 0.045;
const SUNK = 0.6;

/**
 * A fallen log one unit long, lying along `x` through the origin and sunk a
 * little into the ground: the frame's height is its length, so its thickness
 * grows with it.
 */
export function log(build: Build, detail: TreeDetail) {
  const around = detail === 'near' ? 7 : 4;
  const rings = [-0.5, -0.1, 0.5].map((x, n) => {
    const first = build.positions.length / 3;
    const radius = THICK * (1 - 0.18 * n);
    for (let s = 0; s < around; s++) {
      const a = (s / around) * 2 * Math.PI;
      const ny = Math.cos(a);
      const nz = Math.sin(a);
      vertex(
        build,
        [x, THICK * SUNK + ny * radius, nz * radius],
        [0, ny, nz],
        shaded(BARK, 0.6 + 0.4 * ny),
      );
    }
    return first;
  });
  for (const [n, ring] of rings.entries()) {
    const next = rings[n + 1];
    if (next !== undefined) band(build, next, ring, around);
  }
}

/** How far over the ground a shade lies, as a share of its reach: clear of the ground's own facets. */
const LIFT = 0.025;

/**
 * The shade under a tree, one unit in reach, lying flat about the origin: its
 * colour is the share of the ground's light it takes, all of it at the trunk
 * and none at its rim, which the tree's own share multiplies.
 */
export function shade(build: Build, detail: TreeDetail) {
  const around = detail === 'near' ? 14 : 8;
  const middle = vertex(build, [0, LIFT, 0], [0, 1, 0], [1, 1, 1]);
  const ring = (reach: number, takes: number) => {
    const first = build.positions.length / 3;
    for (let s = 0; s < around; s++) {
      const a = (s / around) * 2 * Math.PI;
      vertex(
        build,
        [Math.cos(a) * reach, LIFT, Math.sin(a) * reach],
        [0, 1, 0],
        [takes, takes, takes],
      );
    }
    return first;
  };
  const inner = ring(0.5, 0.8);
  const rim = ring(1, 0);
  for (let s = 0; s < around; s++) {
    build.indices.push(middle, inner + ((s + 1) % around), inner + s);
  }
  band(build, rim, inner, around);
}
