import { rollWith } from '@/dice/shared/roll';

import type { CubeCell } from '@/island/shared/globe';

import { forestCover, TREELINE } from './forest-cover';
import {
  CELL,
  FINEST_LEVEL,
  plantOf,
  spotIn,
  type Tree,
  type TreeGround,
  uprightAt,
} from './tree-placing';

/** Candidate spots along a finest cell's side: one every 6 m or so. */
const SPOTS = 6;

/** The share of spots holding a bush in open ground, and in closed forest. */
const BUSHES_OPEN = 0.07;
const BUSHES_UNDER = 0.3;

/** The share of spots holding a tuft where the ground is all sand. */
const TUFTS = 0.5;

/** How much wider a bush is for its height than a tree's crown. */
const BUSH_GIRTH = 1.25;

/** The height under which the sand is the sea's, too wet and too often washed for grass, metres. */
const WASHED = 3;

/** `x` between `low` and `high`, as a share from 0 to 1. */
const between = (low: number, high: number, x: number) =>
  Math.min(1, Math.max(0, (x - low) / (high - low)));

/**
 * The low growth standing in `cell`, as pure a function as `treesIn`: dune
 * grass where the ground is sand above the wash, bushes under the forest and
 * thinly over open ground below the treeline. Only a cell of the finest level
 * holds any, so it draws as far as the nearest trees' tier.
 */
export function undergrowthIn(cell: CubeCell, ground: TreeGround): Tree[] {
  const { face, level, x, y } = cell;
  if (level !== FINEST_LEVEL) return [];
  const at = `undergrowth/${face}/${String(x)}/${String(y)}`;
  const rolled = rollWith(CELL, (path) => ground.wordAt(`${at}/${path}`));
  const growth: Tree[] = [];
  for (let slot = 0; slot < SPOTS * SPOTS; slot++) {
    const { u, v, chance } = rolled.spot.at({ slot });
    // No kind is likelier than this: the ground's readings are spared.
    if (chance >= Math.max(TUFTS, BUSHES_UNDER)) continue;
    const p = spotIn(cell, slot, SPOTS, u, v);
    const height = ground.groundAt(p);
    if (height <= 0 || height > TREELINE) continue;
    const sand = ground.sandAt(p, height);
    const tufts = height < WASHED ? 0 : TUFTS * between(0.2, 0.7, sand);
    const kind = chance < tufts ? 'tuft' : 'bush';
    if (kind === 'bush') {
      const site = { p, height, sand, upright: 1 };
      const open = BUSHES_OPEN * (1 - between(0.15, 0.6, sand));
      const easy =
        open + (BUSHES_UNDER - open) * forestCover(ground.seed, site);
      if (chance >= easy) continue;
      const upright = uprightAt(p, height, ground.groundAt);
      const steep = forestCover(ground.seed, { ...site, upright });
      if (
        chance >=
        open * between(0.74, 0.87, upright) + (BUSHES_UNDER - open) * steep
      )
        continue;
    }
    const shape = rolled.shape.at({ slot });
    const girth = shape.girth * (kind === 'bush' ? BUSH_GIRTH : 1);
    growth.push(plantOf({ p, height }, kind, { ...shape, girth }));
  }
  return growth;
}
