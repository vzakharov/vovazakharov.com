import type { Floors } from '../../kit';
import { RECEPTION } from './01-reception';
import { OPEN_PLAN } from './02-open-plan';
import { SCHOOL_CORRIDOR } from './03-school-corridor';

/** Floors 1 to 8: places built for work and waiting, with nobody in them. */
export const WORKPLACE_FLOORS: Floors = {
  1: RECEPTION,
  2: OPEN_PLAN,
  3: SCHOOL_CORRIDOR,
};
