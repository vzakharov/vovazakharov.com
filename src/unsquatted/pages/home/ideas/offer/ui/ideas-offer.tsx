'use client';

import { ActionIcon, UnstyledButton } from '@mantine/core';
import { Lightbulb } from 'lucide-react';
import { useState } from 'react';

import type { WithCopy } from '../../../checker';
import type { Ideas } from '../lib/use-ideas';
import classes from './ideas.module.scss';
import { IdeasModal } from './ideas-modal';

/**
 * The line as it stands and three placements less crowded on a phone, which
 * the operator picks from; the rest go once one is.
 */
export type OfferVariant = 'line' | 'below' | 'icon' | 'field';

type IdeasOfferProps = WithCopy & {
  ideas: Ideas;
  variant: OfferVariant;
  /** The tool buttons' class, for the `icon` variant. */
  toolClassName?: string;
};

/**
 * The offer to brainstorm and its dialog, until the visitor opts in or waves
 * it off. The trigger hides while the download runs; the dialog stays, since
 * it shows the download's progress.
 */
export function IdeasOffer({
  ideas: { available, optedIn, turnOn, stop, dismiss, downloading, failed },
  variant,
  toolClassName,
  copy,
}: IdeasOfferProps) {
  const [opened, setOpened] = useState(false);

  if (!available || optedIn) return;

  const open = () => {
    setOpened(true);
  };

  return (
    <>
      {downloading === undefined &&
        (variant === 'line' || variant === 'below' ? (
          <UnstyledButton
            className={classes['offer']}
            data-variant={variant}
            onClick={open}
          >
            {variant === 'below' && (
              <Lightbulb className={classes['bulb']} aria-hidden />
            )}
            {copy.ideas.offer}
          </UnstyledButton>
        ) : (
          <ActionIcon
            variant={variant === 'icon' ? 'default' : 'subtle'}
            color="gray"
            className={variant === 'icon' ? toolClassName : undefined}
            size={variant === 'icon' ? 42 : 28}
            aria-label={copy.ideas.offer}
            title={copy.ideas.offer}
            onClick={open}
          >
            <Lightbulb size={variant === 'icon' ? 20 : 18} />
          </ActionIcon>
        ))}
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
