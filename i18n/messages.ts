import en from '../messages/en.json';
import ru from '../messages/ru.json';
import type { routing } from './routing';

export type Locale = (typeof routing.locales)[number];

/** The catalog shape every locale must satisfy. */
export type Messages = typeof en;

/**
 * A key present in one catalog and missing from the other is a type error here.
 * The imports are static because a template specifier resolves to `any`, which
 * erases exactly that check.
 */
export const MESSAGES: Record<Locale, Messages> = { en, ru };
