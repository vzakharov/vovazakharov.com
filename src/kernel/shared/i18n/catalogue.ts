import type { Locale } from './locales';

/**
 * An app's message catalogue, one locale at a time. Spell `en`'s type out —
 * `catalogue<typeof en>({ en, ru })` — since that is what fails the type check
 * on a key `ru` lacks; inferred, the map takes the smaller file's type.
 */
export function catalogue<Messages>(
  messages: Record<Locale, Messages>,
): (locale: Locale) => Messages {
  return (locale) => messages[locale];
}
