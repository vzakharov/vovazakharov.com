'use client';

import { Paper, Portal, Transition } from '@mantine/core';
import Image from 'next/image';
import { useEffect, useMemo } from 'react';

import { CARD_HEIGHT, CARD_WIDTH } from '../lib/share-card';
import classes from './field-tools.module.scss';

type CopiedToastProps = {
  /** The card last put on the clipboard. */
  card: File | undefined;
  shown: boolean;
};

/**
 * The card just copied, alone in the corner for a moment, so the visitor sees
 * what they will paste.
 */
export function CopiedToast({ card, shown }: CopiedToastProps) {
  const url = useMemo(
    () => (card === undefined ? undefined : URL.createObjectURL(card)),
    [card],
  );

  useEffect(
    () => () => {
      if (url !== undefined) URL.revokeObjectURL(url);
    },
    [url],
  );

  return (
    <Portal>
      <Transition mounted={shown && url !== undefined} transition="slide-up">
        {(style) => (
          <Paper
            component="output"
            shadow="md"
            className={classes['toast']}
            {...{ style }}
          >
            {card !== undefined && url !== undefined && (
              <Image
                src={url}
                alt={card.name}
                width={CARD_WIDTH}
                height={CARD_HEIGHT}
                unoptimized
                className={classes['card']}
              />
            )}
          </Paper>
        )}
      </Transition>
    </Portal>
  );
}
