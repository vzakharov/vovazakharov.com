import type { WithChildren } from '@/shared/typings';

import { listSongs } from '../lib/songs';
import { PlayerProvider } from './player-provider';

/**
 * Every page under `/music`, wrapped in the player. A server component, so the
 * queue is read off the collection at build time and crosses into the client as
 * props — and so the layout itself costs nothing.
 */
export function MusicLayout({ children }: WithChildren) {
  return <PlayerProvider tracks={listSongs()}>{children}</PlayerProvider>;
}
