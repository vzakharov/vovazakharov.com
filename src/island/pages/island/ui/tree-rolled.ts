import { cross, R, unit, type Vec3 } from '@/island/shared/globe';

import { tangentsAt, type Tree, type TreeKind } from '../model/tree-placing';

/** A cell's plants ready to lay out: feet in world metres, each one's frame and colour. */
export type Rolled = {
  readonly kinds: readonly TreeKind[];
  /** `xyz` per plant, world metres, float64. */
  readonly feet: Float64Array;
  /** The plant's frame per plant, three columns scaled to its size. */
  readonly frames: Float32Array;
  /** Linear `rgb` per plant, which multiplies the mesh's colours. */
  readonly tints: Float32Array;
  used: number;
};

/**
 * What multiplies a plant's mesh colours: a leaf tint, cool to warm green by
 * `tint` and darker to lighter by `shade`; a log's bark lighter or darker; and
 * of a shade, the share of light it takes.
 */
const tintOf = ({ kind, tint, shade }: Tree): Vec3 => {
  if (kind === 'shade') return [shade, shade, shade];
  const light = 0.78 + 0.44 * shade;
  if (kind === 'log') return [light, light, light];
  return [
    light * (0.82 + 0.4 * tint),
    light * (0.95 + 0.1 * tint),
    light * (1.12 - 0.36 * tint),
  ];
};

export function rolledOf(trees: readonly Tree[]): Rolled {
  const feet = new Float64Array(trees.length * 3);
  const frames = new Float32Array(trees.length * 9);
  const tints = new Float32Array(trees.length * 3);
  for (const [n, tree] of trees.entries()) {
    const { p, height, tall, girth, lean, spin } = tree;
    const radius = R + height;
    feet.set([p[0] * radius, p[1] * radius, p[2] * radius], n * 3);
    const [east, north] = tangentsAt(p);
    const up = unit([
      p[0] + east[0] * lean[0] + north[0] * lean[1],
      p[1] + east[1] * lean[0] + north[1] * lean[1],
      p[2] + east[2] * lean[0] + north[2] * lean[1],
    ]);
    // Across the leaning `up`, so what lies on a slope lies along it.
    const across = unit(cross(north, up));
    const along = cross(up, across);
    const c = Math.cos(spin) * tall * girth;
    const s = Math.sin(spin) * tall * girth;
    for (let k = 0; k < 3; k++) {
      const e = across[k] ?? 0;
      const o = along[k] ?? 0;
      frames[n * 9 + k] = e * c + o * s;
      frames[n * 9 + 3 + k] = (up[k] ?? 0) * tall;
      // East, up, south: right-handed, or every face would turn its back.
      frames[n * 9 + 6 + k] = e * s - o * c;
    }
    tints.set(tintOf(tree), n * 3);
  }
  return { kinds: trees.map(({ kind }) => kind), feet, frames, tints, used: 0 };
}
