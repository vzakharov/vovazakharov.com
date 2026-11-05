'use client';

import { Button, Group, Modal } from '@mantine/core';
import { Lightbulb } from 'lucide-react';

import { pick } from '@/kernel/shared/lib/collections';

import type { WithCopy } from '../../../../checker';
import type { Loading } from '../../brain';
import classes from './ideas-offer.module.scss';

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
 * What a visitor agrees to, in plain words, and the opt-in itself, whose
 * download carries on with the dialog closed. Opened for weights the browser
 * has deleted, it only reports the download the press already began. Left
 * open, it says when the download is done.
 */
export function IdeasModal({
  opened,
  onClose,
  onTurnOn,
  onStop,
  optedIn,
  evicted,
  downloading,
  failed,
  copy: { ideas: copy },
}: IdeasModalProps) {
  const busy = downloading !== undefined;
  const done = !busy && !failed && (evicted || optedIn);
  const [beforeBulb, afterBulb] = copy.what.split('{bulb}');

  return (
    <Modal centered {...{ opened, onClose }} {...pick(copy, 'title')}>
      <div className={classes['explainer']}>
        {evicted ? (
          <p>{copy.evicted}</p>
        ) : (
          <>
            <p>
              {beforeBulb}
              <Lightbulb className={classes['pressed']} aria-hidden />
              <span className={classes['unseen']}>{copy.bulb}</span>
              {afterBulb}
            </p>
            <p>{copy.download}</p>
            <p>{copy.pace}</p>
          </>
        )}
        {(busy || done) && (
          <p className={classes['progress']} aria-live="polite">
            {busy
              ? withPercent(
                  evicted ? copy.loading : copy.downloading,
                  downloading,
                )
              : copy.ready}
          </p>
        )}
        {failed && (
          <p className={classes['progress']} role="alert">
            {copy.failed}
          </p>
        )}
      </div>
      <Group justify="flex-end" mt="md">
        {evicted || done ? (
          <Button onClick={onClose}>{done ? copy.go : copy.ok}</Button>
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
