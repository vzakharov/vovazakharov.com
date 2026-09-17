import 'server-only';

import { z } from 'zod';

import { routing } from '@/shared/i18n';
import {
  localeTailAddresses,
  localeTailSchema,
} from '@/shared/i18n/index.server-only';

import type { CvAddress } from './cv-urls';
import { CV_VARIANTS, DEFAULT_CV_VARIANT } from './cv-variants';

/** The catch-all's segments as a route hands them over, before the schema narrows them. */
export type WithOptionalCvSegments = { variantAndLocale?: string[] };

export const cvSegmentsSchema = z.object({
  variantAndLocale: localeTailSchema(z.enum(CV_VARIANTS)).default([]),
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
    ...CV_VARIANTS.flatMap((variant) => localeTailAddresses(variant)),
  ];

  return addresses.map((variantAndLocale) => ({ variantAndLocale }));
}
