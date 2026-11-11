import type { Thing } from '@/cube/shared/lib/thing';

import type { Recipe } from '../lib/tools';
import { CLUTTER } from './clutter';
import { FITTINGS } from './fittings';
import { HOME } from './home';
import { LEISURE } from './leisure';
import { OFFICE } from './office';
import { WORKS } from './works';

/** How each thing a room can hold is made. */
export const RECIPES: Readonly<Record<Thing, Recipe>> = {
  ...OFFICE,
  ...FITTINGS,
  ...CLUTTER,
  ...HOME,
  ...LEISURE,
  ...WORKS,
};
