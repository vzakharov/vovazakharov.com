'use client';

import { Button, Group, Modal } from '@mantine/core';
import { useState } from 'react';

import { pick } from '@/kernel/shared/lib/collections';

import type { WithCopy } from '../../../checker';
import { startModel } from '../../brainstorm';
import classes from './ideas.module.scss';

type IdeasModalProps = WithCopy & {
  opened: boolean;
  onClose: () => void;
  /** The model is ready: the visitor opted in. */
  onReady: () => void;
};

/**
 * The download's progress, that it failed, or that it never began: a browser
 * built on Chromium can offer the model and have nothing to fetch it with.
 */
type Starting = { fraction: number } | 'failed' | 'stalled' | undefined;

/** How long a click waits for Chrome's first progress event before stalling. */
const FIRST_PROGRESS_MS = 30_000;

/**
 * What a visitor agrees to, in plain words, and the opt-in itself. Turn it on
 * starts the model from the click, which Chrome asks of a first download, and
 * shows its progress until the model is ready. Closing it mid-download keeps
 * the download going, and the opt-in lands when it ends.
 */
export function IdeasModal({
  opened,
  onClose,
  onReady,
  copy: { ideas: copy },
}: IdeasModalProps) {
  const [starting, setStarting] = useState<Starting>();
  const busy = typeof starting === 'object';

  return (
    <Modal centered {...{ opened, onClose }} {...pick(copy, 'title')}>
      <div className={classes['explainer']}>
        <p>{copy.what}</p>
        <p>{copy.download}</p>
        <p>{copy.where}</p>
        {busy && (
          <p className={classes['progress']} aria-live="polite">
            {starting.fraction === 0
              ? copy.waiting
              : copy.downloading.replace(
                  '{percent}',
                  String(Math.round(starting.fraction * 100)),
                )}
          </p>
        )}
        {(starting === 'failed' || starting === 'stalled') && (
          <p className={classes['progress']} role="alert">
            {copy[starting]}
          </p>
        )}
      </div>
      <Group justify="flex-end" mt="md">
        <Button variant="default" onClick={onClose}>
          {copy.notNow}
        </Button>
        <Button
          loading={busy}
          onClick={() => {
            setStarting({ fraction: 0 });
            // Chrome reports 0 as a download begins; silence means none will.
            // The creation stays pending, so a late start still opts in.
            const stall = setTimeout(() => {
              setStarting('stalled');
            }, FIRST_PROGRESS_MS);
            const settle = () => {
              clearTimeout(stall);
            };
            startModel((fraction) => {
              settle();
              setStarting({ fraction });
            }).then(
              () => {
                settle();
                setStarting(undefined);
                onReady();
              },
              (error: unknown) => {
                settle();
                reportError(error);
                setStarting('failed');
              },
            );
          }}
        >
          {copy.turnOn}
        </Button>
      </Group>
    </Modal>
  );
}
