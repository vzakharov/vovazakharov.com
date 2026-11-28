import { ChipNav, localeChips } from '@/shell/shared/ui';

import { type CvEdition, cvPath } from '@/vova/entities/cv';

export function LocalePicker({ variant, locale }: CvEdition) {
  return (
    <ChipNav chips={localeChips(locale, (each) => cvPath(variant, each))} />
  );
}
