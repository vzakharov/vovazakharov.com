'use client';

import { Portal } from '@mantine/core';
import Image from 'next/image';
import { useEffect, useMemo } from 'react';

import { CARD_HEIGHT, CARD_WIDTH } from '../lib/share-card';
import classes from './field-tools.module.scss';

type CopiedToastProps = {
  /** The card last put on the clipboard. */
  card: File | undefined;
  /** Where the menu that copied it sat when pressed. */
  from: DOMRect | undefined;
  shown: boolean;
};

const TOAST_WIDTH = 200;

/**
 * The card just copied, flashed under the menu that copied it, clear of the
 * item pressed, and swept off to the side at once — a receipt, not a thing to
 * act on.
 */
export function CopiedToast({ card, from, shown }: CopiedToastProps) {
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

  if (!shown || card === undefined || url === undefined || from === undefined)
    return null;

  return (
    <Portal>
      <div
        aria-hidden
        className={classes['toast']}
        style={{
          top: from.bottom + 8,
          right: document.documentElement.clientWidth - from.right,
          width: TOAST_WIDTH,
        }}
      >
        <Image
          src={url}
          alt=""
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
          unoptimized
          className={classes['card']}
        />
      </div>
    </Portal>
  );
}
