'use client';

import { createContext } from 'react';

import type { WithLocale } from '@/kernel/shared/i18n';
import { useProvided } from '@/kernel/shared/lib/use-provided';

import type { Messages } from '@/music/shared/i18n';

import type { PlayerControls } from '../../../station';
import type { QueuedPlayback } from '../../audio';

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

/**
 * Named rather than imported: `PlayerProvider` sits in `controls`, which
 * imports this sub-slice, so importing it back would close a cycle.
 */
const PROVIDER = { name: 'PlayerProvider' };

export function usePlayer(): PlayerContextValue {
  return useProvided(PlayerContext, PROVIDER);
}
