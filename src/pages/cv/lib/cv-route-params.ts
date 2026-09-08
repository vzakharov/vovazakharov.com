import { z } from 'zod';

import { routing } from '@/shared/i18n';

import { CV_VARIANTS, DEFAULT_CV_VARIANT } from './cv-variants';

/** The variant as an optional catch-all carries it, before the schema narrows it. */
export type WithOptionalVariantSegments = { variant?: string[] };

/**
 * One route file answers every CV address, so the variant arrives absent at the
 * bare `/cv` and as a single segment at each variant's own URL.
 */
const variantSegments = z
  .array(z.enum(CV_VARIANTS))
  .max(1)
  .optional()
  .transform((segments) => segments?.[0] ?? DEFAULT_CV_VARIANT);

/**
 * A parse rather than a cast: a segment neither list covers fails `next build`,
 * which under `output: 'export'` is the only thing that ever runs these.
 *
 * Keep them out of `shared/i18n`, whose barrel every client component reaches
 * for `Link` and `usePathname` — a zod import there puts ~90 kB gzipped of
 * parser in the browser bundle to validate a build-time segment.
 */
export const cvVariantParamsSchema = z.object({ variant: variantSegments });

export const cvParamsSchema = cvVariantParamsSchema.extend({
  locale: z.enum(routing.locales),
});

/** Every address the CV answers, as an optional catch-all spells them. */
export function cvVariantParams(): WithOptionalVariantSegments[] {
  return [
    { variant: [] },
    ...CV_VARIANTS.map((variant) => ({ variant: [variant] })),
  ];
}
