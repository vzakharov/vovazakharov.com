import { byLocale, loadMessages } from '@/shared/i18n';
import type { WithChildren } from '@/shared/typings';

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
      labels={byLocale((locale) => loadMessages(locale).music.player)}
    >
      {children}
    </PlayerProvider>
  );
}
