'use client';

import { Button, Modal } from '@mantine/core';
import { type ReactNode, useEffect, useId, useRef, useState } from 'react';

import type { Slugged } from '@/shared/content';
import type { Messages } from '@/shared/i18n';

import type { SongVideo } from '../lib/song-video';
import classes from './music.module.scss';
import { usePlayer } from './player-provider';

export type SongVideoButtonProps = SongVideo &
  Slugged & {
    /** The dialog's heading — the song's name, as the page shows it. */
    heading: ReactNode;
    labels: Messages['music']['video'];
  };

/**
 * The Listen pill's outlined twin, opening the song's video over the page. The
 * site's player is paused whenever the video starts, so the two never sound
 * over each other; opened while this song plays, the video picks up where the
 * song is, and closed, it hands the place back and resumes whatever it paused.
 * The media keys are the video's while it is open.
 */
export function SongVideoButton({
  video,
  offsetSeconds,
  captions,
  subtitles,
  slug,
  heading,
  labels,
}: SongVideoButtonProps) {
  const [opened, setOpened] = useState(false);
  const { state, current, pause, resume, seek, position, yieldMediaSession } =
    usePlayer();
  // Mantine ids the dialog's title off the modal's own id, which is how the
  // video borrows the song's name as its label.
  const id = useId();
  const videoRef = useRef<HTMLVideoElement>(null);
  const watched = useRef(false);
  const pausedPlayer = useRef(false);

  const close = () => {
    const videoTime = videoRef.current?.currentTime;

    if (watched.current && videoTime !== undefined && current?.slug === slug) {
      seek(Math.max(0, videoTime - offsetSeconds));
    }
    if (pausedPlayer.current) resume();
    watched.current = false;
    pausedPlayer.current = false;
    setOpened(false);
  };

  useEffect(() => {
    if (!opened) return;

    yieldMediaSession(true);

    return () => {
      yieldMediaSession(false);
    };
  }, [opened, yieldMediaSession]);

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
        onClose={close}
        title={heading}
        closeButtonProps={{ 'aria-label': labels.close }}
        centered
        classNames={{ content: classes['videoModal'] }}
      >
        <video
          ref={videoRef}
          src={video}
          controls
          autoPlay
          playsInline
          aria-labelledby={`${id}-title`}
          className={classes['video']}
          // Read at the last moment before playback can begin, the song still
          // playing until then.
          onLoadedMetadata={(event) => {
            if (state.playing && current?.slug === slug) {
              event.currentTarget.currentTime = Math.max(
                0,
                position() + offsetSeconds,
              );
            }
          }}
          onPlay={() => {
            watched.current = true;
            if (state.playing) {
              pausedPlayer.current = true;
              pause();
            }
          }}
        >
          <track kind="captions" {...captions} />
          {subtitles.map((track) => (
            <track key={track.srcLang} kind="subtitles" {...track} />
          ))}
        </video>
      </Modal>
    </>
  );
}
