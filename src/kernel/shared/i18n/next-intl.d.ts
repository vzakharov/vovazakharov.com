import type { Locale } from './locales';

// Locales only: each app reads its own catalogue, and next-intl's one global
// `Messages` type could hold a single site's at most.

/* eslint-disable @typescript-eslint/consistent-type-definitions -- declaration
   merging into a library's own type is only expressible as an `interface`, so
   this augmentation cannot satisfy the project-wide preference for `type`.
   Permanent, and scoped to the one declaration that merges. */
declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale;
  }
}
