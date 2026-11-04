'use client';

import { CloseButton, Portal } from '@mantine/core';
import { Check } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

import type { WhetherCopied } from '@/shell/shared/ui';

import { CARD_HEIGHT, CARD_WIDTH } from '../lib/share-card';
import classes from './field-tools.module.scss';

/** How long the toast stays; the stylesheet's `.toast` animation spans it. */
export const TOAST_MS = 3000;

/** What the toast says: its line, and its close button's name. */
type ToastText = { said: string; dismiss: string };

type ToastProps = ToastText & { url: string };

type CopiedToastProps = WhetherCopied &
  ToastText & {
    /** The card last put on the clipboard. */
    card: File | undefined;
  };

/** One copy's toast: it rises, and sinks when its time is up or it is closed. */
function Toast({ url, said, dismiss }: ToastProps) {
  const [state, setState] = useState<'shown' | 'leaving' | 'gone'>('shown');

  if (state === 'gone') return null;

  return (
    <Portal>
      <output
        className={classes['toast']}
        data-leaving={state === 'leaving'}
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget) setState('gone');
        }}
      >
        <span className={classes['toastHead']}>
          <Check size={16} className={classes['toastCheck']} />
          <span className={classes['toastSaid']}>{said}</span>
          <CloseButton
            size="sm"
            aria-label={dismiss}
            title={dismiss}
            onClick={() => {
              setState('leaving');
            }}
          />
        </span>
        <Image
          src={url}
          alt=""
          aria-hidden
          width={CARD_WIDTH}
          height={CARD_HEIGHT}
          unoptimized
          className={classes['card']}
        />
      </output>
    </Portal>
  );
}

/** The card just copied, in a toast in the screen's bottom-right corner. */
export function CopiedToast({ card, copied, ...text }: CopiedToastProps) {
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

  // Keyed by the card, so each copy's toast starts shown.
  return copied && url !== undefined ? (
    <Toast key={url} {...{ url }} {...text} />
  ) : null;
}
