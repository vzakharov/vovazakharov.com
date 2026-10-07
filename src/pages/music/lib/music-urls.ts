import {
  collectionRoute,
  documentRoute,
  localizedRoute,
} from '@/shared/content';
import type { Locale } from '@/shared/i18n';

/**
 * The catalogue index. The locale-less form is an alias of the default
 * language's page rather than a page of its own, which is what lets `/music`
 * stay the address anyone links to.
 */
export function musicPath(locale?: Locale): string {
  return localizedRoute(collectionRoute('music'), locale);
}

/** The segment that turns the index into the whole catalogue, hidden songs included. */
export const EVERYTHING_SEGMENT = 'all';

/**
 * The index with every song on it, hidden ones included — linked from nowhere
 * and not indexed, for the author to see what the public list leaves out.
 */
export function everythingPath(locale?: Locale): string {
  return localizedRoute(
    `${collectionRoute('music')}/${EVERYTHING_SEGMENT}`,
    locale,
  );
}

/** One song, in one language — the canonical address its alias defers to. */
export function songPath(slug: string, locale?: Locale): string {
  return localizedRoute(documentRoute('music', slug), locale);
}
