import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'ru'],
  defaultLocale: 'en',
});

export type Locale = (typeof routing.locales)[number];

function isLocale(value: string): value is Locale {
  return (routing.locales as readonly string[]).includes(value);
}

// Route params reach the app as bare strings; every locale-aware call narrows
// through here so an unroutable value fails the build rather than the render.
export function toLocale(value: string): Locale {
  if (!isLocale(value)) {
    throw new Error(`Unsupported locale: ${value}`);
  }

  return value;
}

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
