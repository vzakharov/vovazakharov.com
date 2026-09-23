'use client';

import { usePathname } from 'next/navigation';
import { createContext, use, useMemo } from 'react';

import {
  addressLocale,
  type Locale,
  type Messages,
  type WithLocale,
} from '@/shared/i18n';
import type { WithChildren } from '@/shared/typings';

import type { WithTracks } from '../lib/player-state';
import {
  type Playback,
  type PlayerControls,
  useAudioPlayer,
} from '../lib/use-audio-player';
import classes from './music.module.scss';
import { PlayerBar } from './player-bar';

/** The bar's own words, in one language, as the catalogue spells them. */
type PlayerLabels = Messages['music']['player'];

export type PlayerContextValue = PlayerControls &
  Playback &
  WithTracks &
  /** The language of the page the bar is currently sitting under. */
  WithLocale & { labels: PlayerLabels };

const PlayerContext = createContext<PlayerContextValue | undefined>(undefined);

export function usePlayer(): PlayerContextValue {
  const value = use(PlayerContext);

  if (value === undefined) {
    throw new Error('usePlayer is only available under the music layout');
  }

  return value;
}

export type PlayerProviderProps = WithChildren &
  WithTracks & {
    /** Every language's labels, the layout being above the segment that picks one. */
    labels: Record<Locale, PlayerLabels>;
  };

/**
 * Hands the player to every page under the music layout, and pins the bar to
 * their foot. Mounted by the layout and never unmounted, which is the whole
 * reason the player is not a component a page drops in: React preserves a
 * layout's subtree across a navigation into and out of `/music/<slug>`, so a
 * track keeps playing.
 */
export function PlayerProvider({
  children,
  tracks,
  labels,
}: PlayerProviderProps) {
  const locale = addressLocale(usePathname());
  const { state, elapsed, current, controls } = useAudioPlayer(tracks, locale);

  const value = useMemo<PlayerContextValue>(
    () => ({
      tracks,
      state,
      elapsed,
      locale,
      labels: labels[locale],
      ...controls,
      ...(current && { current }),
    }),
    [tracks, state, elapsed, controls, current, locale, labels],
  );

  return (
    <PlayerContext {...{ value }}>
      {children}
      {current !== undefined && (
        <>
          <div className={classes['playerClearance']} aria-hidden />
          <PlayerBar />
        </>
      )}
    </PlayerContext>
  );
}
