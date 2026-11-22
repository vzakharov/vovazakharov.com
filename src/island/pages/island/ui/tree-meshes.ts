import { BufferAttribute, BufferGeometry } from 'three/webgpu';

import type { Rgb } from '../lib/land-colour';
import type { TreeKind } from '../model/tree-placing';

/**
 * How finely a tree is drawn: `near` to stand among, `mid` across a clearing,
 * `far` where it is a few pixels of a canopy.
 */
export const TREE_DETAILS = ['near', 'mid', 'far'] as const;

export type TreeDetail = (typeof TREE_DETAILS)[number];

type P3 = readonly [number, number, number];

/** Bark and leaf colours, linear: the leaves' are the kind's mid green, which each tree tints. */
const BARK: Rgb = [0.115, 0.085, 0.06];
const LEAF: Readonly<Record<TreeKind, Rgb>> = {
  broadleaf: [0.058, 0.14, 0.024],
  conifer: [0.028, 0.082, 0.036],
};

/**
 * How far a leaf mass's normals lean to the sky, against lengths near 6: a
 * crown stands among others that shade its flanks, which no lamp here knows,
 * so its flanks take a grazing sun little more than the ground under it does.
 */
const SKYWARD = 4;

/** A mesh being built: a tree one unit tall, its foot at the origin, `y` up. */
type Build = {
  readonly positions: number[];
  readonly normals: number[];
  readonly colours: number[];
  readonly indices: number[];
};

const unit3 = ([x, y, z]: P3): P3 => {
  const k = 1 / (Math.hypot(x, y, z) || 1);
  return [x * k, y * k, z * k];
};

const shaded = ([r, g, b]: Rgb, light: number): P3 => [
  r * light,
  g * light,
  b * light,
];

function vertex(build: Build, at: P3, normal: P3, colour: P3): number {
  build.positions.push(...at);
  build.normals.push(...unit3(normal));
  build.colours.push(...colour);
  return build.positions.length / 3 - 1;
}

/** Joins two rings of `around` vertices each, `lower` first, into a band facing outward. */
function band(build: Build, lower: number, upper: number, around: number) {
  for (let s = 0; s < around; s++) {
    const next = (s + 1) % around;
    build.indices.push(
      lower + s,
      upper + s,
      lower + next,
      lower + next,
      upper + s,
      upper + next,
    );
  }
}

/** A tapering limb through `spine` (each a centre and a radius), `around` sides, closed at its tip. */
function limb(
  build: Build,
  spine: ReadonlyArray<readonly [P3, number]>,
  around: number,
) {
  let below = -1;
  for (const [[cx, cy, cz], radius] of spine) {
    const ring = build.positions.length / 3;
    for (let s = 0; s < around; s++) {
      const a = (s / around) * 2 * Math.PI;
      const nx = Math.cos(a);
      const nz = Math.sin(a);
      vertex(
        build,
        [cx + nx * radius, cy, cz + nz * radius],
        [nx, 0.45, nz],
        shaded(BARK, 0.75 + 0.25 * nx),
      );
    }
    if (below >= 0) band(build, below, ring, around);
    below = ring;
  }
}

/**
 * A mass of leaves: an ellipsoid about `centre`, lumpy, its normals leaning
 * out from the crown's middle `heart` so the whole crown takes the light as
 * one body with the masses standing out of it, darker underneath and inside.
 */
function mass(
  build: Build,
  leaf: Rgb,
  centre: P3,
  radii: P3,
  heart: P3,
  around: number,
  rows: number,
  phase: number,
) {
  const first = build.positions.length / 3;
  for (let r = 0; r <= rows; r++) {
    const polar = (r / rows) * Math.PI;
    for (let s = 0; s < around; s++) {
      const a = (s / around) * 2 * Math.PI;
      const lump =
        1 +
        0.16 * Math.sin(3 * a + phase) * Math.sin(2 * polar + phase * 1.7) +
        0.09 * Math.sin(5 * a - phase * 2.3) * Math.sin(3 * polar);
      const dx = Math.sin(polar) * Math.cos(a);
      const dy = -Math.cos(polar);
      const dz = Math.sin(polar) * Math.sin(a);
      const at: P3 = [
        centre[0] + dx * radii[0] * lump,
        centre[1] + dy * radii[1] * lump,
        centre[2] + dz * radii[2] * lump,
      ];
      const out = unit3([at[0] - heart[0], at[1] - heart[1], at[2] - heart[2]]);
      const normal: P3 = [
        dx / radii[0] + out[0] * 2,
        dy / radii[1] + out[1] * 2 + SKYWARD,
        dz / radii[2] + out[2] * 2,
      ];
      const light = 0.5 + 0.5 * (0.5 + 0.5 * dy) + 0.12 * (lump - 1) * 6;
      vertex(build, at, normal, shaded(leaf, light));
    }
  }
  for (let r = 0; r < rows; r++) {
    band(build, first + r * around, first + (r + 1) * around, around);
  }
}

/** Sides and rows of a leaf mass, sides of the trunk, and the crown's masses drawn, by detail. */
const BROADLEAF = {
  near: { around: 8, rows: 5, trunk: 7, masses: 6 },
  mid: { around: 5, rows: 3, trunk: 3, masses: 3 },
  far: { around: 6, rows: 3, trunk: 0, masses: 1 },
} as const;

/** The one mass a far crown is: centre, radii. It reaches low, standing for the trunk it has none of. */
const FAR_CROWN: readonly [P3, P3] = [
  [0, 0.53, 0],
  [0.36, 0.47, 0.36],
];

/** A crown's masses, the largest first: centre, radii. Drawn fewer, the first ones swell to keep the outline. */
const CROWN: ReadonlyArray<readonly [P3, P3]> = [
  [
    [0.02, 0.7, 0],
    [0.27, 0.25, 0.27],
  ],
  [
    [0.21, 0.56, 0.08],
    [0.2, 0.16, 0.19],
  ],
  [
    [-0.17, 0.6, 0.16],
    [0.2, 0.17, 0.18],
  ],
  [
    [-0.06, 0.55, -0.22],
    [0.19, 0.15, 0.2],
  ],
  [
    [0.12, 0.84, -0.08],
    [0.17, 0.13, 0.17],
  ],
  [
    [-0.13, 0.8, 0.05],
    [0.16, 0.14, 0.16],
  ],
];

const HEART: P3 = [0, 0.62, 0];

function broadleaf(build: Build, detail: TreeDetail) {
  const { around, rows, trunk, masses } = BROADLEAF[detail];
  if (trunk > 0) {
    limb(
      build,
      [
        [[0, -0.04, 0], 0.03],
        [[0.004, 0.12, 0.002], 0.026],
        [[0.012, 0.34, -0.004], 0.021],
        [[0.02, 0.6, 0], 0.012],
      ],
      trunk,
    );
  }
  if (detail === 'near') {
    for (const [[x, y, z]] of CROWN.slice(1, 4)) {
      limb(
        build,
        [
          [[0.012, 0.3, -0.004], 0.014],
          [[x * 0.5, 0.3 + (y - 0.3) * 0.6, z * 0.5], 0.01],
          [[x, y, z], 0.005],
        ],
        4,
      );
    }
  }
  const swell = masses === 3 ? 1.2 : 1;
  const drawn = masses === 1 ? [FAR_CROWN] : CROWN.slice(0, masses);
  for (const [n, [centre, radii]] of drawn.entries()) {
    mass(
      build,
      LEAF.broadleaf,
      centre,
      [radii[0] * swell, radii[1] * swell, radii[2] * swell],
      HEART,
      around,
      rows,
      1.3 + n * 2.1,
    );
  }
}

/** Tiers of boughs, sides of each, and sides of the trunk, by detail. */
const CONIFER = {
  near: { tiers: 7, around: 10, trunk: 5 },
  mid: { tiers: 4, around: 6, trunk: 3 },
  far: { tiers: 2, around: 5, trunk: 0 },
} as const;

/** Where the lowest boughs hang, as a share of the tree's height. */
const SKIRT = 0.16;

/**
 * The spires a far conifer is, each its place across and its size: a far tree
 * stands for the stand about it (`tree-view` widens it), which one cone would
 * draw as a squat pyramid and three draw as a stand's ragged top.
 */
const STAND: ReadonlyArray<readonly [number, number, number]> = [
  [0.02, 0.05, 1],
  [-0.13, -0.08, 0.8],
  [0.12, -0.1, 0.68],
];

/** One conifer's boughs: tiers of ragged skirts about (`x`, `z`), the whole `size` of a unit tree. */
function spire(
  build: Build,
  [x, z, size]: readonly [number, number, number],
  tiers: number,
  around: number,
) {
  const leaf = LEAF.conifer;
  const skirt = SKIRT * (tiers > 2 ? 1 : 0.4);
  for (let t = 0; t < tiers; t++) {
    const low = skirt + ((1 - skirt) * t) / tiers;
    const span = ((1 - skirt) / tiers) * 1.7;
    const high = Math.min(1, low + span);
    const reach = 0.02 + 0.19 * (1 - (low - skirt) / (1 - skirt)) ** 0.85;
    const turned = (s: number) =>
      ((s + (t % 2) / 2) / around) * 2 * Math.PI + x * 40;
    const rim = build.positions.length / 3;
    for (let s = 0; s < around; s++) {
      const nx = Math.cos(turned(s));
      const nz = Math.sin(turned(s));
      const ragged = (1 + 0.2 * Math.sin(s * 2.4 + t * 1.9)) * reach * size;
      const droop = 0.02 * Math.sin(s * 3.1 + t);
      vertex(
        build,
        [x + nx * ragged, (low + droop) * size, z + nz * ragged],
        [nx, 1.5, nz],
        shaded(leaf, 1.15),
      );
    }
    const tip = build.positions.length / 3;
    const pinch = (t === tiers - 1 ? 0.002 : reach * 0.22) * size;
    for (let s = 0; s < around; s++) {
      const nx = Math.cos(turned(s));
      const nz = Math.sin(turned(s));
      vertex(
        build,
        [x + nx * pinch, high * size, z + nz * pinch],
        [nx, 2.2, nz],
        shaded(leaf, t === tiers - 1 ? 1 : 0.5),
      );
    }
    band(build, rim, tip, around);
  }
}

function conifer(build: Build, detail: TreeDetail) {
  const { tiers, around, trunk } = CONIFER[detail];
  if (trunk > 0) {
    limb(
      build,
      [
        [[0, -0.04, 0], 0.024],
        [[0, SKIRT + 0.1, 0], 0.017],
      ],
      trunk,
    );
  }
  const spires = detail === 'far' ? STAND : ([[0, 0, 1]] as const);
  for (const each of spires) spire(build, each, tiers, around);
}

const BUILDERS: Readonly<
  Record<TreeKind, (build: Build, detail: TreeDetail) => void>
> = { broadleaf, conifer };

/**
 * A kind's tree at a detail: one unit tall with its foot at the origin (a
 * little of the trunk below it, to stand in sloping ground), `y` up, coloured
 * per vertex.
 */
export function treeGeometry(kind: TreeKind, detail: TreeDetail) {
  const build: Build = { positions: [], normals: [], colours: [], indices: [] };
  BUILDERS[kind](build, detail);
  const geometry = new BufferGeometry();
  const set = (name: string, values: number[]) => {
    geometry.setAttribute(
      name,
      new BufferAttribute(new Float32Array(values), 3),
    );
  };
  set('position', build.positions);
  set('normal', build.normals);
  set('color', build.colours);
  geometry.setIndex(new BufferAttribute(new Uint16Array(build.indices), 1));
  return geometry;
}
