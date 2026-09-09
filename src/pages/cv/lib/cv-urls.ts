import type { Locale } from '@/shared/i18n';

import type { CvVariant } from './cv-variants';

/** The one place the CV's URL shape is decided. */
const CV_BASE = '/cv';

/**
 * Every address the CV answers. A segment left off means "unspecified", so the
 * shorter forms are aliases the full one is canonical for, not pages of their own.
 */
export type CvAddress = [] | [CvVariant] | [CvVariant, Locale];

export function cvPath(...address: CvAddress): string {
  return [CV_BASE, ...address].join('/');
}
