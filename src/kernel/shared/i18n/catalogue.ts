import type { Locale } from './locales';

/**
 * An app's message catalogue, one locale at a time. Call it with `en`'s type
 * spelled out — `catalogue<typeof en>({ en, ru })` — since typing the map
 * against `en` is what keeps the two files in sync: a key present in one and
 * missing from the other fails the type check.
 */
export function catalogue<Messages>(
  messages: Record<Locale, Messages>,
): (locale: Locale) => Messages {
  return (locale) => messages[locale];
}
