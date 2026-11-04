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
 * The line under the field: the variations of the name in it, once the
 * lightbulb has brainstormed them. While it thinks, its ring says so.
 */
export function IdeasLine({
  ideas: { available, optedIn, names },
  onPick,
  copy,
}: IdeasLineProps) {
  if (!available || !optedIn || names === undefined || names.length === 0)
    return;

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
