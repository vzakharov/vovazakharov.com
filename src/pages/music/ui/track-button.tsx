'use client';

import { ActionIcon } from '@mantine/core';
import { Pause, Play } from 'lucide-react';

import type { Named } from '@/shared/typings';

import { currentTrack } from '../lib/player-state';
import { usePlayer } from './player-provider';

export type TrackButtonProps = Named & {
  /** This row's position in the catalogue, which is the queue's own index. */
  track: number;
};

/** The play control on a track row, showing whether this is the one playing. */
export function TrackButton({ track, name }: TrackButtonProps) {
  const { state, play } = usePlayer();
  const active = currentTrack(state) === track;
  const playing = active && state.playing;

  return (
    <ActionIcon
      variant={active ? 'filled' : 'light'}
      size="lg"
      radius="xl"
      onClick={() => {
        play(track);
      }}
      aria-label={`${playing ? 'Pause' : 'Play'} ${name}`}
    >
      {playing ? <Pause size={16} /> : <Play size={16} />}
    </ActionIcon>
  );
}
