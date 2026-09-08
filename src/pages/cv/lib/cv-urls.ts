import type { Locale } from '@/shared/i18n';

import { CV_VARIANTS, type CvVariant, DEFAULT_CV_VARIANT } from './cv-variants';

/** The one place the CV's URL shape is decided. */
const CV_BASE = '/cv';

/** Locale-less, as next-intl's navigation and `usePathname` speak it. */
export function cvPath(variant?: CvVariant): string {
  return variant === undefined ? CV_BASE : `${CV_BASE}/${variant}`;
}

/** Where the variant switch points: the default variant lives at the bare route. */
export function cvVariantPath(variant: CvVariant): string {
  return cvPath(variant === DEFAULT_CV_VARIANT ? undefined : variant);
}

/** Locale-prefixed, as a metadata path or a sitemap entry must be. */
export function cvRoute(locale: Locale, variant?: CvVariant): string {
  return `/${locale}${cvPath(variant)}`;
}

export function isCvPath(pathname: string): boolean {
  return (
    pathname === cvPath() ||
    CV_VARIANTS.some((variant) => pathname === cvPath(variant))
  );
}
