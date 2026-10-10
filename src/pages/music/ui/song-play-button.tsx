'use client';

import { Button } from '@mantine/core';
import { Pause, Play } from 'lucide-react';

import type { PlayerState } from '../lib/player-state';
import type { PlayerContextValue } from './player-provider';
import { type TrackButtonProps, useTrackPlayback } from './track-button';

export type ListenButtonProps = Pick<PlayerContextValue, 'labels'> &
  Pick<PlayerState, 'playing'> & { onClick: () => void };

/**
 * A page's play control, worded: the shuffle button's pill, saying what it
 * will do — listen while the page's music is not playing, pause while it is.
 */
export function ListenButton({ playing, labels, onClick }: ListenButtonProps) {
  const Icon = playing ? Pause : Play;

  // The visible word is the whole accessible name: the button sits under the
  // page's own title, which already says what it plays.
  return (
    <Button
      size="md"
      radius="xl"
      leftSection={<Icon size={18} fill="currentColor" strokeWidth={1.5} />}
      {...{ onClick }}
      className="print-hidden"
    >
      {playing ? labels.pause : labels.listen}
    </Button>
  );
}

/** A song page's play control. */
export function SongPlayButton({ track }: Pick<TrackButtonProps, 'track'>) {
  const { playing, labels, toggle } = useTrackPlayback(track);

  return <ListenButton {...{ playing, labels }} onClick={toggle} />;
}
