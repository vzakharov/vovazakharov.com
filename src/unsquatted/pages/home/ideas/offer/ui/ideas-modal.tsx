'use client';

import { Button, Group, Modal } from '@mantine/core';

import { pick } from '@/kernel/shared/lib/collections';

import type { WithCopy } from '../../../checker';
import type { Loading } from '../lib/use-ideas';
import classes from './ideas.module.scss';

type IdeasModalProps = WithCopy &
  Loading & {
    opened: boolean;
    onClose: () => void;
    /** Starts the download. */
    onTurnOn: () => void;
    /** Stops the download. */
    onStop: () => void;
  };

/**
 * What a visitor agrees to, in plain words, and the opt-in itself. Turn it on
 * starts the download, which carries on with the dialog closed, its progress
 * then shown by the lightbulb's ring; while it runs, the dialog offers to stop
 * it.
 */
export function IdeasModal({
  opened,
  onClose,
  onTurnOn,
  onStop,
  downloading,
  failed,
  copy: { ideas: copy },
}: IdeasModalProps) {
  const busy = downloading !== undefined;

  return (
    <Modal centered {...{ opened, onClose }} {...pick(copy, 'title')}>
      <div className={classes['explainer']}>
        <p>{copy.what}</p>
        <p>{copy.download}</p>
        <p>{copy.pace}</p>
        {busy && (
          <p className={classes['progress']} aria-live="polite">
            {copy.downloading.replace(
              '{percent}',
              String(Math.round(downloading * 100)),
            )}
          </p>
        )}
        {failed && (
          <p className={classes['progress']} role="alert">
            {copy.failed}
          </p>
        )}
      </div>
      {busy ? (
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onStop}>
            {copy.stop}
          </Button>
          <Button onClick={onClose}>{copy.close}</Button>
        </Group>
      ) : (
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            {copy.notNow}
          </Button>
          <Button onClick={onTurnOn}>{copy.turnOn}</Button>
        </Group>
      )}
    </Modal>
  );
}
