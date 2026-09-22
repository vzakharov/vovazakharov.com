import { routing } from '@/shared/i18n';
import type { OneOfEach } from '@/shared/lib/collections';
import { OG_CARD_SUFFIX } from '@/shared/seo';

import { CV_VARIANTS, type CvVariant } from './cv-variants';

/** The one place the CV's URL shape is decided. */
const CV_BASE = '/cv';

/** What each segment of a CV address may be, in the order they are spelled. */
export const CV_ADDRESS_SEGMENTS = [CV_VARIANTS, routing.locales] as const;

/**
 * Every address the CV answers. A segment left off means "unspecified", so the
 * shorter forms are aliases the full one is canonical for, not pages of their own.
 */
export type CvAddress = OneOfEach<typeof CV_ADDRESS_SEGMENTS>;

export function cvPath(...address: CvAddress): string {
  return [CV_BASE, ...address].join('/');
}

/**
 * A framing's social card sits at its route plus an extension, as a document's
 * files do — safe because a route reserves only `.html` and `.txt`.
 */
export function cvCardPath(variant: CvVariant): string {
  return `${cvPath(variant)}${OG_CARD_SUFFIX}`;
}
