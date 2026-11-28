import 'server-only';

import { listSongPages, mp3Url } from '@/music/shared/catalogue';

/** The catalogue's slug for the song the clip is cut to. */
const SLUG = 'horowo';

/** The song's MP3 as the catalogue serves it, the file every word and beat is timed against. */
export function songAudio(): string {
  const page = listSongPages().find((entry) => entry.slug === SLUG);
  if (!page) throw new Error(`The catalogue has no song «${SLUG}»`);
  return mp3Url(page.document);
}
