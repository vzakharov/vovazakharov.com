'use client';

import { Button } from '@mantine/core';
import { Pause, Play } from 'lucide-react';

import { type TrackButtonProps, useTrackPlayback } from './track-button';

/**
 * A song page's play control, worded: the shuffle button's pill, saying what
 * it will do — listen while the song is not playing, pause while it is.
 */
export function SongPlayButton({ track }: Pick<TrackButtonProps, 'track'>) {
  const { playing, labels, toggle } = useTrackPlayback(track);
  const Icon = playing ? Pause : Play;

  // The visible word is the whole accessible name: the button sits under the
  // song's own title, which already says what it plays.
  return (
    <Button
      size="md"
      radius="xl"
      leftSection={<Icon size={18} fill="currentColor" strokeWidth={1.5} />}
      onClick={toggle}
      className="print-hidden"
    >
      {playing ? labels.pause : labels.listen}
    </Button>
  );
}
