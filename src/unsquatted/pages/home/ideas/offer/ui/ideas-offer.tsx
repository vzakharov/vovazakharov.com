'use client';

import { ActionIcon } from '@mantine/core';
import { Lightbulb } from 'lucide-react';
import { useState } from 'react';

import type { WithCopy } from '../../../checker';
import type { Ideas } from '../lib/use-ideas';
import classes from './ideas.module.scss';
import { IdeasModal } from './ideas-modal';

type IdeasOfferProps = WithCopy & {
  ideas: Ideas;
  /** The tool buttons' class, which the button takes to sit among them. */
  className: string | undefined;
};

/** The ring's radius in the 36-unit box it is drawn in. */
const RADIUS = 16;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * The offer to brainstorm, a lightbulb among the field's tool buttons, and its
 * dialog, until the visitor opts in or waves it off. While the download runs,
 * a ring round the bulb fills with it, and the button reopens the dialog,
 * which shows the percentage and offers to stop.
 */
export function IdeasOffer({
  ideas: { available, optedIn, turnOn, stop, dismiss, downloading, failed },
  className,
  copy,
}: IdeasOfferProps) {
  const [opened, setOpened] = useState(false);

  if (!available || optedIn) return;

  const label =
    downloading === undefined
      ? copy.ideas.offer
      : copy.ideas.loading.replace(
          '{percent}',
          String(Math.round(downloading * 100)),
        );

  return (
    <>
      <ActionIcon
        variant="default"
        size={42}
        aria-label={label}
        title={label}
        onClick={() => {
          setOpened(true);
        }}
        {...{ className }}
      >
        <Lightbulb size={20} />
        {downloading !== undefined && (
          <svg className={classes['ring']} viewBox="0 0 36 36" aria-hidden>
            <circle
              className={classes['ringTrack']}
              cx={18}
              cy={18}
              r={RADIUS}
            />
            <circle
              className={classes['ringFill']}
              cx={18}
              cy={18}
              r={RADIUS}
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - downloading)}
            />
          </svg>
        )}
      </ActionIcon>
      <IdeasModal
        onClose={() => {
          setOpened(false);
        }}
        onTurnOn={turnOn}
        onStop={stop}
        onDismiss={dismiss}
        {...{ opened, downloading, failed, copy }}
      />
    </>
  );
}
