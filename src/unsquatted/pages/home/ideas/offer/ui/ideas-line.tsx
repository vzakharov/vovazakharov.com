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
 * kept while the visitor picks among them, or a shrug when it found none.
 * While the model writes the next ones, they show letter by letter, to be
 * picked once they are in; a screen reader hears them then too.
 */
export function IdeasLine({
  ideas: { available, optedIn, names, typing },
  onPick,
  className,
  copy,
}: IdeasLineProps) {
  const shown = typing ?? names;

  if (!available || !optedIn || shown === undefined) return;

  return (
    <p
      className={cx(classes['line'], className)}
      aria-live="polite"
      aria-busy={typing !== undefined}
    >
      <Lightbulb className={classes['bulb']} aria-hidden />
      {shown.length === 0 && copy.ideas.none}
      {shown.length > 0 && (
        <span className={classes['unseen']}>{copy.ideas.lead}</span>
      )}
      {shown.map((name, index) => (
        // Keyed by place: a name being written changes with every letter.
        <span key={index}>
          {index > 0 && ' · '}
          {typing ? (
            <span className={classes['typed']}>{name}</span>
          ) : (
            <UnstyledButton
              className={classes['name']}
              onClick={() => {
                onPick(name);
              }}
            >
              {name}
            </UnstyledButton>
          )}
        </span>
      ))}
    </p>
  );
}
