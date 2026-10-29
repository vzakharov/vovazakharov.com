'use client';

import { createContext, use } from 'react';

import type { WithLocale } from '@/kernel/shared/i18n';

import type { Messages } from '@/music/shared/i18n';

import type { PlayerControls } from '../../station';
import type { QueuedPlayback } from '../model/use-audio-player';

/** The bar's own words, in one language, as the catalogue spells them. */
export type PlayerLabels = Messages['player'];

export type WithPlayerLabels = { labels: PlayerLabels };

export type PlayerContextValue = PlayerControls &
  QueuedPlayback &
  WithPlayerLabels &
  /** The language of the page the bar is currently sitting under. */
  WithLocale & {
    /** The radio's page in the page's language, which tuning in opens. */
    radioRoute: string;
  };

export const PlayerContext = createContext<PlayerContextValue | undefined>(
  undefined,
);

export function usePlayer(): PlayerContextValue {
  const value = use(PlayerContext);

  if (value === undefined) {
    throw new Error('usePlayer is only available under the music layout');
  }

  return value;
}
