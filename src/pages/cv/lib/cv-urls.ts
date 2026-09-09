import type { Locale } from '@/shared/i18n';

import type { CvVariant } from './cv-variants';

/** The one place the CV's URL shape is decided. */
const CV_BASE = '/cv';

/**
 * Every address the CV answers, most specific last. A segment left off means
 * "unspecified", so the shorter forms are aliases of the full one rather than
 * pages of their own — which is why a locale never appears without a variant.
 */
export type CvAddress = [] | [CvVariant] | [CvVariant, Locale];

export function cvPath(...address: CvAddress): string {
  return [CV_BASE, ...address].join('/');
}
