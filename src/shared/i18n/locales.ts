/**
 * The locale list on its own, with no next-intl behind it: a client component
 * that has to recognize a language in a URL imports from here and pulls none of
 * the i18n runtime into the browser bundle.
 */

export const LOCALES = ['en', 'ru'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

/**
 * Whether a URL segment names a language — the check a locale-last route needs
 * where the schema cannot go: in the browser, and in the guard that keeps a
 * document from being named after a language and made unreachable.
 */
export function isLocale(segment: string): segment is Locale {
  // Widened first: `includes` on the tuple itself would only accept a value
  // already known to be a locale, which is the question being asked.
  const locales: readonly string[] = LOCALES;

  return locales.includes(segment);
}

/** What language a page is being rendered in — its route's last segment, usually. */
export type WithLocale = { locale: Locale };

/** An address whose last segment may be a locale — `/cv/cto/ru`, `/music/slime/ru`. */
export type LocaleTail<Head extends string> = [] | [Head] | [Head, Locale];

/**
 * One value per language, built by asking for each. Spelled out rather than
 * mapped over `LOCALES` so it stays cast-free: a third locale fails to compile
 * here, which is the one place that has to change for it.
 */
export function byLocale<T>(pick: (locale: Locale) => T): Record<Locale, T> {
  return { en: pick('en'), ru: pick('ru') };
}
