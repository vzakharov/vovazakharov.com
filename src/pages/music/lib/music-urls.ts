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

/** One song, in one language — the canonical address its alias defers to. */
export function songPath(slug: string, locale?: Locale): string {
  return localizedRoute(documentRoute('music', slug), locale);
}
