import 'server-only';

import { z } from 'zod';

import { routing } from '@/shared/i18n';
import { localeSchema } from '@/shared/i18n/index.server-only';

import type { CvAddress } from './cv-urls';
import { CV_VARIANTS, DEFAULT_CV_VARIANT } from './cv-variants';

/** The catch-all's segments as a route hands them over, before the schema narrows them. */
export type WithOptionalCvSegments = { variantAndLocale?: string[] };

const variantSegment = z.enum(CV_VARIANTS);

/**
 * A parse rather than a cast: a segment neither list covers fails `next build`,
 * which under `output: 'export'` is the only thing that ever runs this — hence
 * `server-only` above, since zod is ~90 kB gzipped and nothing on the CDN
 * re-validates a segment `generateStaticParams` already enumerated.
 */
export const cvSegmentsSchema = z.object({
  variantAndLocale: z
    .union([
      z.tuple([]),
      z.tuple([variantSegment]),
      z.tuple([variantSegment, localeSchema]),
    ])
    .default([]),
});

/** Which page an address resolves to, each segment it omits falling back. */
export function cvAddressDefaults(address: CvAddress) {
  const [variant = DEFAULT_CV_VARIANT, locale = routing.defaultLocale] =
    address;

  return { variant, locale };
}

/** Every address the CV answers, as the catch-all spells them. */
export function cvSegmentParams(): WithOptionalCvSegments[] {
  const addresses: CvAddress[] = [
    [],
    ...CV_VARIANTS.flatMap<CvAddress>((variant) => [
      [variant],
      ...routing.locales.map<CvAddress>((locale) => [variant, locale]),
    ]),
  ];

  return addresses.map((variantAndLocale) => ({ variantAndLocale }));
}
