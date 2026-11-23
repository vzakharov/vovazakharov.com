import { smoothstep } from '@/scene/shared/lib/ease';

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

/** A lone tree's shade against its crown's reach: it fades past the crown, where it is seen from above. */
const SPREAD = 1.6;

/**
 * The share of the ground's light a lone tree's shade takes at its trunk, and
 * a tree's in closed forest.
 */
const SHADE_OPEN = 0.55;
const SHADE_UNDER = 0.4;

/**
 * How much of its crown's reach a shade keeps in closed forest: the ground is
 * drawn in the canopy's shade there already, and a tree adds only the pool
 * that gathers about its foot.
 */
const POOL = 0.5;

/** The cover over which the ground is drawn as forest floor: none below the first, all of it from the second. */
export const FLOOR_COVER = [0.36, 0.64] as const;

/**
 * What lies on the ground in `cell` under `trees`, the trees `treesIn` stood
 * there: a shade under each, and fallen logs where the forest is closed. All of
 * it lies along the slope. Logs lie in cells of the finest level alone.
 */
export function floorIn(
  cell: CubeCell,
  ground: TreeGround,
  trees: readonly Tree[],
): Tree[] {
  const { face, level, x, y } = cell;
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
    const under = smoothstep(...FLOOR_COVER, cover);
    floor.push({
      ...tree,
      kind: 'shade',
      tall: SPREAD * reach * tree.tall * tree.girth * (1 + (POOL - 1) * under),
      girth: 1,
      lean,
      shade: SHADE_OPEN + (SHADE_UNDER - SHADE_OPEN) * under,
    });
  }
  if (level !== FINEST_LEVEL) return floor;
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
    if (chance >= LOGS * smoothstep(...FLOOR_COVER, cover)) continue;
    floor.push({ ...log, lean });
  }
  return floor;
}
