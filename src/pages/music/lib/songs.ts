import { billing } from '@/shared/config';
import { isListed, listPrimaryDocuments, SONGS } from '@/shared/content';
import { byLocale, isLocale } from '@/shared/i18n';

import { EVERYTHING_SEGMENT, songPath } from './music-urls';
import type { PlayerTrack } from './player-state';
import { localizeSong, type SongDocument } from './song-text';

/**
 * The catalogue, newest first. A slug the index's own addresses already claim
 * is rejected here, where every list of songs passes: `/music/ru` is the index
 * in Russian and `/music/all` the whole catalogue, so such a song would have a
 * file, a row on the index and no page of its own. Two songs claiming one
 * album's track number are rejected here too.
 */
export function listSongDocuments(): SongDocument[] {
  const documents = listPrimaryDocuments(SONGS);
  const unreachable = documents.find(
    ({ slug }) => isLocale(slug) || slug === EVERYTHING_SEGMENT,
  );

  if (unreachable) {
    throw new Error(
      `${unreachable.fileName} is named after an address of the index, /music/${unreachable.slug}.`,
    );
  }

  const claimed = new Map<string, string>();

  for (const { fileName, frontmatter } of documents) {
    const { album, track } = frontmatter;

    if (album === null) continue;

    const position = `${album} #${String(track)}`;
    const holder = claimed.get(position);

    if (holder !== undefined) {
      throw new Error(`${fileName} and ${holder} are both ${position}.`);
    }

    claimed.set(position, fileName);
  }

  return documents;
}

/**
 * One song, reduced to what the player needs. Resolved at build time and
 * handed down as props, which is what keeps `shared/content` — and with it
 * `gray-matter`, `zod` and the whole remark stack — out of the browser while
 * the player still has a queue to work from. Both languages travel with every
 * track: a queue that stopped at the language boundary would stop the music.
 */
export function songTrack(document: SongDocument): PlayerTrack {
  const { slug, frontmatter } = document;
  const { audio, seconds, explicit, project } = frontmatter;

  return {
    slug,
    audio,
    seconds,
    explicit,
    billing: byLocale((locale) => billing(project, locale)),
    titles: byLocale(
      (locale) => localizeSong(document, locale).frontmatter.title,
    ),
    routes: byLocale((locale) => songPath(slug, locale)),
  };
}

/** The queue: every listed song — or every song, hidden ones too — in catalogue order. */
export function listSongs(everything = false): PlayerTrack[] {
  return listSongDocuments()
    .filter((document) => everything || isListed(document))
    .map((document) => songTrack(document));
}
