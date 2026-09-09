'use client';

import { useLocale } from 'next-intl';

import { routing } from '@/shared/i18n';
import { type Chip, ChipNav } from '@/shared/ui';

import { cvPath } from '../lib/cv-urls';
import type { WithCvVariant } from '../lib/cv-variants';

/**
 * Both languages shown rather than the one being read: the label says which
 * language each link goes to, which a flag standing for the current page never
 * did.
 */
export function LocalePicker({ variant }: WithCvVariant) {
  const current = useLocale();

  const chips = routing.locales.map(
    (locale): Chip => ({
      label: locale.toUpperCase(),
      href: cvPath(variant, locale),
      hrefLang: locale,
      current: locale === current,
    }),
  );

  return <ChipNav {...{ chips }} />;
}
