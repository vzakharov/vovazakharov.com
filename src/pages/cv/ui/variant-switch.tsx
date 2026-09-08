'use client';

import { Button } from '@mantine/core';
import { useTranslations } from 'next-intl';

import { Link } from '@/shared/i18n';

import { cvVariantPath } from '../lib/cv-urls';
import { CV_VARIANTS, type WithCvVariant } from '../lib/cv-variants';

/**
 * Deliberately visible: a second framing a reader finds rather than is shown
 * reads as evasive. Links rather than a control, so each framing keeps its own
 * address.
 */
export function VariantSwitch({ variant: current }: WithCvVariant) {
  const t = useTranslations('ui');

  return (
    <Button.Group aria-label={t('switchVariant')}>
      {CV_VARIANTS.map((variant) => (
        <Button
          key={variant}
          component={Link}
          href={cvVariantPath(variant)}
          variant={variant === current ? 'filled' : 'default'}
          size="compact-sm"
          h={38}
          px={12}
          aria-current={variant === current ? 'page' : undefined}
        >
          {t(`cvVariants.${variant}`)}
        </Button>
      ))}
    </Button.Group>
  );
}
