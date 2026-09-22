import type { Messages } from './load-messages';
import type { Locale } from './routing';

// Registers the catalogs with next-intl so `getTranslations` keys are checked
// against `en.json`. That server call is the only one this types: everything
// else reads `Messages` directly, where the shape is already the catalog's own.

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
