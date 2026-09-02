import en from './messages/en.json';
import ru from './messages/ru.json';
import type { Locale } from './routing';

export type Messages = typeof en;

// Typing the catalogue map against `en` is what keeps the two files in sync:
// a key present in one and missing from the other fails the type check.
const MESSAGES: Record<Locale, Messages> = { en, ru };

export function loadMessages(locale: Locale): Messages {
  return MESSAGES[locale];
}
