import { Text } from '@mantine/core';

import { cx } from '@/kernel/shared/lib/class-names';

import type { OfferBlock } from '@/vova/entities/cv';

import { CV_CLASSES, CvBullets } from '../../frame';

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
      className={cx(
        index < paragraphs.length - 1 && CV_CLASSES['tightHeading'],
      )}
    >
      {paragraph}
    </Text>
  ));
}
