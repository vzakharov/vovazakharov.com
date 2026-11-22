import {
  Color,
  DoubleSide,
  FrontSide,
  Group,
  InstancedBufferAttribute,
  InstancedMesh,
  MeshLambertNodeMaterial,
} from 'three/webgpu';

import type { CanDispose } from '@/kernel/shared/typings';

import { type CubeCell, R, unit, type Vec3 } from '@/island/shared/globe';

import {
  cellKey,
  cellsAround,
  tangentsAt,
  tierCell,
  tierReach,
  type Tree,
  TREE_KINDS,
  TREE_TIERS,
  type TreeGround,
  type TreeKind,
  treesIn,
} from '../model/tree-placing';
import { undergrowthIn } from '../model/undergrowth';
import { TREE_DETAILS, type TreeDetail } from './tree-mesh-parts';
import { treeGeometry } from './tree-meshes';
import { FOOT_ATTRIBUTE, treeNodes } from './tree-nodes';

/** Plants a mesh of each detail holds at most, per kind: 52,000 in all. */
const CAPACITY: Readonly<Record<TreeDetail, number>> = {
  near: 600,
  mid: 4400,
  far: 8000,
};

/** The distance out to which a tree is drawn at each detail, metres. */
const DRAWN_TO: Readonly<Record<TreeDetail, number>> = {
  near: 80,
  mid: 320,
  far: Infinity,
};

/** Ms of a frame spent rolling the cells still missing. */
const ROLL_BUDGET = 3;

/** Metres the eye moves before the instances are laid out again. */
const RELAY_EVERY = 7;

/** Cells kept rolled before the ones longest unused are let go. */
const CELLS_KEPT = 5000;

/** A cell's trees ready to lay out: feet in world metres, each tree's frame and colour. */
type Rolled = {
  readonly kinds: readonly TreeKind[];
  /** `xyz` per tree, world metres, float64. */
  readonly feet: Float64Array;
  /** The tree's frame per tree, three columns scaled to its size. */
  readonly frames: Float32Array;
  /** Linear `rgb` per tree, which multiplies the mesh's colours. */
  readonly tints: Float32Array;
  used: number;
};

/** A tree's leaf tint: cool to warm green by `tint`, darker to lighter by `shade`. */
const tintOf = ({ tint, shade }: Tree): Vec3 => {
  const light = 0.78 + 0.44 * shade;
  return [
    light * (0.82 + 0.4 * tint),
    light * (0.95 + 0.1 * tint),
    light * (1.12 - 0.36 * tint),
  ];
};

function rolledOf(trees: readonly Tree[]): Rolled {
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
    const c = Math.cos(spin) * tall * girth;
    const s = Math.sin(spin) * tall * girth;
    for (let k = 0; k < 3; k++) {
      const e = east[k] ?? 0;
      const o = north[k] ?? 0;
      frames[n * 9 + k] = e * c + o * s;
      frames[n * 9 + 3 + k] = (up[k] ?? 0) * tall;
      // East, up, south: right-handed, or every face would turn its back.
      frames[n * 9 + 6 + k] = e * s - o * c;
    }
    tints.set(tintOf(tree), n * 3);
  }
  return { kinds: trees.map(({ kind }) => kind), feet, frames, tints, used: 0 };
}

/** One kind's trees at one detail, as instances. */
type Stand = {
  readonly mesh: InstancedMesh;
  readonly foot: InstancedBufferAttribute;
  readonly capacity: number;
};

export type TreeView = CanDispose & {
  /** What the scene holds: every tree drawn hangs under it. */
  readonly group: Group;
  /** The ground to stand trees on; every tree of another is let go. Null until a world's field is in hand. */
  readonly setGround: (ground: TreeGround | null) => void;
  /** Whether trees draw at all: the plain look shows none. */
  readonly setShown: (on: boolean) => void;
  /**
   * Places the trees for an eye at `position` (world metres), `height` metres
   * over the ground, with the wind as it blows at `seconds`: rolls a few of
   * the cells still missing and lays the instances out again where the eye has
   * moved on.
   */
  readonly draw: (position: Vec3, height: number, seconds: number) => void;
  /** Has the next `draw` roll every cell still missing, however long it takes: a still's trees are all there. */
  readonly rollWhole: () => void;
  /** Trees drawn now, for diagnostics. */
  readonly count: () => number;
};

/**
 * The trees around the eye and the low growth among them, drawn as instances
 * of each kind at three details.
 * Trees are rolled per placing cell in five tiers (`tree-placing`), each tier
 * drawn out to its own reach: a tree shrinks to nothing as the eye draws away
 * toward its tier's reach, in the vertex shader, so nothing is switched off at
 * a line and the far ground's canopy shading takes over under trees already
 * too small to see. `dress` lights a material as the land is lit.
 */
export function treeView(
  dress: (material: MeshLambertNodeMaterial) => void,
): TreeView {
  const group = new Group();
  group.visible = false;

  const { drawnAt, centre, seconds } = treeNodes();
  const materials = TREE_KINDS.map((kind) => {
    const material = new MeshLambertNodeMaterial({
      vertexColors: true,
      side: kind === 'conifer' || kind === 'tuft' ? DoubleSide : FrontSide,
    });
    material.positionNode = drawnAt;
    dress(material);
    return material;
  });

  const stands = TREE_KINDS.map((kind, k) =>
    TREE_DETAILS.map((detail): Stand => {
      const capacity = CAPACITY[detail];
      const geometry = treeGeometry(kind, detail);
      const footAttribute = new InstancedBufferAttribute(
        new Float32Array(capacity * 4),
        4,
      );
      geometry.setAttribute(FOOT_ATTRIBUTE, footAttribute);
      const mesh = new InstancedMesh(geometry, materials[k], capacity);
      mesh.setColorAt(0, new Color(1, 1, 1));
      mesh.frustumCulled = false;
      mesh.count = 0;
      group.add(mesh);
      return { mesh, foot: footAttribute, capacity };
    }),
  );

  let ground: TreeGround | null = null;
  let on = false;
  const rolled = new Map<number, Rolled>();
  /** Each tier's cells in reach, and where the eye stood when they were listed. */
  const tiers: Array<{ cells: CubeCell[]; from: Vec3 | null }> = Array.from(
    { length: TREE_TIERS },
    () => ({ cells: [], from: null }),
  );
  /** Cells in reach not yet rolled, nearest tier first. */
  let missing: CubeCell[] = [];
  let anchor: Vec3 = [0, 0, 0];
  /** Where the eye stood at the last layout; null asks for one. */
  let laid: Vec3 | null = null;
  let frame = 0;

  const moved = (a: Vec3, b: Vec3) =>
    Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

  /** Lists again the cells of every tier the eye has left a quarter-cell behind. */
  const list = (position: Vec3, height: number) => {
    let changed = false;
    for (const [tier, held] of tiers.entries()) {
      if (height > tierReach(tier)) {
        if (held.cells.length > 0) changed = true;
        held.cells = [];
        held.from = null;
        continue;
      }
      if (held.from !== null && moved(held.from, position) < tierCell(tier) / 4)
        continue;
      held.cells = cellsAround(unit(position), tier);
      held.from = position;
      changed = true;
    }
    if (!changed) return;
    missing = tiers.flatMap(({ cells }) =>
      cells.filter((cell) => !rolled.has(cellKey(cell))),
    );
    laid = null;
  };

  let whole = false;
  const roll = (world: TreeGround) => {
    const until = whole ? Infinity : performance.now() + ROLL_BUDGET;
    whole = false;
    let took = 0;
    while (took < missing.length && performance.now() < until) {
      const cell = missing[took];
      took += 1;
      if (cell === undefined) continue;
      rolled.set(
        cellKey(cell),
        rolledOf([...treesIn(cell, world), ...undergrowthIn(cell, world)]),
      );
    }
    if (took === 0) return;
    missing = missing.slice(took);
    laid = null;
    if (rolled.size <= CELLS_KEPT) return;
    const stale = [...rolled.entries()]
      .toSorted(([, a], [, b]) => a.used - b.used)
      .slice(0, rolled.size - CELLS_KEPT);
    for (const [key] of stale) rolled.delete(key);
  };

  /** Lays every rolled tree in reach out as an instance, about a new anchor at the eye. */
  const layOut = (position: Vec3) => {
    anchor = position;
    laid = position;
    // The planet's middle as the instances see it, from the anchor.
    centre.value.set(-position[0], -position[1], -position[2]);
    for (const kind of stands) for (const { mesh } of kind) mesh.count = 0;
    const [ex, ey, ez] = position;
    for (const [tier, { cells }] of tiers.entries()) {
      const reach = tierReach(tier);
      for (const cell of cells) {
        const held = rolled.get(cellKey(cell));
        if (held === undefined) continue;
        held.used = frame;
        const { kinds, feet, frames, tints } = held;
        for (const [n, kind] of kinds.entries()) {
          const x = (feet[n * 3] ?? 0) - ex;
          const y = (feet[n * 3 + 1] ?? 0) - ey;
          const z = (feet[n * 3 + 2] ?? 0) - ez;
          const distance = Math.hypot(x, y, z);
          if (distance > reach) continue;
          const detail = TREE_DETAILS.findIndex(
            (name) => distance <= DRAWN_TO[name],
          );
          const stand = stands[TREE_KINDS.indexOf(kind)]?.[detail];
          if (stand === undefined || stand.mesh.count >= stand.capacity)
            continue;
          const i = stand.mesh.count;
          stand.mesh.count += 1;
          const matrix = stand.mesh.instanceMatrix.array;
          for (let column = 0; column < 3; column++) {
            for (let row = 0; row < 3; row++) {
              matrix[i * 16 + column * 4 + row] =
                frames[n * 9 + column * 3 + row] ?? 0;
            }
            matrix[i * 16 + column * 4 + 3] = 0;
          }
          matrix.set([x, y, z, 1], i * 16 + 12);
          stand.foot.array.set([x, y, z, reach], i * 4);
          stand.mesh.instanceColor?.array.set(
            tints.subarray(n * 3, n * 3 + 3),
            i * 3,
          );
        }
      }
    }
    for (const kind of stands) {
      for (const { mesh, foot: feet } of kind) {
        mesh.instanceMatrix.needsUpdate = true;
        feet.needsUpdate = true;
        if (mesh.instanceColor !== null) mesh.instanceColor.needsUpdate = true;
      }
    }
  };

  const forget = () => {
    rolled.clear();
    missing = [];
    for (const tier of tiers) {
      tier.cells = [];
      tier.from = null;
    }
    laid = null;
    for (const kind of stands) for (const { mesh } of kind) mesh.count = 0;
  };

  return {
    group,
    setGround: (next) => {
      ground = next;
      forget();
    },
    setShown: (shownNow) => {
      on = shownNow;
      group.visible = on && ground !== null;
    },
    draw: (position, height, at) => {
      seconds.value = at;
      group.visible = on && ground !== null;
      if (!on || ground === null) return;
      frame += 1;
      list(position, height);
      roll(ground);
      if (laid === null || moved(laid, position) > RELAY_EVERY)
        layOut(position);
      group.position.set(
        anchor[0] - position[0],
        anchor[1] - position[1],
        anchor[2] - position[2],
      );
    },
    rollWhole: () => {
      whole = true;
    },
    count: () =>
      stands.flat().reduce((total, { mesh }) => total + mesh.count, 0),
    dispose: () => {
      for (const kind of stands) {
        for (const { mesh } of kind) mesh.geometry.dispose();
      }
      for (const material of materials) material.dispose();
    },
  };
}
