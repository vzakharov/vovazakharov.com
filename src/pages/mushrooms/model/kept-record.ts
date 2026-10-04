/**
 * What a reload brings back of a visit: one record per meadow, its meadow
 * settled at rest (`keeping.ts`), every moment in it on the next load's
 * clock.
 */

import { z } from 'zod';

import { TOWARDS } from './dusk';
import { PERCH_KINDS, SIDES } from './flight';
import { type Meadow, PICKERS_SHUT } from './game';
import { WINDOW_KINDS } from './house';
import { INSECT_KINDS } from './insect-genes';
import { MUSHROOM_SPECIES } from './mushroom-genes';
import type { Seeded } from './random';
import { SHELTER_SEATS } from './shelter';
import { SPROUT_MS } from './sprouting';
import { GAITS } from './stride';
import type { WalkStart } from './walk';

/** The record's format: a record of any other is not read, and is never overwritten. */
export const KEPT_VERSION = 1;

/**
 * The moment every kept stamp is set to: longer before the load's start
 * than any span a rule measures from a stamp, so each reads it as long over.
 */
export const RESTED_AT = -SPROUT_MS;

/** What a meadow opens with in place of the selection, the pickers and the shower, which belong to the load that had them. */
export const UNKEPT = {
  ...PICKERS_SHUT,
  selected: undefined,
  rain: undefined,
} as const satisfies Partial<Meadow>;

/** A meadow as it is kept: all of it but `UNKEPT`. */
export type KeptMeadow = Omit<Meadow, keyof typeof UNKEPT>;

/** One kept meadow, the visit seed that grew its world, and where the child stood in it and how, as the walk reopens there. */
export type Kept = Seeded &
  WalkStart & {
    version: typeof KEPT_VERSION;
    meadow: KeptMeadow;
  };

const id = z.string();
const seed = z.number();
const point = { x: z.number(), y: z.number() };
/** A key the model always carries, its value possibly `undefined`: `.optional()` would type the key itself as optional. */
const orNone = <Schema extends z.ZodType>(schema: Schema) =>
  z.union([schema, z.undefined()]);

const mushroom = { id, seed, species: z.enum(MUSHROOM_SPECIES) };
const footed = { foot: z.object(point), lean: z.literal([-1, 1]) };
const sprout = { parent: id, at: z.number() };

const PerchKind = z.enum(PERCH_KINDS);
const PerchSchema = z.discriminatedUnion('kind', [
  z.object({ kind: PerchKind.extract(['flower', 'cap', 'air']), id }),
  z.object({
    kind: PerchKind.extract(['shelter']),
    id,
    seat: z.literal(SHELTER_SEATS),
  }),
  z.object({ kind: PerchKind.extract(['away']), side: z.enum(SIDES) }),
]);

const LegSchema = z.object({
  departs: z.number(),
  arrives: z.number(),
  dash: z.object({ time: z.number(), way: z.number() }).optional(),
  hops: z.object({ every: z.number(), range: z.number() }).optional(),
  pivots: z.number().optional(),
  from: PerchSchema,
  to: PerchSchema,
  leaves: z.number(),
  out: z.number().optional(),
});

const InsectKind = z.enum(INSECT_KINDS);
const flier = {
  id,
  seed,
  leg: LegSchema,
  legs: z.number(),
  shied: z.number().optional(),
};
const FlierSchema = z.union([
  z.object({ ...flier, kind: InsectKind.exclude(['bee']) }),
  z.object({
    ...flier,
    kind: InsectKind.extract(['bee']),
    pollen: z.object({
      from: orNone(id),
      specks: z.number(),
      pollinates: z.boolean(),
    }),
  }),
]);

const SownSchema = z.union([
  z.object({ id, seed, ring: z.number(), parent: id }),
  z.object({ id, seed, foot: z.object({ ...point, size: z.number() }) }),
]);

const KeptMeadowSchema = z.object({
  mushrooms: z.array(
    z.object({
      ...mushroom,
      ...footed,
      house: z.object({
        windows: z.array(z.enum(WINDOW_KINDS)),
        door: z.boolean(),
      }),
      sprout: z.object(sprout).optional(),
    }),
  ),
  spores: z.array(z.object({ ...mushroom, ...footed, ...sprout })),
  scattered: z.number(),
  insects: z.array(FlierSchema),
  planted: z.array(SownSchema),
  pulled: z.array(id),
  grown: z.number(),
  released: z.number(),
  dusk: z.object({
    startedAt: z.number(),
    from: z.number(),
    toward: z.enum(TOWARDS),
  }),
  nightRuns: z.object({
    due: orNone(z.number()),
    made: z.number(),
    last: orNone(z.object({ at: z.number(), from: id, to: orNone(id) })),
  }),
});

/**
 * The record, checked against the model's own types: a field the model
 * changes and this does not fails the type check. Its shape is pinned by
 * `kept-record.schema.json`, so a change to it meets the question of
 * `KEPT_VERSION`.
 */
export const KeptSchema = z.object({
  version: z.literal(KEPT_VERSION),
  seed,
  eye: z.object({ ...point, heading: z.number() }),
  gait: z.enum(GAITS),
  meadow: KeptMeadowSchema,
}) satisfies z.ZodType<Kept>;

/** `raw` as a kept meadow, or `undefined` when it is of another version or is not one at all. */
export function readKept(raw: unknown): Kept | undefined {
  const read = KeptSchema.safeParse(raw);
  return read.success ? read.data : undefined;
}
