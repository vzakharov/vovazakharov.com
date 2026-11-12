import { DWELLING_FLOORS } from '../../dwelling';
import { EDGE_FLOORS } from '../../edge';
import type { Floors, FloorTheme } from '../../kit';
import { LABORATORY_FLOORS } from '../../laboratory';
import { LEISURE_FLOORS } from '../../leisure';
import { WORKPLACE_FLOORS } from '../../workplace';

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

/** Floor `n`'s theme; a floor the building does not have has none, and throws. */
export function themeOf(n: number): FloorTheme {
  const theme = DESIGNED[n];
  if (theme === undefined)
    throw new RangeError(`floor ${String(n)} has no theme`);
  return theme;
}
