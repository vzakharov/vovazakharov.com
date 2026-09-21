'use client';

import { Text } from '@mantine/core';
import { useLocale, useTranslations } from 'next-intl';

import { InternalLink } from '@/shared/ui';

import { cvPath } from '../lib/cv-urls';
import type { CvVariant, WithCvVariant } from '../lib/cv-variants';
import classes from './cv.module.scss';

/** Which framing each one invites the reader to; total, so a third variant has to say where it sends people. */
const OTHER_VARIANT = {
  cto: 'dev',
  dev: 'cto',
} as const satisfies Record<CvVariant, CvVariant>;

/**
 * One invitation to the other framing, at the foot of the sheet: a reader who
 * has read this far is the one it is for, and a choice offered at the top
 * reads as the author not having made it. A link rather than a control, so
 * each framing keeps its own address.
 */
export function OtherVariantLink({ variant }: WithCvVariant) {
  const locale = useLocale();
  const t = useTranslations('ui');
  const other = OTHER_VARIANT[variant];

  return (
    <Text size="sm" className={classes['dim60']}>
      <InternalLink href={cvPath(other, locale)} inherit>
        {t(`cvVariants.${other}`)}
      </InternalLink>
    </Text>
  );
}
