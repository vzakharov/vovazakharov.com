import type { Floors } from '../../kit';
import { HALLWAY } from './09-hallway';
import { GRANDMOTHERS } from './10-grandmothers';
import { KITCHEN } from './11-kitchen';
import { BATHROOM } from './12-bathroom';
import { DEN } from './13-den';
import { LAUNDRY } from './14-laundry';
import { NURSERY } from './15-nursery';
import { GUEST_ROOM } from './16-guest-room';
import { GARAGE } from './17-garage';
import { ATTIC } from './18-attic';
import { DRAWING } from './19-drawing';
import { REMEMBERED } from './20-remembered';

/** Floors 9 to 20: places somebody lived in, remembered slightly wrong. */
export const DWELLING_FLOORS: Floors = {
  9: HALLWAY,
  10: GRANDMOTHERS,
  11: KITCHEN,
  12: BATHROOM,
  13: DEN,
  14: LAUNDRY,
  15: NURSERY,
  16: GUEST_ROOM,
  17: GARAGE,
  18: ATTIC,
  19: DRAWING,
  20: REMEMBERED,
};
