import { defineRouting } from 'next-intl/routing';

import { DEFAULT_LOCALE, LOCALES } from './locales';

/**
 * The locale list and the default, nothing more: a static export has no
 * middleware for next-intl to route with, and the localized pages — the CV and
 * the songs — carry the locale as a trailing segment their own route parses.
 */
export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
});
