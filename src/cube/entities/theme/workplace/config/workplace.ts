import type { Floors } from '../../kit';
import { RECEPTION } from './01-reception';
import { OPEN_PLAN } from './02-open-plan';
import { SCHOOL_CORRIDOR } from './03-school-corridor';
import { STAIRWELL } from './04-stairwell';
import { PARKING_LEVEL } from './05-parking-level';
import { SERVICE_CORRIDOR } from './06-service-corridor';
import { SERVER_FLOOR } from './07-server-floor';
import { CONFERENCE_HOTEL } from './08-conference-hotel';

/** Floors 1 to 8: places built for work and waiting, with nobody in them. */
export const WORKPLACE_FLOORS: Floors = {
  1: RECEPTION,
  2: OPEN_PLAN,
  3: SCHOOL_CORRIDOR,
  4: STAIRWELL,
  5: PARKING_LEVEL,
  6: SERVICE_CORRIDOR,
  7: SERVER_FLOOR,
  8: CONFERENCE_HOTEL,
};
