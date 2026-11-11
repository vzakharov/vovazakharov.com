import { DWELLING_FLOORS } from '../../dwelling';
import { EDGE_FLOORS } from '../../edge';
import type { Floors, FloorTheme } from '../../kit';
import { LABORATORY_FLOORS } from '../../laboratory';
import { LEISURE_FLOORS } from '../../leisure';
import { WORKPLACE_FLOORS } from '../../workplace';
import { generic } from './generic';

const DESIGNED: Floors = {
  ...WORKPLACE_FLOORS,
  ...DWELLING_FLOORS,
  ...LEISURE_FLOORS,
  ...LABORATORY_FLOORS,
  ...EDGE_FLOORS,
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
