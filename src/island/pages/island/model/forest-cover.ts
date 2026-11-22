import { type Elevated, R, type Vec3 } from '@/island/shared/globe';
import { borderLoop, type TileMesh } from '@/island/entities/terrain';

import { SHORE_TOP } from '../lib/land-colour';

/** Where the last conifers stand on level ground, metres above the sea, before the patches make it ragged. */
export const TREELINE = 1150;

/** How far the patches lift or drop the treeline, metres. */
const TREELINE_RAGGED = 140;

/** The height over which the upland's conifers thin out below the treeline, metres. */
const THINNING = 450;

/** The height above the sand over which the first trees fill in, metres. */
const DUNE_BELT = 25;

/** The ground's uprightness (cosine of its slope) where trees stop, and where they stand freely: 42° and 30°. */
const TOO_STEEP = 0.743;
const EASY = 0.866;

/** The share of the patch noise's range at which meadow gives way to forest, and half the width of that edge. */
const FOREST_AT = -0.12;
const EDGE = 0.07;

const smoothstep = (low: number, high: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - low) / (high - low)));
  return t * t * (3 - 2 * t);
};

/** A lattice corner's value in `[-1, 1]`, from integer arithmetic alone. */
function corner(ix: number, iy: number, iz: number, salt: number): number {
  let h =
    Math.imul(ix, 0x27_d4_eb_2d) ^
    Math.imul(iy, 0x16_56_67_b1) ^
    Math.imul(iz, 0x5b_d1_e9_95) ^
    salt;
  h = Math.imul(h ^ (h >>> 15), 0x85_eb_ca_6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2_b2_ae_35);
  h ^= h >>> 16;
  return (h >>> 8) / 0x7f_ff_ff - 1;
}

const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

/** Value noise in `[-1, 1]` at lattice coordinates `(u, v, w)`. */
function latticeNoise(salt: number, u: number, v: number, w: number): number {
  const fu = Math.floor(u);
  const fv = Math.floor(v);
  const fw = Math.floor(w);
  const tu = fade(u - fu);
  const tv = fade(v - fv);
  const tw = fade(w - fw);
  const layer = (iw: number) => {
    const a = corner(fu, fv, iw, salt);
    const b = corner(fu + 1, fv, iw, salt);
    const c = corner(fu, fv + 1, iw, salt);
    const d = corner(fu + 1, fv + 1, iw, salt);
    const bottom = a + (b - a) * tu;
    const top = c + (d - c) * tu;
    return bottom + (top - bottom) * tv;
  };
  const near = layer(fw);
  return near + (layer(fw + 1) - near) * tw;
}

/**
 * The patches' octaves, widest first: each a wavelength in metres, its weight,
 * and a skew of the lattice's axes so no two octaves line up.
 */
const PATCHES = [
  { wavelength: 26_000, weight: 1, skew: 0.31 },
  { wavelength: 6400, weight: 0.75, skew: -0.47 },
  { wavelength: 1600, weight: 0.5, skew: 0.23 },
  { wavelength: 410, weight: 0.3, skew: -0.38 },
] as const;

const PATCH_RANGE = PATCHES.reduce((total, { weight }) => total + weight, 0);

/** Salts the patch lattices apart from each other and from the relief's. */
const patchSalt = (seed: number, layer: number) =>
  Math.imul(seed ^ 0x74_72_65_65, 0x9e_37_79_b1) ^
  Math.imul(layer + 1, 0x63_2b_e5_ab);

/** What forest cover is read from at a place, its `height` metres above the sea. */
export type CoverSite = Elevated & {
  /** The place's unit direction on the sphere. */
  readonly p: Vec3;
  /** The ground's uprightness: the cosine of its slope, 1 on the level. */
  readonly upright: number;
  /**
   * The shortest patch the reader can tell apart, metres: a narrower octave
   * fades to its mean and the forest's edge softens by as much, so a coarse
   * tile carries the average of what a fine one resolves. 0 keeps every patch.
   */
  readonly finest?: number;
};

/** The share of the patches' range that `finest` averages out. */
function droppedShare(finest: number): number {
  let dropped = 0;
  for (const { wavelength, weight } of PATCHES) {
    dropped += weight * (1 - smoothstep(finest, 2 * finest, wavelength));
  }
  return dropped / PATCH_RANGE;
}

/** The patches over unit direction `(x, y, z)`: their weighted sum over the octaves `finest` keeps, in `[-1, 1]`. */
function patchField(
  seed: number,
  x: number,
  y: number,
  z: number,
  finest: number,
): number {
  let kept = 0;
  for (let layer = 0; layer < PATCHES.length; layer++) {
    const { wavelength, weight, skew } = PATCHES[layer] ?? PATCHES[0];
    const shown = smoothstep(finest, 2 * finest, wavelength);
    if (shown === 0) continue;
    const k = R / wavelength;
    kept +=
      weight *
      shown *
      latticeNoise(
        patchSalt(seed, layer),
        k * (x + skew * y),
        k * (y + skew * z),
        k * (z + skew * x),
      );
  }
  return kept / PATCH_RANGE;
}

/** Whether ground at `height` can hold a tree at all, whatever the patches say. */
const inTreeBand = (height: number) =>
  height > SHORE_TOP && height < TREELINE + TREELINE_RAGGED;

/** Cover from the patches' `field` at a place and the share of their range `dropped` there. */
function coverFrom(
  field: number,
  dropped: number,
  height: number,
  upright: number,
): number {
  const standing = smoothstep(TOO_STEEP, EASY, upright);
  if (standing === 0) return 0;
  const line =
    TREELINE + TREELINE_RAGGED * Math.min(1, Math.max(-1, field * 2));
  const thinning = 1 - smoothstep(line - THINNING, line, height);
  const edge = EDGE + dropped;
  const forest = smoothstep(FOREST_AT - edge, FOREST_AT + edge, field);
  const rising = smoothstep(SHORE_TOP, SHORE_TOP + DUNE_BELT, height);
  return forest * thinning * rising * standing;
}

/**
 * The share of ground under tree crowns at a place, 0 bare to 1 closed canopy —
 * the one answer to "where is forest" that the placed trees and the far
 * ground's shading both read. None on the sand, on steep rock or above the
 * treeline; forest broken by meadows and clearings from hundreds of metres to
 * tens of kilometres across over the lowland; thinning up the upland to a
 * ragged treeline. A pure function of the site and the world's `seed` (read as
 * a 32-bit integer).
 */
export function forestCover(seed: number, site: CoverSite): number {
  const { p, height, upright, finest = 0 } = site;
  if (!inTreeBand(height)) return 0;
  return coverFrom(
    patchField(seed, p[0], p[1], p[2], finest),
    droppedShare(finest),
    height,
    upright,
  );
}

/**
 * Forest cover per vertex of a land tile, in the mesh's vertex order, each
 * skirt vertex taking the cover of the border vertex it hangs under. Patches
 * narrower than two of the tile's cells are averaged out, which leaves none
 * narrower than four whole: so on a grid of even cells the patches are sampled
 * at every other vertex and interpolated between, the height and the slope
 * still read at each.
 */
export function tileCover(
  seed: number,
  { key, grid, centre, positions, normals, heights }: TileMesh,
): Float32Array<ArrayBuffer> {
  const [cx = 0, cy = 0, cz = 0] = centre;
  const cells = grid - 1;
  const finest = (R * Math.PI) / (2 ** key.level * cells);
  const dropped = droppedShare(finest);
  const cover = new Float32Array(heights.length);
  const count = grid * grid;
  const step = cells % 2 === 0 ? 2 : 1;

  const fields = new Float32Array(count);
  const direction = [0, 0, 0];
  const point = (v: number) => {
    const x = cx + (positions[v * 3] ?? 0);
    const y = cy + (positions[v * 3 + 1] ?? 0);
    const z = cz + (positions[v * 3 + 2] ?? 0);
    const scale = 1 / Math.hypot(x, y, z);
    direction[0] = x * scale;
    direction[1] = y * scale;
    direction[2] = z * scale;
  };
  for (let j = 0; j < grid; j += step) {
    for (let i = 0; i < grid; i += step) {
      const v = j * grid + i;
      point(v);
      fields[v] = patchField(
        seed,
        direction[0] ?? 0,
        direction[1] ?? 0,
        direction[2] ?? 0,
        finest,
      );
    }
  }
  const sampled = (i: number, j: number) => fields[j * grid + i] ?? 0;
  /** The patches at a vertex, between the sampled ones where it is not one. */
  const fieldAt = (i: number, j: number) => {
    const oddI = i % step;
    const oddJ = j % step;
    if (oddI === 0 && oddJ === 0) return sampled(i, j);
    if (oddJ === 0) return (sampled(i - 1, j) + sampled(i + 1, j)) / 2;
    if (oddI === 0) return (sampled(i, j - 1) + sampled(i, j + 1)) / 2;
    return (
      (sampled(i - 1, j - 1) +
        sampled(i + 1, j - 1) +
        sampled(i - 1, j + 1) +
        sampled(i + 1, j + 1)) /
      4
    );
  };

  for (let j = 0; j < grid; j++) {
    for (let i = 0; i < grid; i++) {
      const v = j * grid + i;
      const height = heights[v] ?? 0;
      if (!inTreeBand(height)) continue;
      point(v);
      const upright =
        (normals[v * 3] ?? 0) * (direction[0] ?? 0) +
        (normals[v * 3 + 1] ?? 0) * (direction[1] ?? 0) +
        (normals[v * 3 + 2] ?? 0) * (direction[2] ?? 0);
      cover[v] = coverFrom(fieldAt(i, j), dropped, height, upright);
    }
  }
  for (const [n, v] of borderLoop(grid).entries()) {
    cover[count + n] = cover[v] ?? 0;
  }
  return cover;
}
