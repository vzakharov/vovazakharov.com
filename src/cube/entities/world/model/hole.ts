import { z } from 'zod';

import { isWorldNumber } from '@/dice/shared/roll';

import type { InRoom } from './pose';
import { type Room, roomKey } from './room';
import { seals } from './seals';

const worldSchema = z.object({
  seed: z.string().refine(isWorldNumber, 'Not a world number'),
  holes: z.array(z.string().regex(/^[\da-f]{64}$/)).readonly(),
});

/** `holes[n - 1]` commits to the hole of floor `n`; the floors number one more. */
export type World = z.infer<typeof worldSchema>;

/** Parses a world from untyped JSON; throws on any other shape. */
export const parseWorld = (json: unknown): World => worldSchema.parse(json);

export type Quarter = { qx: 0 | 1; qy: 0 | 1 };

/** The middle of a hole in `quarter`, in its room's frame. */
export const holeMiddle = ({ qx, qy }: Quarter): InRoom => ({
  u: (qx + 0.5) / 2,
  v: (qy + 0.5) / 2,
});

const QUARTERS: readonly Quarter[] = [
  { qx: 0, qy: 0 },
  { qx: 1, qy: 0 },
  { qx: 0, qy: 1 },
  { qx: 1, qy: 1 },
];

/**
 * The quarter of room `(x, y)` on floor `n` that holds floor `n`'s hole, or
 * null when the room has none (always on the last floor, which has no hole).
 */
export async function holeQuarter(
  world: World,
  n: number,
  x: bigint,
  y: bigint,
): Promise<Quarter | null> {
  const committed = world.holes[n - 1];
  if (committed === undefined) return null;
  const { hole } = seals(world.seed);
  const hashes = await Promise.all(
    QUARTERS.map(async ({ qx, qy }) =>
      hole.at({ n, x: 2n * x + BigInt(qx), y: 2n * y + BigInt(qy) }),
    ),
  );
  return QUARTERS[hashes.indexOf(committed)] ?? null;
}

/** A hole lookup over the rooms it was resolved for; any other room throws. */
export type HoleOf = (room: Room) => Quarter | null;

/** How many floors `world` has: one more than it has holes. */
export const floorsOf = (world: World): number => world.holes.length + 1;

/** Resolves the hole quarter of every room in `rooms` at once. */
export async function holesOf(
  world: World,
  rooms: readonly Room[],
): Promise<HoleOf> {
  const quarters = new Map(
    await Promise.all(
      rooms.map(
        async (room) =>
          [
            roomKey(room),
            await holeQuarter(world, room.n, room.x, room.y),
          ] as const,
      ),
    ),
  );
  return (room) => {
    const quarter = quarters.get(roomKey(room));
    if (quarter === undefined) {
      throw new Error(`No hole resolved for room ${roomKey(room)}`);
    }
    return quarter;
  };
}
