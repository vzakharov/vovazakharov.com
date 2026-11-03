'use client';

import { Button, Modal } from '@mantine/core';
import { Download, Share2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useMemo } from 'react';

import type { WithCopy } from '../../checker';
import {
  canShareFile,
  CARD_HEIGHT,
  CARD_WIDTH,
  downloadFile,
  shareFile,
} from '../lib/share-card';
import classes from './corner-tools.module.scss';

type ShareImageModalProps = WithCopy & {
  /** The card to show; none keeps the modal closed. */
  card: File | undefined;
  onClose: () => void;
};

/**
 * The card a visitor is about to share, shown before it goes anywhere, with
 * the system share sheet where the browser has one for files and a download
 * always.
 */
export function ShareImageModal({ card, onClose, copy }: ShareImageModalProps) {
  const url = useMemo(
    () => (card === undefined ? undefined : URL.createObjectURL(card)),
    [card],
  );

  useEffect(
    () => () => {
      if (url !== undefined) URL.revokeObjectURL(url);
    },
    [url],
  );

  return (
    <Modal
      opened={card !== undefined}
      {...{ onClose }}
      title={copy.shareImage}
      closeButtonProps={{ 'aria-label': copy.close }}
      centered
      size="xl"
    >
      {card !== undefined && url !== undefined && (
        <>
          <Image
            src={url}
            alt={card.name}
            width={CARD_WIDTH}
            height={CARD_HEIGHT}
            unoptimized
            className={classes['card']}
          />
          <div className={classes['cardButtons']}>
            {canShareFile(card) && (
              <Button
                leftSection={<Share2 size={14} />}
                onClick={() => {
                  shareFile(card).catch(reportError);
                }}
              >
                {copy.shareSheet}
              </Button>
            )}
            <Button
              variant="default"
              leftSection={<Download size={14} />}
              onClick={() => {
                downloadFile(card, url);
              }}
            >
              {copy.download}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
