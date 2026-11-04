'use client';

import { UnstyledButton } from '@mantine/core';
import { Lightbulb } from 'lucide-react';
import { useState } from 'react';

import type { Labeled } from '@/kernel/shared/typings';

import type { WithCopy } from '../../../checker';
import { useIdeas } from '../lib/use-ideas';
import classes from './ideas.module.scss';
import { IdeasModal } from './ideas-modal';

/** `label` is the name being looked up, `''` before any. */
type IdeasLineProps = WithCopy &
  Labeled & {
    /** Looks a variation up in the field. */
    onPick: (name: string) => void;
  };

/**
 * The line under the field: the offer to brainstorm until the visitor opts in,
 * then the variations of every name looked up. Nothing where the model cannot
 * run.
 */
export function IdeasLine({ label, onPick, copy }: IdeasLineProps) {
  const { available, optedIn, optIn, names } = useIdeas(label);
  const [opened, setOpened] = useState(false);

  if (!available || label === '') return;

  if (!optedIn)
    return (
      <>
        <UnstyledButton
          className={classes['offer']}
          onClick={() => {
            setOpened(true);
          }}
        >
          {copy.ideas.offer}
        </UnstyledButton>
        <IdeasModal
          onClose={() => {
            setOpened(false);
          }}
          onReady={() => {
            setOpened(false);
            optIn();
          }}
          {...{ opened, copy }}
        />
      </>
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
