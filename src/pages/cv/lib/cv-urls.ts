import { routing } from '@/shared/i18n';
import type { OneOfEach } from '@/shared/lib/collections';
import { routeCardPath } from '@/shared/seo';

import { CV_VARIANTS, type CvVariant } from './cv-variants';

/** The one place the CV's URL shape is decided. */
const CV_BASE = '/cv';

/**
 * The pages a fully-specified sheet has beneath it. The sheet itself is the
 * address that stops before this segment.
 */
export const CV_SUBPAGES = ['profile'] as const;

export type CvSubpage = (typeof CV_SUBPAGES)[number];

/** What each segment of a CV address may be, in the order they are spelled. */
export const CV_ADDRESS_SEGMENTS = [
  CV_VARIANTS,
  routing.locales,
  CV_SUBPAGES,
] as const;

/**
 * Every address the CV answers. A variant or locale left off means
 * "unspecified", so the shorter forms are aliases the full one is canonical
 * for, not pages of their own; a subpage is a page of its own.
 */
export type CvAddress = OneOfEach<typeof CV_ADDRESS_SEGMENTS>;

export function cvPath(...address: CvAddress): string {
  return [CV_BASE, ...address].join('/');
}

/** A framing's social card. */
export function cvCardPath(variant: CvVariant): string {
  return routeCardPath(cvPath(variant));
}
