import { pageFile } from '@/shared/config';
import type { Locale } from '@/shared/i18n';
import { OG_CARD_SUFFIX } from '@/shared/seo';
import type { DocumentFile } from '@/shared/typings';

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

/**
 * A framing's social card sits at its route plus an extension, as a document's
 * files do — safe because a route reserves only `.html` and `.txt`.
 */
export function cvCardPath(variant: CvVariant): string {
  return `${cvPath(variant)}${OG_CARD_SUFFIX}`;
}

/**
 * The committed print of one framing in one language. Keyed off the canonical
 * address rather than the rung being served, so the short rungs offer the same
 * file their metadata already points at instead of duplicating it.
 */
export function cvPdfFile(variant: CvVariant, locale: Locale): DocumentFile {
  return pageFile(cvPath(variant, locale), 'pdf');
}
