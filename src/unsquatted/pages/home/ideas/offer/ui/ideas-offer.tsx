'use client';

import { ActionIcon } from '@mantine/core';
import { Lightbulb } from 'lucide-react';
import { useEffect, useState } from 'react';

import type { WithCopy } from '../../../checker';
import type { RingTarget } from '../lib/ring';
import type { Ideas, Stage } from '../lib/use-ideas';
import classes from './ideas.module.scss';
import { IdeasModal } from './ideas-modal';

type IdeasOfferProps = WithCopy & {
  ideas: Ideas;
  /** The tool buttons' class, which the button takes to sit among them. */
  className: string | undefined;
};

/**
 * The lightbulb among the field's tool buttons. Before the visitor opts in it
 * opens the dialog that offers the model, and reopens it while the download
 * runs, to show the percentage and offer to stop; after, it brainstorms the
 * name in the field. A ring round the bulb fills with the download and then
 * with the generation, the way an app's icon fills as it installs.
 */
export function IdeasOffer({
  ideas: {
    available,
    optedIn,
    turnOn,
    brainstorm,
    stop,
    thinking,
    ring,
    downloading,
    failed,
  },
  className,
  copy,
}: IdeasOfferProps) {
  const [opened, setOpened] = useState(false);

  if (!available) return;

  const label = buttonLabel(copy.ideas, {
    optedIn,
    thinking,
    downloading,
    failed,
  });

  return (
    <>
      <ActionIcon
        variant="default"
        size={42}
        aria-label={label}
        title={label}
        onClick={() => {
          if (optedIn) brainstorm();
          else setOpened(true);
        }}
        {...{ className }}
      >
        <Lightbulb size={20} />
        {ring && <Ring target={ring} />}
      </ActionIcon>
      <IdeasModal
        onClose={() => {
          setOpened(false);
        }}
        onTurnOn={turnOn}
        onStop={stop}
        {...{ opened, downloading, failed, copy }}
      />
    </>
  );
}

function buttonLabel(
  copy: IdeasOfferProps['copy']['ideas'],
  { optedIn, thinking, downloading }: Stage,
): string {
  if (downloading !== undefined)
    return copy.loading.replace(
      '{percent}',
      String(Math.round(downloading * 100)),
    );

  if (!optedIn) return copy.offer;

  return thinking ? copy.thinking : copy.brainstorm;
}

/** The ring's radius in the 36-unit box it is drawn in. */
const RADIUS = 16;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Drawn empty, then sent to each target a frame later, so the stroke's
 * transition runs from where the ring stands to the target over its seconds.
 */
type RingProps = { target: RingTarget };

function Ring({ target: { to, seconds } }: RingProps) {
  const [shown, setShown] = useState<RingTarget>({ to: 0, seconds: 0 });

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setShown({ to, seconds });
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [to, seconds]);

  return (
    <svg className={classes['ring']} viewBox="0 0 36 36" aria-hidden>
      <circle className={classes['ringTrack']} cx={18} cy={18} r={RADIUS} />
      <circle
        className={classes['ringFill']}
        cx={18}
        cy={18}
        r={RADIUS}
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={CIRCUMFERENCE * (1 - shown.to)}
        style={{ transitionDuration: `${String(shown.seconds)}s` }}
      />
    </svg>
  );
}
