'use client';

import { UnstyledButton } from '@mantine/core';
import { Lightbulb } from 'lucide-react';

import type { WithCopy } from '../../../checker';
import type { Ideas } from '../lib/use-ideas';
import classes from './ideas.module.scss';

type IdeasLineProps = WithCopy & {
  ideas: Ideas;
  /** Looks a variation up in the field. */
  onPick: (name: string) => void;
};

/**
 * The line under the field once the visitor has opted in: the variations of
 * every name looked up. Nothing before that, the offer being `IdeasOffer`'s.
 */
export function IdeasLine({
  ideas: { available, optedIn, names },
  onPick,
  copy,
}: IdeasLineProps) {
  if (!available || !optedIn) return;

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
