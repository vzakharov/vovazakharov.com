import type { Locale } from './locales';

// Registers the locales with next-intl. No catalogue is registered: each app
// reads its own, and next-intl's one global `Messages` type could hold a single
// site's at most.

/* eslint-disable @typescript-eslint/consistent-type-definitions -- declaration
   merging into a library's own type is only expressible as an `interface`, so
   this augmentation cannot satisfy the project-wide preference for `type`.
   Permanent, and scoped to the one declaration that merges. */
declare module 'next-intl' {
  interface AppConfig {
    Locale: Locale;
  }
}
