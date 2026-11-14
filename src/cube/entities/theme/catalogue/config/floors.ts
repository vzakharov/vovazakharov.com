import {
  ATTIC,
  BATHROOM,
  DEN,
  DRAWING,
  GARAGE,
  GRANDMOTHER,
  GUEST_ROOM,
  HALLWAY,
  KITCHEN,
  LAUNDRY,
  NURSERY,
  REMEMBERED,
} from '../../dwelling';
import {
  CLEAR_COLOUR,
  CUT_PAPER,
  DEPTH_BUFFER,
  GREYBOX,
  HOME,
  MISSING_TEXTURE,
  NORMAL_MAP,
  ONE_BIT,
  POINT_CLOUD,
  SIXTEEN_COLOUR,
  STATIC,
  TEST_CARD,
  TEXTURE_TEST,
  WIREFRAME,
} from '../../edge';
import type { Floors, FloorTheme } from '../../kit';
import {
  AGAR,
  BUBBLE_CHAMBER,
  CIRCUIT_BOARD,
  CLEAN_ROOM,
  COLD_ROOM,
  CRYSTAL,
  DARKROOM,
  FIGURE,
  FLUORESCENCE,
  GEL,
  INCUBATOR,
  MEMBRANE,
  MICROGRAPH,
  STAINED_SECTION,
  TUNNELLING_SCAN,
  WAFER,
  WET_LAB,
} from '../../laboratory';
import {
  AIRPORT_GATE,
  AQUARIUM_TUNNEL,
  ARCADE,
  BALL_PIT,
  CASINO,
  CINEMA_CORRIDOR,
  GLOW_GOLF,
  GYMNASIUM,
  ICE_RINK,
  INDOOR_POOL,
  MALL_ATRIUM,
  METRO_PLATFORM,
  PAINTED_SKY,
  SUPERMARKET,
  UNDERPASS,
} from '../../leisure';
import {
  CONFERENCE_HOTEL,
  OPEN_PLAN,
  PARKING_LEVEL,
  RECEPTION,
  SCHOOL_CORRIDOR,
  SERVER_FLOOR,
  SERVICE_CORRIDOR,
  STAIRWELL,
} from '../../workplace';

const BANDS: Floors = {
  /** Floors 1 to 8: places built for work and waiting, with nobody in them. */
  1: RECEPTION,
  2: OPEN_PLAN,
  3: SCHOOL_CORRIDOR,
  4: STAIRWELL,
  5: PARKING_LEVEL,
  6: SERVICE_CORRIDOR,
  7: SERVER_FLOOR,
  8: CONFERENCE_HOTEL,
  /** Floors 9 to 20: places somebody lived in, remembered slightly wrong. */
  9: HALLWAY,
  10: GRANDMOTHER,
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
  /** Floors 21 to 35: places to wait and to play, with nobody waiting or playing. */
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
  32: GLOW_GOLF,
  33: BALL_PIT,
  34: CASINO,
  35: AQUARIUM_TUNNEL,
  /** Floors 36 to 52: rooms for studying what is, by now, bigger than the viewer. */
  36: CLEAN_ROOM,
  37: WET_LAB,
  38: COLD_ROOM,
  39: DARKROOM,
  40: AGAR,
  41: MEMBRANE,
  42: STAINED_SECTION,
  43: CRYSTAL,
  44: CIRCUIT_BOARD,
  45: WAFER,
  46: MICROGRAPH,
  47: FLUORESCENCE,
  48: GEL,
  49: FIGURE,
  50: INCUBATOR,
  51: TUNNELLING_SCAN,
  52: BUBBLE_CHAMBER,
  /**
   * Floors 53 to 66: where there is less and less left to build a room from —
   * first the textures go, then the light, then the surfaces, then the signal.
   */
  53: GREYBOX,
  54: TEXTURE_TEST,
  55: MISSING_TEXTURE,
  56: NORMAL_MAP,
  57: CUT_PAPER,
  58: WIREFRAME,
  59: POINT_CLOUD,
  60: DEPTH_BUFFER,
  61: TEST_CARD,
  62: SIXTEEN_COLOUR,
  63: ONE_BIT,
  64: STATIC,
  65: CLEAR_COLOUR,
  66: HOME,
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

/** Floor `n`'s theme; throws on a floor the building does not have. */
export function themeOf(n: number): FloorTheme {
  const theme = DESIGNED[n];
  if (theme === undefined)
    throw new RangeError(`floor ${String(n)} has no theme`);
  return theme;
}
