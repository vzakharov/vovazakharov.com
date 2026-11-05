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
 * it. Where the browser has deleted the weights since, it only says they are
 * downloading again, which the press that opened it has already begun.
 */
export function IdeasModal({
  opened,
  onClose,
  onTurnOn,
  onStop,
  evicted,
  downloading,
  failed,
  copy: { ideas: copy },
}: IdeasModalProps) {
  const busy = downloading !== undefined;

  return (
    <Modal centered {...{ opened, onClose }} {...pick(copy, 'title')}>
      <div className={classes['explainer']}>
        {evicted ? (
          <p>{copy.evicted}</p>
        ) : (
          <>
            <p>{copy.what}</p>
            <p>{copy.download}</p>
            <p>{copy.pace}</p>
          </>
        )}
        {busy && (
          <p className={classes['progress']} aria-live="polite">
            {withPercent(
              evicted ? copy.loading : copy.downloading,
              downloading,
            )}
          </p>
        )}
        {failed && (
          <p className={classes['progress']} role="alert">
            {copy.failed}
          </p>
        )}
      </div>
      <Group justify="flex-end" mt="md">
        {evicted ? (
          <Button onClick={onClose}>{copy.ok}</Button>
        ) : busy ? (
          <>
            <Button variant="default" onClick={onStop}>
              {copy.stop}
            </Button>
            <Button onClick={onClose}>{copy.close}</Button>
          </>
        ) : (
          <>
            <Button variant="default" onClick={onClose}>
              {copy.notNow}
            </Button>
            <Button onClick={onTurnOn}>{copy.turnOn}</Button>
          </>
        )}
      </Group>
    </Modal>
  );
}

/** `template` with its `{percent}` filled from the fraction downloaded. */
export function withPercent(template: string, fraction: number): string {
  return template.replace('{percent}', String(Math.round(fraction * 100)));
}
