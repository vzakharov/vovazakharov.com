'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

import { addressLocale, type Locale } from '@/kernel/shared/i18n';
import type { WithChildren } from '@/kernel/shared/typings';

import type { WithTracks } from '@/music/shared/catalogue/index.node-safe';

import { useAudioPlayer } from '../../audio';
import { PlayerBar } from '../../bar';
import {
  PlayerContext,
  type PlayerContextValue,
  type PlayerLabels,
} from '../../context';
import classes from './player-clearance.module.scss';

export type PlayerProviderProps = WithChildren &
  WithTracks & {
    /** Every language's labels, the layout being above the segment that picks one. */
    labels: Record<Locale, PlayerLabels>;
    /** Resolved by the server, the URL module being out of a client bundle's reach. */
    radioRoutes: Record<Locale, string>;
  };

/**
 * Hands the player to every page under the music layout, and pins the bar to
 * their foot. Mounted by the layout and never unmounted, which is the whole
 * reason the player is not a component a page drops in: React preserves a
 * layout's subtree across a navigation into and out of `/music/songs/<slug>`, so a
 * track keeps playing.
 */
export function PlayerProvider({
  children,
  tracks,
  labels,
  radioRoutes,
}: PlayerProviderProps) {
  const locale = addressLocale(usePathname());
  const {
    tracks: queue,
    state,
    elapsed,
    switching,
    current,
    controls,
  } = useAudioPlayer(tracks, locale);

  const value = useMemo<PlayerContextValue>(
    () => ({
      tracks: queue,
      state,
      elapsed,
      switching,
      locale,
      labels: labels[locale],
      radioRoute: radioRoutes[locale],
      ...controls,
      ...(current && { current }),
    }),
    [
      queue,
      state,
      elapsed,
      switching,
      controls,
      current,
      locale,
      labels,
      radioRoutes,
    ],
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
