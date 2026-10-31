/**
 * No `import 'server-only'`, unlike most of `shared/content/`: the translation
 * scripts run this outside any bundler.
 */

import path from 'node:path';

import {
  DEFAULT_LOCALE,
  type Locale,
  LOCALES,
} from '@/kernel/shared/i18n/locales';
import { isOneOf } from '@/kernel/shared/lib/collections';

/** The languages an original can be in: any but the one it is translated into. */
export const ORIGINAL_LOCALES = LOCALES.filter(
  (locale) => locale !== DEFAULT_LOCALE,
);

const isLocaleSuffix = isOneOf(LOCALES);

/** `<stem>.<locale>` split, where the suffix names a language. */
export function splitLocale(stem: string): { stem: string; locale?: Locale } {
  const suffix = path.extname(stem).slice(1);

  return isLocaleSuffix(suffix)
    ? { stem: stem.slice(0, -(suffix.length + 1)), locale: suffix }
    : { stem };
}

/**
 * An original's translation — `<stem>.<locale><ext>`, in a language other than
 * the default, translated to `<stem>.<default><ext>` beside it — or nothing
 * where `file` is not an original.
 */
export function translationOf(file: string): string | undefined {
  const extension = path.extname(file);
  const { stem, locale } = splitLocale(file.slice(0, -extension.length));

  return locale === undefined || locale === DEFAULT_LOCALE
    ? undefined
    : `${stem}.${DEFAULT_LOCALE}${extension}`;
}
