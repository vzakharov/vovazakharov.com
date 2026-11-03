'use client';

import Image from 'next/image';
import { useEffect, useMemo } from 'react';

import { CARD_HEIGHT, CARD_WIDTH } from '../lib/share-card';
import classes from './field-tools.module.scss';

type CardImageProps = { card: File };

/** The card just copied, so the visitor sees what they will paste. */
export function CardImage({ card }: CardImageProps) {
  const url = useMemo(() => URL.createObjectURL(card), [card]);

  useEffect(
    () => () => {
      URL.revokeObjectURL(url);
    },
    [url],
  );

  return (
    <Image
      src={url}
      alt={card.name}
      width={CARD_WIDTH}
      height={CARD_HEIGHT}
      unoptimized
      className={classes['card']}
    />
  );
}
