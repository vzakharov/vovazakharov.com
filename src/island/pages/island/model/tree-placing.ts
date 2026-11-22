import { roll, rollWith } from '@/dice/shared/roll';

import {
  cross,
  type CubeCell,
  FACES,
  faceToSphere,
  R,
  sphereToFace,
  unit,
  type Vec3,
} from '@/island/shared/globe';

import {
  coniferShare,
  forestCover,
  type Seeded,
  type Spot,
  stature,
} from './forest-cover';

/** The cube level of the finest placing cells, 38 m across at a face's middle. */
const FINEST_LEVEL = 18;

/** Candidate spots along a cell's side: a cell holds this many squared. */
const SPOTS = 4;

/** How many of its own cells away a tier's trees are still drawn. */
const REACH_CELLS = 8;

/**
 * The tiers trees are placed in. Tier `t`'s cells are `2^t` finest cells
 * across and hold as many candidate spots as any other's, drawn out to
 * `tierReach(t)`: so the trees standing within sight thin with distance as the
 * square of it, the same count in every doubling, and no tier is ever swapped
 * for another — each tree only shrinks away toward its own tier's reach.
 */
export const TREE_TIERS = 5;

/** A tier's cell width at a face's middle, metres. */
export const tierCell = (tier: number) =>
  (R * Math.PI) / 2 / 2 ** (FINEST_LEVEL - tier);

/** The distance at which a tier's trees have shrunk to nothing, metres. */
export const tierReach = (tier: number) => REACH_CELLS * tierCell(tier);

export const TREE_KINDS = ['broadleaf', 'conifer'] as const;

export type TreeKind = (typeof TREE_KINDS)[number];

/** One tree: where its foot stands and what sets it apart from its kind's others. */
export type Tree = Spot & {
  readonly kind: TreeKind;
  /** Its height, metres. */
  readonly tall: number;
  /** Its crown's width as a share of its kind's usual one for that height. */
  readonly girth: number;
  /** Its lean off the plumb line, radians, east and north. */
  readonly lean: readonly [number, number];
  /** Its turn about its own trunk, radians. */
  readonly spin: number;
  /** Where its leaves sit between the kind's coolest green (0) and warmest (1). */
  readonly tint: number;
  /** How light its leaves are, 0 darkest to 1 lightest. */
  readonly shade: number;
};

/** The ground trees stand on. */
type Grounded = Seeded & {
  /** Metres above the sea over a unit direction, no detail cut. */
  readonly groundAt: (p: Vec3) => number;
  /** The share of sand in the ground over a unit direction `height` metres up (`sandAt`). */
  readonly sandAt: (p: Vec3, height: number) => number;
};

/** The ground the trees stand on and the world they are rolled from. */
export type TreeGround = Grounded & {
  /** The world's word at a path (`pathHash` of the world number). */
  readonly wordAt: (path: string) => number;
};

const SPOT = roll.struct({
  u: roll.uniform(0, 1),
  v: roll.uniform(0, 1),
  chance: roll.uniform(0, 1),
});

const SHAPE = roll.struct({
  kind: roll.uniform(0, 1),
  tall: roll.uniform(0, 1),
  girth: roll.uniform(0.8, 1.25),
  leanEast: roll.normal(),
  leanNorth: roll.normal(),
  spin: roll.uniform(0, 2 * Math.PI),
  tint: roll.uniform(0, 1),
  shade: roll.uniform(0, 1),
});

const CELL = roll.struct({
  spot: roll.over(roll.key({ slot: roll.int }), SPOT),
  shape: roll.over(roll.key({ slot: roll.int }), SHAPE),
});

/** A kind's shortest and tallest grown tree, metres. */
const TALL: Readonly<Record<TreeKind, readonly [number, number]>> = {
  broadleaf: [9, 19],
  conifer: [11, 26],
};

/** A typical lean, radians: a couple of degrees. */
const LEAN = 0.035;

/** How far either side of a spot the ground is read for its slope, metres. */
const SLOPE_SPAN = 3;

/** Two unit tangents at `p`, at right angles: the second is `p × first`. */
export function tangentsAt(p: Vec3): readonly [Vec3, Vec3] {
  const axis: Vec3 = Math.abs(p[2]) < 0.9 ? [0, 0, 1] : [1, 0, 0];
  const east = unit(cross(axis, p));
  return [east, cross(p, east)];
}

/** The ground's uprightness at `p` — the cosine of its slope — from the heights `SLOPE_SPAN` to either tangent. */
function uprightAt(
  p: Vec3,
  height: number,
  groundAt: TreeGround['groundAt'],
): number {
  const [east, north] = tangentsAt(p);
  const step = SLOPE_SPAN / R;
  const rise = (t: Vec3) =>
    (groundAt(
      unit([p[0] + t[0] * step, p[1] + t[1] * step, p[2] + t[2] * step]),
    ) -
      height) /
    SLOPE_SPAN;
  return 1 / Math.hypot(1, rise(east), rise(north));
}

/**
 * The trees standing in `cell`, a pure function of the cell, the ground and
 * the world: each of the cell's spots is rolled a place within its own square
 * of the cell and holds a tree where its rolled chance falls under the forest
 * cover there, so the trees stand as densely as `forestCover` says and the
 * same tree stands in the same spot on every visit.
 */
export function treesIn(cell: CubeCell, ground: TreeGround): Tree[] {
  const { face, level, x, y } = cell;
  const at = `trees/${face}/${String(level)}/${String(x)}/${String(y)}`;
  const rolled = rollWith(CELL, (path) => ground.wordAt(`${at}/${path}`));
  const lines = 2 ** level;
  const trees: Tree[] = [];
  for (let slot = 0; slot < SPOTS * SPOTS; slot++) {
    const { u, v, chance } = rolled.spot.at({ slot });
    const i = slot % SPOTS;
    const j = Math.floor(slot / SPOTS);
    const p = faceToSphere(
      face,
      (2 * (x + (i + u) / SPOTS)) / lines - 1,
      (2 * (y + (j + v) / SPOTS)) / lines - 1,
    );
    const height = ground.groundAt(p);
    // Bare at any slope on any soil: the sand's and the slope's readings are spared.
    const easy = { p, height, upright: 1, sand: 0 };
    if (forestCover(ground.seed, easy) <= chance) continue;
    const sand = ground.sandAt(p, height);
    if (forestCover(ground.seed, { ...easy, sand }) <= chance) continue;
    const upright = uprightAt(p, height, ground.groundAt);
    if (forestCover(ground.seed, { ...easy, sand, upright }) <= chance)
      continue;
    const { girth, spin, tint, shade, ...shape } = rolled.shape.at({ slot });
    const kind = shape.kind < coniferShare(height) ? 'conifer' : 'broadleaf';
    const [short, tallest] = TALL[kind];
    trees.push({
      p,
      height,
      kind,
      tall: (short + (tallest - short) * shape.tall) * stature(height),
      girth,
      lean: [shape.leanEast * LEAN, shape.leanNorth * LEAN],
      spin,
      tint,
      shade,
    });
  }
  return trees;
}

/** One number per cell of a level up to `FINEST_LEVEL`, for a map's key. */
export const cellKey = ({ face, level, x, y }: CubeCell) =>
  ((FACES.indexOf(face) * 32 + level) * 2 ** 20 + x) * 2 ** 20 + y;

/** The cell along one face coordinate `w`, of `lines` to a face's side. */
const lineOf = (w: number, lines: number) =>
  Math.min(lines - 1, Math.max(0, Math.floor(((w + 1) / 2) * lines)));

/**
 * The cells of `tier` holding ground within its reach of the unit direction
 * `p`, across face edges alike: a tangent grid of half-cell steps about `p`,
 * each point told its cell.
 */
export function cellsAround(p: Vec3, tier: number): CubeCell[] {
  const level = FINEST_LEVEL - tier;
  const lines = 2 ** level;
  const cell = tierCell(tier);
  const reach = tierReach(tier) + cell;
  const [east, north] = tangentsAt(p);
  const steps = Math.ceil((2 * reach) / cell);
  const found = new Map<number, CubeCell>();
  for (let b = -steps; b <= steps; b++) {
    for (let a = -steps; a <= steps; a++) {
      const e = (a * cell) / 2;
      const n = (b * cell) / 2;
      if (Math.hypot(e, n) > reach + cell) continue;
      const point = sphereToFace([
        p[0] + (east[0] * e + north[0] * n) / R,
        p[1] + (east[1] * e + north[1] * n) / R,
        p[2] + (east[2] * e + north[2] * n) / R,
      ]);
      const { face, u, v } = point;
      const held: CubeCell = {
        face,
        level,
        x: lineOf(u, lines),
        y: lineOf(v, lines),
      };
      found.set(cellKey(held), held);
    }
  }
  return [...found.values()];
}
