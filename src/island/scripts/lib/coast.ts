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
