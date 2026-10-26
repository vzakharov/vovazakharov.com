import { type Locale, LOCALES } from '@/kernel/shared/i18n';

import type { Chip } from './chip-nav';

/**
 * A page's language switch, as `ChipNav` rows it: one chip per locale, each
 * linking to `href(locale)`, this same page in that language. Links rather than
 * a control, each locale being a page of its own in the export
 * (`.claude/rules/i18n.md`).
 */
export function localeChips(
  locale: Locale,
  href: (alternate: Locale) => string,
): Chip[] {
  return LOCALES.map((alternate) => ({
    label: alternate.toUpperCase(),
    href: href(alternate),
    hrefLang: alternate,
    current: alternate === locale,
  }));
}
