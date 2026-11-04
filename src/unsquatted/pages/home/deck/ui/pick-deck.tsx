'use client';

import { ActionIcon } from '@mantine/core';
import { RefreshCw } from 'lucide-react';
import { useLayoutEffect, useRef, useSyncExternalStore } from 'react';

import type { Headed } from '@/kernel/shared/typings';

import { type CopiedPrices, zoneOf } from '../../checker';
import { draw } from '../lib/draw';
import type { ShownName } from '../model/picks';
import classes from './deck.module.scss';
import { PickRow } from './pick-row';
import {
  arrive,
  leave,
  prefersStillness,
  type RowTops,
  rowTops,
} from './shuffle-motion';

/** How many names the list shows at once. */
const SHOWN = 10;

/** `heading` is the list's, set beside the redraw button. */
type PickDeckProps = CopiedPrices &
  Headed & {
    picks: readonly ShownName[];
  };

const listeners = new Set<() => void>();

/** The names on screen, drawn on the first read in the browser. */
let drawn: readonly ShownName[] | undefined;

/** What the static page lists: nothing, until the browser draws. */
const UNDRAWN: readonly ShownName[] = [];

function show(names: readonly ShownName[]) {
  drawn = names;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

/**
 * Ten listed names drawn at random, best first, and a button drawing ten others.
 * The draw is the browser's: the static page holds no list, which would swap
 * out on hydration, and only the ten drawn names are looked up.
 */
export function PickDeck({ heading, picks, prices, copy }: PickDeckProps) {
  const shown = useSyncExternalStore(
    subscribe,
    () => (drawn ??= draw(picks, SHOWN, Math.random)),
    () => UNDRAWN,
  );
  const listRef = useRef<HTMLUListElement>(null);
  /**
   * The rows' places before a draw lands; an empty map at first, so the first
   * ten arrive the way a redraw's do instead of popping in after hydration.
   */
  const beforeRef = useRef<RowTops | undefined>(new Map());

  useLayoutEffect(() => {
    if (shown.length === 0) return;
    if (listRef.current && beforeRef.current && !prefersStillness())
      arrive(listRef.current, beforeRef.current);
    beforeRef.current = undefined;
  }, [shown]);

  function redraw() {
    const next = draw(picks, SHOWN, Math.random, drawn);
    if (listRef.current && !prefersStillness()) {
      beforeRef.current = rowTops(listRef.current);
      leave(listRef.current, new Set(next.map(({ domain }) => domain)));
    }
    show(next);
  }

  return (
    <>
      <div className={classes['listHead']}>
        {heading}
        <ActionIcon
          variant="subtle"
          size={32}
          className={classes['redraw']}
          aria-label={copy.redraw}
          title={copy.redraw}
          onClick={redraw}
        >
          <RefreshCw size={18} />
        </ActionIcon>
      </div>
      <ul ref={listRef} className={classes['picks']} aria-live="polite">
        {shown.map(({ domain, category, blurb, score }) => (
          <PickRow
            key={domain}
            {...{ domain, category, blurb, score, copy }}
            price={prices[zoneOf(domain)]}
          />
        ))}
      </ul>
    </>
  );
}
