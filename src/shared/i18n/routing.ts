import { defineRouting } from 'next-intl/routing';

/**
 * The locale list and the default, nothing more: a static export has no
 * middleware for next-intl to route with, and the CV — the one localized
 * page — carries its locale as a trailing segment its own schema parses.
 */
export const routing = defineRouting({
  locales: ['en', 'ru'],
  defaultLocale: 'en',
});

export type Locale = (typeof routing.locales)[number];
