/**
 * The flowers a bee plants: landing at a flower other than the one its pollen
 * came from pollinates it, and as it leaves that flower a new one is planted
 * in a free ring slot round it, wherever the scene offers the room. Nothing
 * here knows where a slot stands: the scene fixes each on the ground round
 * its parent, and says which flowers have room, and in which.
 */
import {
  nextSeed,
  pick,
  saltedStream,
  type Seeded,
} from '@/mushrooms/shared/lib/random';
import {
  type BeeSown,
  plantedId,
  type Plot,
  slotTaken,
  type Sown,
} from '@/mushrooms/entities/flower/index.node-safe';
import {
  type Carrying,
  type Flight,
  landedAt,
} from '@/mushrooms/entities/insect/index.node-safe';

/** Keeps a planting's stream apart from the legs and genes grown off the same seed. */
const SOW_SALT = 0x2f_6a_c3_17;
/** Keeps the pick of a planting's slot apart from its flower's seed. */
const SLOT_SALT = 0x5b_e1_09_d4;

/**
 * The flower planted as `bee` leaves its current leg at `now`: beside the
 * flower that leg took it to, when it landed there and pollinated it and
 * `plot` offers a slot there no planted flower already takes — any such
 * slot as likely as the next, since a fixed first choice sends every
 * planting the same way off its parent and the bees sow a line. Slot and
 * seed come off the bee's own stream, so a replay plants the same flowers.
 */
export function sown(
  { seed, leg, legs, pollen }: Seeded & Flight & Carrying,
  now: number,
  { room }: Plot,
  planted: readonly Sown[],
): BeeSown | undefined {
  const parent = landedAt(leg, now);
  if (!pollen.pollinates || parent === undefined) return undefined;
  const [first, ...rest] = room.filter(
    ({ flower, ring }) =>
      flower === parent && !slotTaken(planted, parent, ring),
  );
  if (first === undefined) return undefined;
  const { ring } = pick(saltedStream(seed, SLOT_SALT, legs), [first, ...rest]);
  return {
    id: plantedId(planted),
    seed: nextSeed(saltedStream(seed, SOW_SALT, legs)),
    parent,
    ring,
  };
}
