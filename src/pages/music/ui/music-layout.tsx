import { byLocale, loadMessages } from '@/shared/i18n';
import type { WithChildren } from '@/shared/typings';

import { listSongs } from '../lib/songs';
import { PlayerProvider } from './player-provider';

/**
 * Every page under `/music`, wrapped in the player. A server component, so the
 * queue and the bar's own words are read at build time and cross into the
 * client as props — and so the layout itself costs nothing.
 *
 * Both languages come down because the layout sits above the segment that names
 * one: it is what keeps a track playing across a navigation, so it cannot be
 * rebuilt when the reader switches language.
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
