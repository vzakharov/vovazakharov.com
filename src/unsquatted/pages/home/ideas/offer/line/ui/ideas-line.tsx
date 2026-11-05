'use client';

import { UnstyledButton } from '@mantine/core';
import { Lightbulb } from 'lucide-react';

import { cx } from '@/kernel/shared/lib/class-names';

import type { IdeasBlock } from '../../assistant';
import classes from './ideas-line.module.scss';

type IdeasLineProps = IdeasBlock & {
  /** Looks a variation up in the field. */
  onPick: (name: string) => void;
};

/**
 * The line by the field: the variations the lightbulb last brainstormed,
 * kept while the visitor picks among them, or a shrug when it found none.
 */
export function IdeasLine({
  ideas: { available, optedIn, names },
  onPick,
  className,
  copy,
}: IdeasLineProps) {
  if (!available || !optedIn || names === undefined) return;

  return (
    <p className={cx(classes['line'], className)} aria-live="polite">
      <Lightbulb className={classes['bulb']} aria-hidden />
      {names.length === 0 && copy.ideas.none}
      {names.length > 0 && (
        <span className={classes['unseen']}>{copy.ideas.lead}</span>
      )}
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
