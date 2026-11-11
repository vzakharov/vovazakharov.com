import type { Floors } from '../../model/theme';
import { RECEPTION } from '../floors/01-reception';
import { OPEN_PLAN } from '../floors/02-open-plan';
import { SCHOOL_CORRIDOR } from '../floors/03-school-corridor';

/** Floors 1 to 8: places built for work and waiting, with nobody in them. */
export const OFFICES: Floors = {
  1: RECEPTION,
  2: OPEN_PLAN,
  3: SCHOOL_CORRIDOR,
};
