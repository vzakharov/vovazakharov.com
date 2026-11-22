import { rollWith } from '@/dice/shared/roll';

import type { CubeCell } from '@/island/shared/globe';

import { forestCover } from './forest-cover';
import {
  CELL,
  FINEST_LEVEL,
  plantOf,
  slopeAt,
  spotIn,
  type Tree,
  type TreeGround,
} from './tree-placing';

/** Candidate spots for a log along a finest cell's side. */
const SPOTS = 5;

/** The share of spots holding a log in closed forest. */
const LOGS = 0.12;

/** A crown's reach from its trunk as a share of the tree's height, at a girth of 1. */
const CROWN: Readonly<Partial<Record<Tree['kind'], number>>> = {
  broadleaf: 0.42,
  conifer: 0.27,
};

/**
 * The share of the ground's light a lone tree's shade takes at its trunk, and
 * a tree's in closed forest, where the ground is already drawn in the canopy's
 * shade and a tree adds only what gathers at its foot.
 */
const SHADE_OPEN = 0.5;
const SHADE_UNDER = 0.22;

/** The cover over which the ground is drawn as forest floor: none below the first, all of it from the second. */
const FLOOR_COVER = [0.36, 0.64] as const;

const smooth = (low: number, high: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - low) / (high - low)));
  return t * t * (3 - 2 * t);
};

/**
 * What lies on the ground in `cell` under `trees`, the trees `treesIn` stood
 * there: a shade under each, and fallen logs where the forest is closed. All of
 * it lies along the slope. Only a cell of the finest level holds any.
 */
export function floorIn(
  cell: CubeCell,
  ground: TreeGround,
  trees: readonly Tree[],
): Tree[] {
  const { face, level, x, y } = cell;
  if (level !== FINEST_LEVEL) return [];
  const lying = ({ p, height }: Tree) => {
    const [east, north] = slopeAt(p, height, ground.groundAt);
    const upright = 1 / Math.hypot(1, east, north);
    const sand = ground.sandAt(p, height);
    return {
      lean: [-east, -north] as const,
      cover: forestCover(ground.seed, { p, height, sand, upright }),
    };
  };
  const floor: Tree[] = [];
  for (const tree of trees) {
    const reach = CROWN[tree.kind];
    if (reach === undefined) continue;
    const { lean, cover } = lying(tree);
    floor.push({
      ...tree,
      kind: 'shade',
      tall: reach * tree.tall * tree.girth,
      girth: 1,
      lean,
      shade:
        SHADE_OPEN + (SHADE_UNDER - SHADE_OPEN) * smooth(...FLOOR_COVER, cover),
    });
  }
  const at = `floor/${face}/${String(x)}/${String(y)}`;
  const rolled = rollWith(CELL, (path) => ground.wordAt(`${at}/${path}`));
  for (let slot = 0; slot < SPOTS * SPOTS; slot++) {
    const { u, v, chance } = rolled.spot.at({ slot });
    if (chance >= LOGS) continue;
    const p = spotIn(cell, slot, SPOTS, u, v);
    const height = ground.groundAt(p);
    if (height <= 0) continue;
    const log = plantOf({ p, height }, 'log', rolled.shape.at({ slot }));
    const { lean, cover } = lying(log);
    if (chance >= LOGS * smooth(...FLOOR_COVER, cover)) continue;
    floor.push({ ...log, lean });
  }
  return floor;
}
