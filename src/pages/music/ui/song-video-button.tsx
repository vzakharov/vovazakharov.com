'use client';

import { Button, Modal } from '@mantine/core';
import { type ReactNode, useId, useState } from 'react';

import type { Messages } from '@/shared/i18n';

import classes from './music.module.scss';
import { usePlayer } from './player-provider';

export type SongVideoButtonProps = {
  video: string;
  /** The dialog's heading — the song's name, as the page shows it. */
  heading: ReactNode;
  labels: Messages['music']['video'];
};

/**
 * The Listen pill's outlined twin, opening the song's video over the page. The
 * site's player is paused whenever the video starts, so the two never sound
 * over each other.
 */
export function SongVideoButton({
  video,
  heading,
  labels,
}: SongVideoButtonProps) {
  const [opened, setOpened] = useState(false);
  const { state, toggle } = usePlayer();
  // Mantine ids the dialog's title off the modal's own id, which is how the
  // video borrows the song's name as its label.
  const id = useId();

  // No icon, unlike the Listen pill: with one, the Russian pair outgrows a
  // 390px phone's line and stacks.
  return (
    <>
      <Button
        variant="outline"
        size="md"
        radius="xl"
        onClick={() => {
          setOpened(true);
        }}
        className="print-hidden"
      >
        {labels.watch}
      </Button>

      <Modal
        {...{ id, opened }}
        onClose={() => {
          setOpened(false);
        }}
        title={heading}
        closeButtonProps={{ 'aria-label': labels.close }}
        centered
        classNames={{ content: classes['videoModal'] }}
      >
        <video
          src={video}
          controls
          autoPlay
          playsInline
          aria-labelledby={`${id}-title`}
          className={classes['video']}
          onPlay={() => {
            if (state.playing) toggle();
          }}
        />
      </Modal>
    </>
  );
}
