import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'ru'],
  defaultLocale: 'en',
});

export type Locale = (typeof routing.locales)[number];

/** The locale as a route segment carries it, before `localeSchema` narrows it. */
export type WithStringLocale = { locale: string };

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
