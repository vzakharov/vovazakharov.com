/**
 * The locale list on its own, with no next-intl behind it: a client component
 * that has to recognize a language in a URL imports from here and pulls none of
 * the i18n runtime into the browser bundle.
 */

import { isOneOf } from '@/shared/lib/collections';

export const LOCALES = ['en', 'ru'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

/**
 * Whether a URL segment names a language — the check a locale-last route
 * parses with, and the guard that keeps a document from being named after a
 * language and made unreachable.
 */
export const isLocale = isOneOf(LOCALES);

/** What language a page is being rendered in — its route's last segment, usually. */
export type WithLocale = { locale: Locale };

/** An address whose last segment may be a locale — `/cv/cto/ru`, `/music/slime/ru`. */
export type LocaleTail<Head extends string> = [] | [Head] | [Head, Locale];

/** Every address one head value answers: itself, and one per locale. */
export function localeTailAddresses<Head extends string>(
  head: Head,
): Array<LocaleTail<Head>> {
  return [[head], ...LOCALES.map<LocaleTail<Head>>((locale) => [head, locale])];
}

/**
 * One value per language, built by asking for each. Spelled out rather than
 * mapped over `LOCALES` so it stays cast-free: a third locale fails to compile
 * here, which is the one place that has to change for it.
 */
export function byLocale<T>(pick: (locale: Locale) => T): Record<Locale, T> {
  return { en: pick('en'), ru: pick('ru') };
}
