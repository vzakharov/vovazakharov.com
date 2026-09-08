import { Text } from '@mantine/core';

import type { Messages } from '@/shared/i18n';
import { cx } from '@/shared/lib/class-names';

import classes from './cv.module.scss';
import { CvBullets } from './cv-bullets';

type OfferBlocks = Messages['cv']['whatIOffer']['blocks'];

export type OfferBlockKey = keyof OfferBlocks;

/** A block states its offer as either a bullet list or prose, never both. */
type OfferBlock = OfferBlocks[OfferBlockKey];

type CvOfferBlockProps = { block: OfferBlock };

export function CvOfferBlock({ block }: CvOfferBlockProps) {
  if ('items' in block) {
    const { items } = block;

    return <CvBullets {...{ items }} last />;
  }

  const { paragraphs } = block;

  return paragraphs.map((paragraph, index) => (
    <Text
      key={index}
      lh={1.625}
      className={cx(index < paragraphs.length - 1 && classes['tightHeading'])}
    >
      {paragraph}
    </Text>
  ));
}
