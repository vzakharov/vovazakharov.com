import type { Floors, FloorTheme } from '../model/theme';
import { BREAKS } from './bands/breaks';
import { EDGES } from './bands/edges';
import { HOMES } from './bands/homes';
import { LABS } from './bands/labs';
import { OFFICES } from './bands/offices';
import { generic } from './generic';

const DESIGNED: Floors = {
  ...OFFICES,
  ...HOMES,
  ...BREAKS,
  ...LABS,
  ...EDGES,
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
