import 'server-only';

import { loadProse, type ProseSource } from '@/shared/content';
import type { Locale } from '@/shared/i18n';
import type { MusicAlbum, MusicProject } from '@/shared/music-catalogue';

import { ALBUMS_SEGMENT, ARTISTS_SEGMENT } from './music-urls';
import { MUSIC_PROJECT_SLUGS } from './projects';
import { localeProse } from './sections';

/**
 * A catalogue page's own text in one language, from the markdown file at its
 * route plus `.md` — `albums/<slug>.md`, `artists/<slug>.md` — cut on `lang:`
 * markers as a song's story is. `undefined` where the page has none.
 */
function catalogueText(name: string, locale: Locale): ProseSource | undefined {
  const source = loadProse('music', name);

  return source && { ...source, body: localeProse(source.body, locale) };
}

export function albumText(
  album: MusicAlbum,
  locale: Locale,
): ProseSource | undefined {
  return catalogueText(`${ALBUMS_SEGMENT}/${album}`, locale);
}

export function artistText(
  artist: MusicProject,
  locale: Locale,
): ProseSource | undefined {
  return catalogueText(
    `${ARTISTS_SEGMENT}/${MUSIC_PROJECT_SLUGS[artist]}`,
    locale,
  );
}
