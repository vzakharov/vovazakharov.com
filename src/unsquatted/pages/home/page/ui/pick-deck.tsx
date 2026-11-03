'use client';

import { ActionIcon } from '@mantine/core';
import { useLayoutEffect, useRef, useSyncExternalStore } from 'react';

import { type CopiedPrices, zoneOf } from '../../checker';
import { TOOL_BUTTON } from '../../field-tools';
import { draw } from '../lib/draw';
import type { ShownName } from '../model/picks';
import { DiceIcon } from './dice-icon';
import { PickRow } from './pick-row';
import {
  arrive,
  leave,
  prefersStillness,
  type RowTops,
  rowTops,
} from './shuffle-motion';
import classes from './unsquatted-home.module.scss';

/** How many names the list shows at once. */
const SHOWN = 10;

type PickDeckProps = CopiedPrices & { picks: readonly ShownName[] };

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
 * Ten listed names drawn at random, best first, and a dice drawing ten others.
 * The draw is the browser's: the static page holds no list, which would swap
 * out on hydration, and only the ten drawn names are looked up.
 */
export function PickDeck({ picks, prices, copy }: PickDeckProps) {
  const shown = useSyncExternalStore(
    subscribe,
    () => (drawn ??= draw(picks, SHOWN, Math.random)),
    () => UNDRAWN,
  );
  const listRef = useRef<HTMLUListElement>(null);
  /** The rows' places before a redraw, while one is landing. */
  const beforeRef = useRef<RowTops | undefined>(undefined);
  const rollingRef = useRef(false);

  useLayoutEffect(() => {
    if (listRef.current && beforeRef.current)
      arrive(listRef.current, beforeRef.current);
    beforeRef.current = undefined;
  }, [shown]);

  function redraw() {
    if (rollingRef.current) return;
    const next = draw(picks, SHOWN, Math.random, drawn);
    if (!listRef.current || prefersStillness()) {
      show(next);
      return;
    }
    rollingRef.current = true;
    const ul = listRef.current;
    leave(ul, new Set(next.map(({ domain }) => domain)), () => {
      beforeRef.current = rowTops(ul);
      rollingRef.current = false;
      show(next);
    });
  }

  return (
    <section aria-labelledby="names">
      <div className={classes['listHead']}>
        <h2 id="names" className={classes['sectionHeading']}>
          {copy.listHeading}
        </h2>
        <ActionIcon
          variant="default"
          className={TOOL_BUTTON}
          size={32}
          aria-label={copy.redraw}
          title={copy.redraw}
          onClick={redraw}
        >
          <DiceIcon />
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
    </section>
  );
}
