import { ChipNav, localeChips } from '@/shared/ui';

import { cvPath } from '../lib/cv-urls';
import type { CvEdition } from '../lib/cv-variants';

export function LocalePicker({ variant, locale }: CvEdition) {
  return (
    <ChipNav chips={localeChips(locale, (each) => cvPath(variant, each))} />
  );
}
