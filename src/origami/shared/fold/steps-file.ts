/**
 * A `*.steps.json` file: a design's steps as data, for the steps a sequence
 * folds without a design's code around them.
 */
import { z } from 'zod';

import type { Step } from './fold.ts';
import { FOLD_DIRECTIONS } from './state.ts';

const point = z.tuple([z.number(), z.number()]);

const SelectionSchema = z.union([
  z.enum(['all', 'flap']),
  z.object({ tag: z.string() }).strict(),
  z.object({ at: point, top: z.number() }).strict(),
  z.object({ at: point, bottom: z.number() }).strict(),
  z.object({ at: point, layers: z.tuple([z.number(), z.number()]) }).strict(),
  z.object({ at: point, all: z.literal(true) }).strict(),
]);

/** Strict, so a file growing a field this does not know fails here rather
 * than being dropped. */
const StepSchema: z.ZodType<Step> = z
  .object({
    line: z.object({ p: point, q: point }).strict(),
    moving: point,
    select: SelectionSchema.optional(),
    direction: z.enum([...FOLD_DIRECTIONS, 'tuck']).optional(),
    into: z.object({ at: point, below: z.number() }).strict().optional(),
    angle: z.number().optional(),
    tag: z.string().optional(),
    lower: z.string().optional(),
    hold: z.number().optional(),
  })
  .strict();

export const StepsSchema = z.array(StepSchema);
