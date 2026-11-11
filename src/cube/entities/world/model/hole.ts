import { z } from 'zod';

import { big } from './big';
import { commitment } from './commitment';

/** A world number: decimal digits, no leading zero (`dice`'s rule). */
const SEED = /^(?:0|[1-9]\d*)$/;

const worldSchema = z.object({
  seed: z.string().regex(SEED),
  holes: z.array(z.string().regex(/^[\da-f]{64}$/)).readonly(),
});

/** `holes[n - 1]` commits to the hole of floor `n`; the floors number one more. */
export type World = z.infer<typeof worldSchema>;

/** Parses a world from untyped JSON; throws on any other shape. */
export const parseWorld = (json: unknown): World => worldSchema.parse(json);

export type Quarter = { qx: 0 | 1; qy: 0 | 1 };

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
  const two = big(2);
  const hashes = await Promise.all(
    QUARTERS.map(async ({ qx, qy }) =>
      commitment(world.seed, n, x * two + big(qx), y * two + big(qy)),
    ),
  );
  return QUARTERS[hashes.indexOf(committed)] ?? null;
}
