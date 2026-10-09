import { routing } from '@/shared/i18n';
import { type Chip, ChipNav } from '@/shared/ui';

import { cvPath } from '../lib/cv-urls';
import type { CvEdition } from '../lib/cv-variants';

/**
 * Links rather than a control: each locale is a page of its own in the export,
 * so switching languages is a navigation (`.claude/rules/i18n.md`).
 */
export function LocalePicker({ variant, locale }: CvEdition) {
  const chips = routing.locales.map(
    (each): Chip => ({
      label: each.toUpperCase(),
      href: cvPath(variant, each),
      hrefLang: each,
      current: each === locale,
    }),
  );

  return <ChipNav {...{ chips }} />;
}
