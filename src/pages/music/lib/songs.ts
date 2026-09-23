import { billing } from '@/shared/config';
import { listPrimaryDocuments, SONGS } from '@/shared/content';
import { byLocale, isLocale } from '@/shared/i18n';

import { songPath } from './music-urls';
import type { PlayerTrack } from './player-state';
import { localizeSong, type SongDocument } from './song-text';

/**
 * The catalogue, newest first. A slug that reads as a language is rejected
 * here, where every list of songs passes: `/music/ru` is the index in Russian,
 * so such a song would have a file, a row on the index and no page of its own.
 */
export function listSongDocuments(): SongDocument[] {
  const documents = listPrimaryDocuments(SONGS);
  const unreachable = documents.find(({ slug }) => isLocale(slug));

  if (unreachable) {
    throw new Error(
      `${unreachable.fileName} is named after a locale, and /music/${unreachable.slug} is the index in that language.`,
    );
  }

  return documents;
}

/**
 * The queue, reduced to what the player needs. Resolved at build time and
 * handed down as props, which is what keeps `shared/content` — and with it
 * `gray-matter`, `zod` and the whole remark stack — out of the browser while
 * the player still has a queue to work from. Both languages travel with every
 * track: a queue that stopped at the language boundary would stop the music.
 */
export function listSongs(): PlayerTrack[] {
  return listSongDocuments().map((document) => {
    const { slug, frontmatter } = document;
    const { audio, seconds, explicit, project } = frontmatter;

    return {
      slug,
      audio,
      seconds,
      explicit,
      billing: billing(project),
      titles: byLocale(
        (locale) => localizeSong(document, locale).frontmatter.title,
      ),
      routes: byLocale((locale) => songPath(slug, locale)),
    };
  });
}

/** Where a song sits in the queue — the position its play button drives. */
export function songQueueIndex(slug: string): number {
  return listSongDocuments().findIndex((document) => document.slug === slug);
}
