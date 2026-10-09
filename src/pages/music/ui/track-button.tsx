'use client';

import { ActionIcon } from '@mantine/core';
import { Pause, Play } from 'lucide-react';

import { cx } from '@/shared/lib/class-names';
import type { Titled } from '@/shared/typings';

import type { PlayerTrack } from '../lib/player-state';
import classes from './music.module.scss';
import { usePlayer } from './player-provider';

export type TrackButtonProps = Titled & { track: PlayerTrack };

/** Whether this track is the one playing, and the toggle that plays or pauses it. */
export function useTrackPlayback(track: PlayerTrack) {
  const { state, current, play, labels } = usePlayer();
  const playing = current?.slug === track.slug && state.playing;

  return {
    playing,
    labels,
    toggle: () => {
      play(track);
    },
  };
}

/** The play control on a track row, showing whether this is the one playing. */
export function TrackButton({ track, title }: TrackButtonProps) {
  const { playing, labels, toggle } = useTrackPlayback(track);

  return (
    <ActionIcon
      variant="default"
      size="lg"
      radius="xl"
      onClick={toggle}
      className={cx(playing && classes['controlOn'])}
      aria-label={`${playing ? labels.pause : labels.play} ${title}`}
    >
      {playing ? <Pause size={16} /> : <Play size={16} />}
    </ActionIcon>
  );
}
