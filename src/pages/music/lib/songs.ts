import { isListed, listPrimaryDocuments, SONGS } from '@/shared/content';
import { byLocale, isLocale } from '@/shared/i18n';

import { songPlacements } from './album-tracks';
import {
  ALBUMS_SEGMENT,
  artistPath,
  ARTISTS_SEGMENT,
  EVERYTHING_SEGMENT,
  songPath,
  SONGS_SEGMENT,
  type WithEverything,
} from './music-urls';
import type { PlayerTrack } from './player-state';
import { bill, projectName } from './projects';
import { localizeSong, type SongDocument } from './song-text';

/** The first segments under `/music` that address a page other than a song. */
const RESERVED_SEGMENTS: ReadonlySet<string> = new Set([
  EVERYTHING_SEGMENT,
  ARTISTS_SEGMENT,
  ALBUMS_SEGMENT,
  SONGS_SEGMENT,
]);

/**
 * The catalogue, newest first. A slug the section's own addresses already
 * claim is rejected here, where every list of songs passes: `/music/ru` is the
 * index in Russian, `/music/all` the whole catalogue, `/music/songs` its songs
 * and `/music/artists/…` an artist, so such a song would have a file, a row on
 * the index and no page of its own. Two songs claiming one album's track
 * number are rejected here too.
 */
export function listSongDocuments(): SongDocument[] {
  const documents = listPrimaryDocuments(SONGS);
  const unreachable = documents.find(
    ({ slug }) => isLocale(slug) || RESERVED_SEGMENTS.has(slug),
  );

  if (unreachable) {
    throw new Error(
      `${unreachable.fileName} is named after an address of the music section, /music/${unreachable.slug}.`,
    );
  }

  const claimed = new Map<string, string>();

  for (const { fileName, frontmatter } of documents) {
    for (const { album, track } of songPlacements(frontmatter)) {
      const position = `${album} #${String(track)}`;
      const holder = claimed.get(position);

      if (holder !== undefined) {
        throw new Error(`${fileName} and ${holder} are both ${position}.`);
      }

      claimed.set(position, fileName);
    }
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
    billing: byLocale((locale) =>
      bill(project, (artist) => ({
        label: projectName(artist, locale),
        // The catalogue the song's own page links into.
        href: artistPath(artist, { everything: !isListed(document) }, locale),
      })),
    ),
    titles: byLocale(
      (locale) => localizeSong(document, locale).frontmatter.title,
    ),
    routes: byLocale((locale) => songPath(slug, locale)),
  };
}

/** Every listed song — or every song, hidden ones too — in catalogue order. */
export function catalogueSongs({ everything }: WithEverything): SongDocument[] {
  return listSongDocuments().filter(
    (document) => everything || isListed(document),
  );
}

/** The queue the player starts from: the public catalogue. */
export function listSongs(): PlayerTrack[] {
  return catalogueSongs({ everything: false }).map((document) =>
    songTrack(document),
  );
}
