import { pageFile } from '@/shared/config/index.server-only';
import type { Locale } from '@/shared/i18n';
import type { DocumentFile } from '@/shared/typings';

import { cvPath } from './cv-urls';
import type { CvVariant } from './cv-variants';

/**
 * The committed print of one framing in one language. Keyed off the canonical
 * address rather than the rung being served, so the short rungs offer the same
 * file their metadata already points at instead of duplicating it.
 *
 * Apart from `cv-urls.ts`, which client components import for `cvPath`: the
 * saved name carries the site's download prefix, so this is the one CV URL that
 * needs the resolved configuration.
 */
export function cvPdfFile(variant: CvVariant, locale: Locale): DocumentFile {
  return pageFile(cvPath(variant, locale), 'pdf');
}
