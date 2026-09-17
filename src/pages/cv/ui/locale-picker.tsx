import { routing } from '@/shared/i18n';
import { type Chip, ChipNav } from '@/shared/ui';

import { cvPath } from '../lib/cv-urls';
import type { CvEdition } from '../lib/cv-variants';

/**
 * Each language as its own address: every locale is a page of its own, already
 * rendered, so switching is a navigation rather than a re-render.
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
