'use client';

import { Portal } from '@mantine/core';
import Image from 'next/image';
import { useEffect, useMemo } from 'react';

import type { WhetherCopied } from '@/shell/shared/ui';

import { CARD_HEIGHT, CARD_WIDTH } from '../lib/share-card';
import classes from './field-tools.module.scss';

/** How long the toast stays; the stylesheet's `.toast` animation spans it. */
export const TOAST_MS = 3000;

type CopiedToastProps = WhetherCopied & {
  /** The card last put on the clipboard. */
  card: File | undefined;
  /** What the toast says under the card. */
  label: string;
};

/** The card just copied, in a toast at the foot of the screen. */
export function CopiedToast({ card, label, copied }: CopiedToastProps) {
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

  if (!copied || url === undefined) return null;

  return (
    <Portal>
      <output className={classes['toast']}>
        <Image
          src={url}
          alt=""
          aria-hidden
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
          unoptimized
          className={classes['card']}
        />
        <span className={classes['toastLabel']}>{label}</span>
      </output>
    </Portal>
  );
}
