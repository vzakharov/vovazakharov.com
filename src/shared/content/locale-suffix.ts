/**
 * No `import 'server-only'`, unlike most of `shared/content/`: the translation
 * scripts run this under bare Node, which is why its imports spell their
 * extensions.
 */

import path from 'node:path';

import { DEFAULT_LOCALE, type Locale, LOCALES } from '../i18n/locales.ts';
import { isOneOf } from '../lib/collections.ts';

/** The languages an original can be in: any but the one it is translated into. */
export const ORIGINAL_LOCALES = LOCALES.filter(
  (locale) => locale !== DEFAULT_LOCALE,
);

const isOriginalLocale = isOneOf(ORIGINAL_LOCALES);

/** `<stem>.<locale>` split, where the suffix names an original's language. */
export function splitLocale(stem: string): { stem: string; locale?: Locale } {
  const suffix = path.extname(stem).slice(1);

  return isOriginalLocale(suffix)
    ? { stem: stem.slice(0, -(suffix.length + 1)), locale: suffix }
    : { stem };
}

/**
 * `<stem>.<locale><ext>`'s translation, `<stem><ext>` beside it — a post's or a
 * drawing's alike — or nothing where `file` is not an original.
 */
export function translationOf(file: string): string | undefined {
  const extension = path.extname(file);
  const { stem, locale } = splitLocale(file.slice(0, -extension.length));

  return locale === undefined ? undefined : `${stem}${extension}`;
}
