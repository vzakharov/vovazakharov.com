<<<<<<< HEAD:src/vova/pages/cv/ui/locale-picker.tsx
import { routing } from '@/kernel/shared/i18n';

import { type Chip, ChipNav } from '@/shell/shared/ui';
=======
import { ChipNav, localeChips } from '@/shared/ui';
>>>>>>> origin/main:src/pages/cv/ui/locale-picker.tsx

import { cvPath } from '../lib/cv-urls';
import type { CvEdition } from '../lib/cv-variants';

export function LocalePicker({ variant, locale }: CvEdition) {
  return (
    <ChipNav chips={localeChips(locale, (each) => cvPath(variant, each))} />
  );
}
