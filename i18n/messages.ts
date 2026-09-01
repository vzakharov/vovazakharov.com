import en from '../messages/en.json';
import ru from '../messages/ru.json';
import type { routing } from './routing';

export type Locale = (typeof routing.locales)[number];

/** The catalog shape every locale must satisfy, taken from `en` as the reference. */
export type Messages = typeof en;

/**
 * Catalogs keyed by locale, typed against `en` so every other locale must carry
 * the same keys — a key added to one catalog and not the other is a type error
 * rather than a string that falls back to its own name at runtime.
 *
 * Static imports rather than `import(\`../messages/${locale}.json\`)`: the
 * template specifier resolves to `any`, which erases exactly that check.
 */
export const MESSAGES: Record<Locale, Messages> = { en, ru };
