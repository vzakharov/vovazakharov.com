'use client';

import { ActionIcon } from '@mantine/core';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { cvPath } from '../lib/cv-urls';
import type { WithCvVariant } from '../lib/cv-variants';

/**
 * A link rather than a control: the other language has its own address, so the
 * switch is navigation and works before hydration.
 */
export function LocalePicker({ variant }: WithCvVariant) {
  const locale = useLocale();
  const t = useTranslations('ui');

  const nextLocale = locale === 'en' ? 'ru' : 'en';
  const currentFlag = locale === 'en' ? '🇬🇧' : '🇷🇺';

  return (
    <ActionIcon
      component={Link}
      href={cvPath(variant, nextLocale)}
      variant="default"
      size={38}
      radius={4}
      fz={18}
      aria-label={t('switchToOther')}
    >
      {currentFlag}
    </ActionIcon>
  );
}
