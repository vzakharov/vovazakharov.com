import 'server-only';

import { localeTailAddresses, routing } from '@/shared/i18n';
import { oneOfEach } from '@/shared/lib/collections';

import { CV_ADDRESS_SEGMENTS, CV_SUBPAGES, type CvAddress } from './cv-urls';
import { CV_VARIANTS, DEFAULT_CV_VARIANT } from './cv-variants';

/** The catch-all's segments as a route hands them over, before the parse narrows them. */
export type WithOptionalCvSegments = { variantAndLocale?: string[] };

/**
 * A parse rather than a cast: a segment neither list covers fails `next build`,
 * which under `output: 'export'` is the only thing that ever runs this — nothing
 * on the CDN re-validates a segment `generateStaticParams` already enumerated,
 * which is what `server-only` above keeps true.
 */
export function parseCvSegments({
  variantAndLocale = [],
}: WithOptionalCvSegments): CvAddress {
  return oneOfEach(CV_ADDRESS_SEGMENTS, variantAndLocale);
}

/**
 * Which page an address resolves to, each segment it omits falling back — the
 * subpage to none, which is the sheet itself.
 */
export function cvAddressDefaults(address: CvAddress) {
  const [
    variant = DEFAULT_CV_VARIANT,
    locale = routing.defaultLocale,
    subpage,
  ] = address;

  return { variant, locale, subpage };
}

/**
 * Every address the CV answers, as the catch-all spells them. A subpage is
 * answered at its full address only: it has no shorter alias to defer to it.
 */
export function cvSegmentParams(): WithOptionalCvSegments[] {
  const addresses: CvAddress[] = [
    [],
    ...CV_VARIANTS.flatMap((variant) => localeTailAddresses(variant)),
    ...CV_VARIANTS.flatMap((variant) =>
      routing.locales.flatMap((locale) =>
        CV_SUBPAGES.map<CvAddress>((subpage) => [variant, locale, subpage]),
      ),
    ),
  ];

  return addresses.map((variantAndLocale) => ({ variantAndLocale }));
}
