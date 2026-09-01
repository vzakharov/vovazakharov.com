import type { Locale, Messages } from './messages';

// Registers the catalogs with next-intl so `useTranslations` keys are checked
// against `en.json` and `useMessages()` returns the catalog's real shape rather
// than `any` — which is what lets the CV read its structured lists without a cast.
//
// Declaration merging into a library type only works through an `interface`, so
// this file is the one place `@typescript-eslint/consistent-type-definitions` is
// scoped off (see eslint.config.ts).
declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale;
    Messages: Messages;
  }
}
