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

/**
 * The building as one life in six chapters, each eleven floors deep. Floor `n`
 * stands in chapter `(n − 1) mod 6`, at its `⌊(n − 1) / 6⌋`-th theme, so the
 * chapters interleave floor by floor, and a portal's jump of 7 — 1 mod 6 —
 * always lands in the next chapter.
 */
const ENSEMBLES: ReadonlyArray<readonly FloorTheme[]> = [
  /** Home life: a home that came from nowhere, things carried out, traces left. */
  [
    RECEPTION,
    GARAGE,
    ATTIC,
    LAUNDRY,
    SUPERMARKET,
    KITCHEN,
    GUEST_ROOM,
    BATHROOM,
    DEN,
    COLD_ROOM,
    TEST_CARD,
  ],
  /** Work: where he went every day, and the worlds he built there. */
  [
    OPEN_PLAN,
    STAIRWELL,
    PARKING_LEVEL,
    METRO_PLATFORM,
    CONFERENCE_HOTEL,
    AIRPORT_GATE,
    SERVER_FLOOR,
    GREYBOX,
    TEXTURE_TEST,
    NORMAL_MAP,
    POINT_CLOUD,
  ],
  /** Childhood: cloudless, and sometimes cloudy. */
  [
    SCHOOL_CORRIDOR,
    PAINTED_SKY,
    DRAWING,
    NURSERY,
    UNDERPASS,
    BALL_PIT,
    GYMNASIUM,
    MALL_ATRIUM,
    ICE_RINK,
    GRANDMOTHER,
    FIGURE,
  ],
  /** Hobbies: what he loved for himself, when work and home let go. */
  [
    INDOOR_POOL,
    ARCADE,
    CINEMA_CORRIDOR,
    GLOW_GOLF,
    AQUARIUM_TUNNEL,
    DARKROOM,
    CRYSTAL,
    CIRCUIT_BOARD,
    CUT_PAPER,
    CASINO,
    SIXTEEN_COLOUR,
  ],
  /** Science: experiments, his or on him. */
  [
    CLEAN_ROOM,
    WAFER,
    WET_LAB,
    AGAR,
    GEL,
    FLUORESCENCE,
    MICROGRAPH,
    MEMBRANE,
    STAINED_SECTION,
    TUNNELLING_SCAN,
    BUBBLE_CHAMBER,
  ],
  /**
   * Madness: the world stops holding its shape — memory first, then the
   * surfaces, then the signal; at the very end, endless doors.
   */
  [
    SERVICE_CORRIDOR,
    REMEMBERED,
    INCUBATOR,
    MISSING_TEXTURE,
    WIREFRAME,
    DEPTH_BUFFER,
    HOME,
    ONE_BIT,
    STATIC,
    CLEAR_COLOUR,
    HALLWAY,
  ],
];

const DESIGNED: Floors = Object.fromEntries(
  ENSEMBLES.flatMap((themes, chapter) =>
    themes.map((theme, depth) => [
      1 + chapter + ENSEMBLES.length * depth,
      theme,
    ]),
  ),
);

/** Floor `n`'s theme; throws on a floor the building does not have. */
export function themeOf(n: number): FloorTheme {
  const theme = DESIGNED[n];
  if (theme === undefined)
    throw new RangeError(`floor ${String(n)} has no theme`);
  return theme;
}
