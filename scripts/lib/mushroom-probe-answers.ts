/**
 * The schemas `__probe`'s answers are parsed with, derived from the model's own
 * arrays, so the caller runs under tsx, which resolves the model's imports.
 */

import { z } from 'zod';

import {
  type Perch as ModelPerch,
  type PerchKind,
  SIDES,
} from '../../src/pages/mushrooms/model/flight.ts';
import type { Camera as ModelCamera } from '../../src/pages/mushrooms/model/ground.ts';
import { INSECT_KINDS } from '../../src/pages/mushrooms/model/insect-genes.ts';
import { MUSHROOM_SPECIES } from '../../src/pages/mushrooms/model/mushroom-genes.ts';
import { SHELTER_SEATS } from '../../src/pages/mushrooms/model/shelter.ts';

export const State = z.object({
  picking: z.boolean(),
  furnishing: z.boolean(),
  /** One per mushroom, in the meadow's order. */
  houses: z.array(
    z.object({ windows: z.array(z.string()), door: z.boolean() }),
  ),
  selected: z.string().nullable(),
  mushrooms: z.array(z.string()),
  /** Each mushroom's species, in the meadow's order. */
  species: z.array(z.enum(MUSHROOM_SPECIES)),
  mapOpen: z.boolean(),
  clock: z.number(),
});
export const Point = z.object({ x: z.number(), y: z.number() });
/** A flower by its id, at a point. */
export const FlowerAt = Point.extend({ id: z.string() });
/** `__probe.map()`: as last drawn, the map's centre (plane, clump sizes), middle and scale (CSS px, a clump size), and where its flowers, the child and his heading show (CSS px). */
export const MapShown = z.object({
  open: z.boolean(),
  drawn: z
    .object({
      centre: Point,
      middle: Point,
      scale: z.number(),
      things: z.number(),
      flowers: z.array(FlowerAt),
      child: Point,
      ahead: Point,
    })
    .nullable(),
});
/** `__probe.scene.layout.camera`, parsing to the model's camera. */
export const Camera = z.object({
  width: z.number(),
  height: z.number(),
  groundTop: z.number(),
  ground: z.number(),
  world: z.number(),
  midline: z.number(),
  unit: z.number(),
}) satisfies z.ZodType<ModelCamera>;
/** A box on screen, in CSS px. */
export const Box = Point.extend({ width: z.number(), height: z.number() });
/** One schema per kind of perch, each parsing to the model's perch of that kind. */
const PERCHES = {
  flower: z.object({ kind: z.literal('flower'), id: z.string() }),
  cap: z.object({ kind: z.literal('cap'), id: z.string() }),
  air: z.object({ kind: z.literal('air'), id: z.string() }),
  shelter: z.object({
    kind: z.literal('shelter'),
    id: z.string(),
    seat: z.literal(SHELTER_SEATS),
  }),
  away: z.object({ kind: z.literal('away'), side: z.enum(SIDES) }),
} satisfies {
  [Kind in PerchKind]: z.ZodType<Extract<ModelPerch, { kind: Kind }>>;
};
const Perch = z.discriminatedUnion('kind', [
  PERCHES.flower,
  PERCHES.cap,
  PERCHES.air,
  PERCHES.shelter,
  PERCHES.away,
]);
export const Insects = z.array(
  z.object({
    id: z.string(),
    kind: z.enum(INSECT_KINDS),
    legs: z.number(),
    from: Perch,
    to: Perch,
    departs: z.number(),
    arrives: z.number(),
    leaves: z.number(),
    /** Whether the crop shows it, where a finger can reach it. */
    inSight: z.boolean(),
  }),
);
export const ShownInsect = Point.extend({
  at: Point,
  end: Point.nullable(),
  /** How far its open wings span as drawn this frame, in CSS px. */
  span: z.number(),
  tappedAt: z.number().nullable(),
}).nullable();
/** `__probe.drawnAt()` and `__probe.boundAt()`: a plane point per insect, in the clump's size, by id. */
export const InsectPoints = z.record(z.string(), Point);
export const Controls = z.object({
  plus: Point,
  minus: Point,
  map: Point,
  picker: z.array(Point),
  house: Point,
  housePicker: z.array(Point),
  releases: z.record(z.enum(INSECT_KINDS), Point),
});
/** `__probe.eye()`: the eye on the plane, in the clump's size, its heading in radians, and the screen in CSS px. */
export const Eye = z.object({
  x: z.number(),
  y: z.number(),
  heading: z.number(),
  walked: z.number(),
  /** The camera's scroll down the screen, in CSS px: the walk's bob, never above 0. */
  bob: z.number(),
  /** Footsteps sounded since the probe went in. */
  steps: z.number(),
  width: z.number(),
  height: z.number(),
  unit: z.number(),
});
/** `__probe.sun()`: the sun's middle across the screen, `null` while the view leaves it out. */
export const Sun = z.number().nullable();
/** `__probe.hitches()`: how long each lawn-tending call and each perch re-sight since the last call took, in ms. */
export const Hitches = z.object({
  tend: z.array(z.number()),
  see: z.array(z.number()),
});
/** `__probe.tendFrames()`: each frame since the last call whose update ran a lawn-tending call, its update ms and the tending calls' share. */
export const TendFrames = z.array(
  z.object({ ms: z.number(), tend: z.number() }),
);
/** `__probe.windows(id)`, its reaches in CSS px. */
export const Windows = z.object({
  reaches: z.array(Point.extend({ r: z.number() })),
  capLeft: z.number(),
});
const Maybe = z.number().nullable();
/** `__probe.worm(id)`, its girth in CSS px as painted at the last frame. */
export const Worm = z.object({
  tappedAt: Maybe,
  from: Maybe,
  to: Maybe,
  trips: z.number(),
  phase: z.enum(['out', 'crawl', 'in', 'peek']).nullable(),
  head: Point.nullable(),
  girth: Maybe,
  /** How open the tapped window and the one it crawls to are, 0 shut to 1. */
  fromOpen: z.number(),
  toOpen: z.number(),
});
export const Mouse = z.object({
  tappedAt: z.number().nullable(),
  out: z.number(),
  /** In CSS px, as painted at the last frame: 0 with no door. */
  head: z.number(),
  door: z.number(),
});
export const Runs = z.array(
  Point.extend({
    from: z.string(),
    to: z.string(),
    elapsed: z.number(),
    shown: z.boolean(),
    depth: z.number(),
    width: z.number().nullable(),
  }),
);
export const Mice = z.record(z.string(), z.number());
export const Top = z.string().nullable();
export const Pose = z
  .object({ mushroom: z.number(), house: z.number(), shown: z.boolean() })
  .nullable();
export const Flower = FlowerAt.nullable();
export const Shower = z.object({
  span: z.object({ startedAt: z.number(), stopsAt: z.number() }).nullable(),
  raining: z.boolean(),
  wetness: z.number(),
  rainbow: z.number(),
  drops: z.number(),
  closing: z.number(),
  tapped: z.number().nullable(),
  /** Fliers on the meadow, and those seated under a cap. */
  fliers: z.number(),
  sheltering: z.number(),
  /** Seats under the caps in reach, two a cap wide enough. */
  shelters: z.number(),
});
export const Clouds = z.array(Point.nullable());
export const Sprouts = z.object({
  /** Whether the flower picker is open. */
  planting: z.boolean(),
  spores: z.array(
    z.object({
      id: z.string(),
      parent: z.string(),
      shown: z.boolean(),
      at: Point.nullable(),
      apart: z.number().nullable(),
    }),
  ),
  sprouts: z.array(
    z.object({
      id: z.string(),
      parent: z.string(),
      ofParent: z.boolean(),
      at: z.number(),
      shown: z.boolean(),
      scale: z.number(),
      apart: z.number().nullable(),
    }),
  ),
});
