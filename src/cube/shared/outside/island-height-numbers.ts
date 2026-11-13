import { pathHash, roll, rollWith } from '@/dice/shared/roll';

import { f32, wgsl } from '../shader/wgsl';

/** The world the island's rolls are drawn from: the same island for everyone. */
const ISLAND_WORLD = '0';

/** How many low dunes the interior carries besides the crest's own. */
const DUNE_COUNT = 9;

const TURN = 2 * Math.PI;

const duneRoll = roll.struct({
  /** Where it sits: a fraction of the way from the crest to the shore. */
  reach: roll.uniform(0.18, 0.62),
  bearing: roll.uniform(0, TURN),
  height: roll.uniform(-0.1, 0.3),
  /** Half-widths in metres, along the wind and across it. */
  along: roll.uniform(4, 9),
  across: roll.uniform(2.5, 5),
});

const hash = pathHash(ISLAND_WORLD);

/** The island's rolls: its outline's phases and its interior's dunes. */
export const ISLAND_ROLLED = rollWith(
  roll.struct({
    /** The phases of the outline's three harmonics. */
    lobes: roll.uniform(0, TURN),
    bays: roll.uniform(0, TURN),
    cusps: roll.uniform(0, TURN),
    dunes: roll.struct(
      Object.fromEntries(
        Array.from({ length: DUNE_COUNT }, (_, index) => [
          `${index}`,
          duneRoll,
        ]),
      ),
    ),
  }),
  (path) => hash(`island/${path}`),
);

/**
 * The shape's numbers, in metres unless a ratio. The crest is the world's
 * ground origin: the cube hangs over `(0, 0)`.
 */
export const ISLAND = {
  /** The shore's distance from the crest to the west, east, north and south. */
  west: 66,
  east: 23,
  north: 28,
  south: 22,
  /** Metres over which one side's reach gives way to the opposite one's. */
  turn: 8,
  /** The outline's harmonics: three lobes, five bays, and the beach cusps. */
  lobes: 0.05,
  bays: 0.03,
  cusps: 0.012,
  cuspCount: 27,
  /** Inland metres per unit of the outline's level, at the shore's sides. */
  reach: 24,
  /** The beach face's rise per metre inland, and how far the south-west eases it. */
  slope: 0.11,
  gentle: 0.6,
  gentleAt: [-28, 24],
  gentleOver: 22,
  /** Where the beach face levels off into the backshore, and the berm's lip on it. */
  berm: 0.9,
  lip: 0.09,
  /** The terrace the face levels off into under water. */
  terrace: 1.3,
  /** The interior's rise behind the backshore. */
  inland: 0.45,
  /** How deep the bed ends up far out, and the metres over which it gets there. */
  deep: 11,
  deepOver: 70,
  /** The crest's height under the cube, and its own dune's half-width. */
  crest: 1.6,
  crestOver: 7,
} as const;

/**
 * `ISLAND`'s numbers as WGSL constants, the gentle point as two, with the
 * rolled phases of the outline's harmonics.
 */
export const ISLAND_HEIGHT_NUMBERS = wgsl(
  'outside/island-height-numbers',
  /* wgsl */ `
const ISLAND_WEST = ${f32(ISLAND.west)};
const ISLAND_EAST = ${f32(ISLAND.east)};
const ISLAND_NORTH = ${f32(ISLAND.north)};
const ISLAND_SOUTH = ${f32(ISLAND.south)};
const ISLAND_TURN = ${f32(ISLAND.turn)};
const ISLAND_LOBES = ${f32(ISLAND.lobes)};
const ISLAND_BAYS = ${f32(ISLAND.bays)};
const ISLAND_CUSPS = ${f32(ISLAND.cusps)};
const ISLAND_CUSP_COUNT = ${f32(ISLAND.cuspCount)};
const ISLAND_LOBES_START = ${f32(ISLAND_ROLLED.lobes)};
const ISLAND_BAYS_START = ${f32(ISLAND_ROLLED.bays)};
const ISLAND_CUSPS_START = ${f32(ISLAND_ROLLED.cusps)};
const ISLAND_REACH = ${f32(ISLAND.reach)};
const ISLAND_SLOPE = ${f32(ISLAND.slope)};
const ISLAND_GENTLE = ${f32(ISLAND.gentle)};
const ISLAND_GENTLE_X = ${f32(ISLAND.gentleAt[0])};
const ISLAND_GENTLE_Z = ${f32(ISLAND.gentleAt[1])};
const ISLAND_GENTLE_OVER = ${f32(ISLAND.gentleOver)};
const ISLAND_BERM = ${f32(ISLAND.berm)};
const ISLAND_LIP = ${f32(ISLAND.lip)};
const ISLAND_TERRACE = ${f32(ISLAND.terrace)};
const ISLAND_INLAND = ${f32(ISLAND.inland)};
const ISLAND_DEEP = ${f32(ISLAND.deep)};
const ISLAND_DEEP_OVER = ${f32(ISLAND.deepOver)};
const ISLAND_CREST_OVER = ${f32(ISLAND.crestOver)};
`,
);
