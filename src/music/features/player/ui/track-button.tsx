'use client';

import { ActionIcon } from '@mantine/core';
import { Pause, Play } from 'lucide-react';

import { cx } from '@/kernel/shared/lib/class-names';
import { useScriptPreference } from '@/kernel/shared/lib/use-script-preference';

import {
  type PlayerTrack,
  spelledText,
  type WithTrack,
} from '@/music/shared/catalogue/index.node-safe';

import classes from './player.module.scss';
import { usePlayer } from './player-provider';

/** Whether this track is the one playing, and the toggle that plays or pauses it. */
export function useTrackPlayback(track: PlayerTrack) {
  const { state, current, play, labels, locale } = usePlayer();
  const playing = current?.slug === track.slug && state.playing;

  return {
    playing,
    labels,
    locale,
    toggle: () => {
      play(track);
    },
  };
}

/** The play control on a track row, showing whether this is the one playing. */
export function TrackButton({ track }: WithTrack) {
  const { playing, labels, locale, toggle } = useTrackPlayback(track);
  const { script } = useScriptPreference();
  const title = spelledText(track.titles[locale], script);

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
