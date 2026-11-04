'use client';

import { UnstyledButton } from '@mantine/core';
import { Lightbulb } from 'lucide-react';

import { cx } from '@/kernel/shared/lib/class-names';

import type { WithCopy } from '../../../checker';
import type { Ideas } from '../lib/use-ideas';
import classes from './ideas.module.scss';

type IdeasLineProps = WithCopy & {
  ideas: Ideas;
  /** Looks a variation up in the field. */
  onPick: (name: string) => void;
  /** Places the line among the field's row, whose gap spaces it. */
  className: string | undefined;
};

/**
 * The line by the field: the variations the lightbulb last brainstormed,
 * kept while the visitor picks among them. While it thinks, its ring says so.
 */
export function IdeasLine({
  ideas: { available, optedIn, names },
  onPick,
  className,
  copy,
}: IdeasLineProps) {
  if (!available || !optedIn || names === undefined || names.length === 0)
    return;

  return (
    <p className={cx(classes['line'], className)} aria-live="polite">
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
