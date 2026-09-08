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
 * Route params reach a page as bare strings, and these are the schemas that
 * narrow them — a parse rather than a cast, so a segment neither list covers
 * fails `next build`, the only thing that ever runs them under `output:
 * 'export'`.
 *
 * They sit in the CV slice, the one localized route, rather than in
 * `shared/i18n`: every client component reaches that segment's barrel for
 * `Link` and `usePathname`, and a zod import there puts ~90 kB gzipped of
 * parser in the browser bundle to validate a build-time segment.
 */
export const cvVariantParamsSchema = z.object({ variant: variantSegments });

export const cvParamsSchema = z.object({
  locale: z.enum(routing.locales),
  variant: variantSegments,
});

/** Every address the CV answers, as an optional catch-all spells them. */
export function cvVariantParams(): WithOptionalVariantSegments[] {
  return [
    { variant: [] },
    ...CV_VARIANTS.map((variant) => ({ variant: [variant] })),
  ];
}
