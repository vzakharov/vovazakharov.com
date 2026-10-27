import {
  ARTICLE_COLLECTIONS,
  isListed,
  listPrimaryDocuments,
} from '@/shared/content';
import type { Locale } from '@/shared/i18n';

/**
 * An entry's plate number: its place among her listed entries counted from the
 * first walk, so a plate keeps its number as later ones join. `undefined` for
 * an entry no index lists.
 */
export function plateNumber(slug: string, locale: Locale): number | undefined {
  // Listed newest first.
  const listed = listPrimaryDocuments(
    ARTICLE_COLLECTIONS['maya-blog'],
    locale,
  ).filter((document) => isListed(document));
  const index = listed.findIndex((document) => document.slug === slug);

  return index === -1 ? undefined : listed.length - index;
}
