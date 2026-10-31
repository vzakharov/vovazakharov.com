import type { Locale } from '@/kernel/shared/i18n';

/** A credited person's name as each locale spells it. */
export type CreditedName = Record<Locale, string>;

/** Whoever a role the frontmatter leaves uncredited belongs to. */
export const SONG_AUTHOR = { en: 'Vova Zakharov', ru: 'Вова Захаров' } as const;
