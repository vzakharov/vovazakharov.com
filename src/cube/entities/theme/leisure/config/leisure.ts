import type { Floors } from '../../kit';
import { INDOOR_POOL } from './21-indoor-pool';
import { ARCADE } from './22-arcade';
import { GYMNASIUM } from './23-gymnasium';
import { MALL_ATRIUM } from './24-mall-atrium';
import { CINEMA_CORRIDOR } from './25-cinema-corridor';
import { SUPERMARKET } from './26-supermarket';
import { AIRPORT_GATE } from './27-airport-gate';
import { UNDERPASS } from './28-underpass';
import { PAINTED_SKY } from './29-painted-sky';
import { ICE_RINK } from './30-ice-rink';
import { METRO_PLATFORM } from './31-metro-platform';

/** Floors 21 to 35: places to wait and to play, with nobody waiting or playing. */
export const LEISURE_FLOORS: Floors = {
  21: INDOOR_POOL,
  22: ARCADE,
  23: GYMNASIUM,
  24: MALL_ATRIUM,
  25: CINEMA_CORRIDOR,
  26: SUPERMARKET,
  27: AIRPORT_GATE,
  28: UNDERPASS,
  29: PAINTED_SKY,
  30: ICE_RINK,
  31: METRO_PLATFORM,
};
