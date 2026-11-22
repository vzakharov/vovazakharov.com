import { BufferAttribute, BufferGeometry } from 'three/webgpu';

import type { TreeKind } from '../model/tree-placing';
import {
  band,
  type Build,
  LEAF,
  limb,
  mass,
  type P3,
  shaded,
  type TreeDetail,
  vertex,
} from './tree-mesh-parts';
import { bush, tuft } from './undergrowth-meshes';

/** Sides and rows of a leaf mass, sides of the trunk, and the crown's masses drawn, by detail. */
const BROADLEAF = {
  near: { around: 8, rows: 5, trunk: 7, masses: 6 },
  mid: { around: 5, rows: 3, trunk: 3, masses: 3 },
  far: { around: 6, rows: 3, trunk: 0, masses: 1 },
  least: { around: 5, rows: 2, trunk: 0, masses: 1 },
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
  least: { tiers: 1, around: 4, trunk: 0 },
} as const;

/** Where the lowest boughs hang, as a share of the tree's height. */
const SKIRT = 0.16;

/**
 * The spires a trunkless conifer is, each its place across and its size: a far tree
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
  const spires = trunk === 0 ? STAND : ([[0, 0, 1]] as const);
  for (const each of spires) spire(build, each, tiers, around);
}

const BUILDERS: Readonly<
  Record<TreeKind, (build: Build, detail: TreeDetail) => void>
> = { broadleaf, conifer, bush, tuft };

/**
 * A kind's plant at a detail: one unit tall with its foot at the origin (a
 * little of it below, to stand in sloping ground), `y` up, coloured per
 * vertex.
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
