import { byLocale } from '@/kernel/shared/i18n';
import type { WithChildren } from '@/kernel/shared/typings';

import { musicMessages } from '@/music/shared/i18n';

import { radioPath } from '../lib/music-urls';
import { listSongs } from '../lib/songs';
import { PlayerProvider } from './player-provider';

/**
 * Every page under `/music`, wrapped in the player. A server component, so the
 * queue and the bar's own words are read at build time and cross into the
 * client as props — and so the layout itself costs nothing. Both languages come
 * down, the layout outliving a navigation between them.
 */
export function MusicLayout({ children }: WithChildren) {
  return (
    <PlayerProvider
      tracks={listSongs()}
      labels={byLocale((locale) => musicMessages(locale).player)}
      radioRoutes={byLocale((locale) => radioPath(locale))}
    >
      {children}
    </PlayerProvider>
  );
}
