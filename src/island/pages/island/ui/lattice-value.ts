import { dot, Fn, uniform } from 'three/tsl';
import { type Node, Vector3 } from 'three/webgpu';

import { pathHash, roll, rollWith } from '@/dice/shared/roll';

/**
 * How many whole cells a world shifts the lattice by along each axis, at
 * most: few, so a shifted coordinate folds with the precision an unshifted
 * one does.
 */
const SHIFT_CELLS = 97;

const SHIFT = roll.struct({
  x: roll.pick(SHIFT_CELLS),
  y: roll.pick(SHIFT_CELLS),
  z: roll.pick(SHIFT_CELLS),
});

/** The open world's shift of every lattice the shaders hash, whole cells. */
const worldShift = uniform(new Vector3());

/**
 * Keys every `latticeValue` to the world at path `world`, so no two worlds
 * draw the same grain, cloud or storm at the same place.
 */
export function rollLattice(world: string): void {
  const wordAt = pathHash(world);
  const { x, y, z } = rollWith(SHIFT, (path) => wordAt(`lattice/${path}`));
  worldShift.value.set(x, y, z);
}

/** A lattice cell as the open world numbers it: what a hash of a cell folds. */
export const worldCell = (cell: Node<'vec3'>): Node<'vec3'> =>
  cell.add(worldShift);

/**
 * A lattice point's value, 0 to 1, the open world's own: the one hash every
 * noise the shaders draw is built on.
 */
export const latticeValue = Fn(([point]: [Node<'vec3'>]) => {
  const folded = worldCell(point).mul(0.1031).fract().toVar();
  folded.addAssign(dot(folded, folded.zyx.add(31.32)));
  return folded.x.add(folded.y).mul(folded.z).fract();
});
