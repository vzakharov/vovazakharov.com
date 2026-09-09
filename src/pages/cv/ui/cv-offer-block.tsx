import { Text } from '@mantine/core';

import { cx } from '@/shared/lib/class-names';

import type { OfferBlock } from '../lib/cv-offer';
import classes from './cv.module.scss';
import { CvBullets } from './cv-bullets';

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
