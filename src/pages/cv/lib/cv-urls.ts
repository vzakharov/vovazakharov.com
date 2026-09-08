import type { Locale } from '@/shared/i18n';

import { CV_VARIANTS, type CvVariant } from './cv-variants';

/** The one place the CV's URL shape is decided. */
const CV_BASE = '/cv';

/** Locale-less, as next-intl's navigation and `usePathname` speak it. */
export function cvPath(variant?: CvVariant): string {
  return variant === undefined ? CV_BASE : `${CV_BASE}/${variant}`;
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
