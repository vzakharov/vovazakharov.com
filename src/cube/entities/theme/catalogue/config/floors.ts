import { DWELLING_FLOORS } from '../../dwelling';
import { EDGE_FLOORS } from '../../edge';
import type { Floors, FloorTheme } from '../../kit';
import { LABORATORY_FLOORS } from '../../laboratory';
import { LEISURE_FLOORS } from '../../leisure';
import { WORKPLACE_FLOORS } from '../../workplace';
import { generic } from './generic';

const BANDS: Floors = {
  ...WORKPLACE_FLOORS,
  ...DWELLING_FLOORS,
  ...LEISURE_FLOORS,
  ...LABORATORY_FLOORS,
  ...EDGE_FLOORS,
};

/**
 * Pairs of floors that show each other's theme rather than their band's:
 * the operator's order of the building, which the bands do not yet follow.
 */
const TRADED: ReadonlyArray<readonly [number, number]> = [[9, 66]];

const DESIGNED: Floors = {
  ...BANDS,
  ...Object.fromEntries(
    TRADED.flatMap(([a, b]) => [
      [a, BANDS[b]],
      [b, BANDS[a]],
    ]),
  ),
};

const undesigned = new Map<number, FloorTheme>();

/** Floor `n`'s theme, the same object on every call: its own, or `generic`'s. */
export function themeOf(n: number): FloorTheme {
  const designed = DESIGNED[n];
  if (designed !== undefined) return designed;
  const known = undesigned.get(n);
  if (known !== undefined) return known;
  const made = generic(n);
  undesigned.set(n, made);
  return made;
}
