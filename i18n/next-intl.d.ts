import type { Locale, Messages } from './messages';

// Registers the catalogs with next-intl so `useTranslations` keys are checked
// against `en.json` and `useMessages()` returns the catalog's real shape rather
// than `any` — which is what lets the CV read its structured lists without a cast.

/* eslint-disable @typescript-eslint/consistent-type-definitions -- declaration
   merging into a library's own type is only expressible as an `interface`, so
   this augmentation cannot satisfy the project-wide preference for `type`.
   Permanent, and scoped to the one declaration that merges. */
declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale;
    Messages: Messages;
  }
}
