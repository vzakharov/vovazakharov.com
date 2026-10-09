import 'server-only';

import { loadProse, type ProseSource } from '@/shared/content';
import type { Locale } from '@/shared/i18n';
import type { MusicAlbum } from '@/shared/music-catalogue';

import { ALBUMS_SEGMENT } from './music-urls';
import { localeProse } from './sections';

/**
 * An album's own text in one language, from `albums/<slug>.md` — at the album's
 * route plus `.md`, cut on `lang:` markers as a song's story is. `undefined`
 * where the album has none.
 */
export function albumText(
  album: MusicAlbum,
  locale: Locale,
): ProseSource | undefined {
  const source = loadProse('music', `${ALBUMS_SEGMENT}/${album}`);

  return source && { ...source, body: localeProse(source.body, locale) };
}
