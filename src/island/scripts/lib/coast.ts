import { z } from 'zod';

import type { Coast } from '@/island/shared/globe';

import traced from './coast.json';

const Point = z.tuple([z.number(), z.number()]);

const CoastSchema = z.object({
  kmPerPixel: z.number().positive(),
  rings: z.array(z.array(Point).min(3)).min(1),
}) satisfies z.ZodType<Coast>;

/**
 * The coastline Zoltan and Syama drew, traced from the board's map (the tracer
 * is retired: `src/island/entities/coast.retired.md`): kilometres on the
 * island plane of `azimuthal.ts`, the main body first, read even-odd — land
 * counter-clockwise, a drawn lake a clockwise ring inside it.
 */
export const coast: Coast = CoastSchema.parse(traced);

/** A ring in kilometres, its first point's place for naming it. */
export type DrawnRing = { x: number; y: number; ring: Array<[number, number]> };

/** The shoelace area: positive when the ring turns from +x towards +y. */
function signedArea(ring: Array<[number, number]>): number {
  let twice = 0;
  for (const [i, [x0, y0]] of ring.entries()) {
    const [x1, y1] = ring[(i + 1) % ring.length] ?? [x0, y0];
    twice += x0 * y1 - x1 * y0;
  }
  return twice / 2;
}

/** The drawn lakes: the clockwise rings. */
export const drawnLakes: DrawnRing[] = coast.rings
  .filter((ring) => signedArea(ring) < 0)
  .map((ring) => {
    const [x = 0, y = 0] = ring[0] ?? [];
    return { x, y, ring };
  });
