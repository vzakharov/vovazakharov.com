'use client';

import { UnstyledButton } from '@mantine/core';
import { Lightbulb } from 'lucide-react';

import type { WithCopy } from '../../../checker';
import type { Ideas } from '../lib/use-ideas';
import classes from './ideas.module.scss';
import { LoadingLine, type LoadingVariant } from './loading-line';

const LOADING_VARIANT: LoadingVariant = 'bar';

type IdeasLineProps = WithCopy & {
  ideas: Ideas;
  /** Looks a variation up in the field. */
  onPick: (name: string) => void;
};

/**
 * The line under the field: the download's progress once the visitor turns
 * the model on, then the variations of every name looked up. Nothing before
 * that, the offer being `IdeasOffer`'s.
 */
export function IdeasLine({
  ideas: { available, optedIn, stop, downloading, names },
  onPick,
  copy,
}: IdeasLineProps) {
  if (!available) return;

  if (!optedIn)
    return (
      downloading !== undefined && (
        <LoadingLine
          fraction={downloading}
          variant={LOADING_VARIANT}
          onStop={stop}
          {...{ copy }}
        />
      )
    );

  if (names === undefined)
    return (
      <p className={classes['line']}>
        <Lightbulb className={classes['bulb']} data-thinking aria-hidden />
        <span className={classes['unseen']}>{copy.ideas.thinking}</span>
      </p>
    );

  if (names.length === 0) return;

  return (
    <p className={classes['line']} aria-live="polite">
      <Lightbulb className={classes['bulb']} aria-hidden />
      <span className={classes['unseen']}>{copy.ideas.lead}</span>
      {names.map((name, index) => (
        <span key={name}>
          {index > 0 && ' · '}
          <UnstyledButton
            className={classes['name']}
            onClick={() => {
              onPick(name);
            }}
          >
            {name}
          </UnstyledButton>
        </span>
      ))}
    </p>
  );
}
