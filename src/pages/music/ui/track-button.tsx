'use client';

import { ActionIcon } from '@mantine/core';
import { Pause, Play } from 'lucide-react';

import { cx } from '@/shared/lib/class-names';
import type { Titled } from '@/shared/typings';

import { currentTrack } from '../lib/player-state';
import classes from './music.module.scss';
import { usePlayer } from './player-provider';

export type TrackButtonProps = Titled & {
  /** This row's position in the catalogue, which is the queue's own index. */
  track: number;
};

/** The play control on a track row, showing whether this is the one playing. */
export function TrackButton({ track, title }: TrackButtonProps) {
  const { state, play, labels } = usePlayer();
  const playing = currentTrack(state) === track && state.playing;

  return (
    <ActionIcon
      variant="default"
      size="lg"
      radius="xl"
      onClick={() => {
        play(track);
      }}
      className={cx(playing && classes['controlOn'])}
      aria-label={`${playing ? labels.pause : labels.play} ${title}`}
    >
      {playing ? <Pause size={16} /> : <Play size={16} />}
    </ActionIcon>
  );
}
