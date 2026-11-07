import { z } from 'zod';

import type { Coast } from '@/island/shared/globe';

import traced from './coast.json';

const Point = z.tuple([z.number(), z.number()]);

const CoastSchema = z.object({
  kmPerPixel: z.number().positive(),
  rings: z.array(z.array(Point).min(3)).min(1),
}) satisfies z.ZodType<Coast>;

/**
 * The coastline Zoltan and Syama drew, traced by `pnpm trace:island` from the
 * board's map: kilometres on the island plane, the main body first.
 */
export const coast: Coast = CoastSchema.parse(traced);
