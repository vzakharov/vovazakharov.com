'use client';

import { Loader } from '@mantine/core';
import Image from 'next/image';
import { useEffect, useMemo } from 'react';

import { CARD_HEIGHT, CARD_WIDTH } from '../lib/share-card';
import classes from './field-tools.module.scss';

/** The card as drawn, still being drawn, or why there is none. */
export type CardState = File | 'drawing' | 'none' | 'failed';

type Unshown = Exclude<CardState, File>;

type CardPreviewProps = {
  card: CardState;
  /** The drawn card's object URL, from `useObjectUrl`. */
  url: string | undefined;
  alt: string;
  /** What the card's place says while there is no card to show. */
  said: Record<Unshown, string>;
};

/**
 * `file`'s object URL, revoked once another file or none replaces it. Called
 * from a component mounted before the file arrives: under Strict Mode, one
 * mounted with it would revoke the URL in the remount and keep showing it.
 */
export function useObjectUrl(file: File | undefined): string | undefined {
  const url = useMemo(
    () => (file === undefined ? undefined : URL.createObjectURL(file)),
    [file],
  );

  useEffect(
    () => () => {
      if (url !== undefined) URL.revokeObjectURL(url);
    },
    [url],
  );

  return url;
}

/** The card's own aspect, held by its place whether it holds the card or not. */
const CARD_ASPECT = { aspectRatio: `${CARD_WIDTH} / ${CARD_HEIGHT}` };

/**
 * The card at the popover's width; a real image, so the browser's own "copy
 * image" and "save image" reach it where ours cannot.
 */
export function CardPreview({ card, url, alt, said }: CardPreviewProps) {
  if (card instanceof File && url !== undefined)
    return (
      <Image
        src={url}
        {...{ alt }}
        width={CARD_WIDTH}
        height={CARD_HEIGHT}
        unoptimized
        className={classes['card']}
        style={CARD_ASPECT}
      />
    );
  const unshown = card instanceof File ? 'drawing' : card;

  return (
    <output className={classes['cardSlot']} style={CARD_ASPECT}>
      {unshown === 'drawing' && <Loader size="sm" />}
      {said[unshown]}
    </output>
  );
}
