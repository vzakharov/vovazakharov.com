'use client';

import { ActionIcon } from '@mantine/core';
import { Lightbulb } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type { WithCopy } from '../../../checker';
import {
  fillAt,
  type HalfSweep,
  halvesOf,
  type RingMove,
  type RingTarget,
} from '../lib/ring';
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
 * name in the field, first saying so where the weights download again. A ring round the bulb fills with the download and then
 * with the generation, the way an app's icon fills as it installs.
 */
export function IdeasOffer({
  ideas: {
    available,
    optedIn,
    evicted,
    turnOn,
    brainstorm,
    stop,
    thinking,
    ring,
    asked,
    downloading,
    failed,
  },
  className,
  copy,
}: IdeasOfferProps) {
  /**
   * Which dialog is open: the offer, or the notice that the weights download
   * again — kept until closed, though the download it reports may finish.
   */
  const [opened, setOpened] = useState<'offer' | 'evicted'>();

  if (!available) return;

  const label = buttonLabel(copy.ideas, {
    optedIn,
    evicted,
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
          if (!optedIn) {
            setOpened('offer');

            return;
          }

          if (evicted) setOpened('evicted');
          brainstorm();
        }}
        {...{ className }}
      >
        <Lightbulb size={20} />
        {ring && <Ring key={asked} target={ring} />}
      </ActionIcon>
      <IdeasModal
        opened={opened !== undefined}
        evicted={opened === 'evicted'}
        onClose={() => {
          setOpened(undefined);
        }}
        onTurnOn={turnOn}
        onStop={stop}
        {...{ downloading, failed, copy }}
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

type RingProps = { target: RingTarget };

/**
 * Two half-arcs, each turned into view by a `transform` animation: the
 * compositor runs those off the main thread, which the model's generation
 * keeps busy, where a stroke's animation would stall with it. Each new target
 * starts from where the running move has the ring.
 */
function Ring({ target: { to, seconds } }: RingProps) {
  const firstRef = useRef<HTMLSpanElement>(null);
  const secondRef = useRef<HTMLSpanElement>(null);
  const movingRef = useRef<{ move: RingMove; since: number }>({
    move: { from: 0, to: 0, seconds: 0 },
    since: 0,
  });

  useEffect(() => {
    const now = performance.now();
    const { move, since } = movingRef.current;
    const next = { from: fillAt(move, (now - since) / 1000), to, seconds };
    movingRef.current = { move: next, since: now };

    const [firstHalf, secondHalf] = halvesOf(next);
    sweep(firstRef.current, firstHalf);
    sweep(secondRef.current, secondHalf);
  }, [to, seconds]);

  return (
    <span className={classes['ring']} aria-hidden>
      <span className={classes['ringTrack']} />
      <span className={classes['ringHalf']} data-half="first">
        <span ref={firstRef} className={classes['ringArc']} />
      </span>
      <span className={classes['ringHalf']} data-half="second">
        <span ref={secondRef} className={classes['ringArc']} />
      </span>
    </span>
  );
}

/** Replaces whatever the arc was doing with the half's sweep. */
function sweep(arc: HTMLElement | null, half: HalfSweep) {
  if (!arc) return;

  for (const running of arc.getAnimations()) running.cancel();
  arc.animate([{ transform: turn(half.from) }, { transform: turn(half.to) }], {
    delay: half.delay * 1000,
    duration: half.seconds * 1000,
    easing: 'linear',
    fill: 'both',
  });
}

/** An arc's turn for its half's fill; the stylesheet says where 0 stands. */
function turn(fill: number) {
  return `rotate(${String(45 + fill * 180)}deg)`;
}
