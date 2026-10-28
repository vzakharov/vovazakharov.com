import { byLocale, isLocale, type Locale } from '@/kernel/shared/i18n';

import {
  isListed,
  listPrimaryDocuments,
  type Slugged,
} from '@/blog/shared/content';

import { albumsTogether, songPlacements } from './album-tracks.ts';
import { projectName } from './artists.ts';
import type { SongBilling } from './file-name.ts';
import { SONGS } from './frontmatter.ts';
import { artistPath, songPath } from './music-urls.ts';
import type { MusicAlbum } from './names.ts';
import { bill } from './projects.ts';
import { playedName, songUrl } from './song-files.ts';
import type { SongDocument, SongOnRelease } from './song-text.ts';
import { songTitle } from './spelling.ts';
import type { PlayerTrack } from './track.ts';
import { assertWritten } from './written-guard.ts';

/**
 * The catalogue, newest first. A slug that is a locale is rejected here, where
 * every list of songs passes: `/music/songs/ru` is the songs tab in Russian, so
 * such a song would have a file, a row on the index and no page of its own. Two
 * songs claiming one album's track number are rejected here too.
 */
function listSongDocuments(): SongDocument[] {
  const documents = listPrimaryDocuments(SONGS);
  const unreachable = documents.find(({ slug }) => isLocale(slug));

  if (unreachable) {
    throw new Error(
      `${unreachable.fileName} is named after an address of the music section, ${songPath(unreachable.slug)}.`,
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

/** One page of a song: as the release it is filed under shows it, or as another it is also on does. */
export type SongPageEntry = Slugged & SongOnRelease;

/**
 * The page a song has on a release: its own slug on the one it is filed
 * under, `<slug>-<album>` on any other — so following a song from an album's
 * list keeps the listener on that album, its cover and its name first.
 */
function songPageSlug(
  { slug, frontmatter }: SongDocument,
  album: MusicAlbum | null,
): string {
  return album === frontmatter.album ? slug : `${slug}-${album}`;
}

/**
 * Every song page, the release-specific ones included. A page slug another
 * song or a locale already holds fails the build, as a song slug does in
 * `listSongDocuments`.
 */
export function listSongPages(): SongPageEntry[] {
  const documents = listSongDocuments();
  const songSlugs = new Set(documents.map(({ slug }) => slug));
  const pages = documents.flatMap((document) =>
    songPlacements(document.frontmatter)
      .filter(({ album }) => album !== document.frontmatter.album)
      .map(({ album }) => ({
        slug: songPageSlug(document, album),
        document,
        album,
      })),
  );
  const taken = pages.find(({ slug }) => songSlugs.has(slug) || isLocale(slug));

  if (taken) {
    throw new Error(
      `${taken.document.fileName}'s page on ${taken.album} is ${songPath(taken.slug)}, an address already taken.`,
    );
  }

  return [
    ...documents.map((document) => {
      const {
        slug,
        frontmatter: { album },
      } = document;

      return { slug, document, album };
    }),
    ...pages,
  ];
}

/**
 * One song, reduced to what the player needs. Resolved at build time and
 * handed down as props, which is what keeps `shared/content` — and with it
 * `gray-matter`, `zod` and the whole remark stack — out of the browser while
 * the player still has a queue to work from. Both languages travel with every
 * track: a queue that stopped at the language boundary would stop the music.
 * `album` is the release whose page the track links to.
 */
export function songTrack(
  document: SongDocument,
  album: MusicAlbum | null = document.frontmatter.album,
): PlayerTrack {
  const { slug, frontmatter } = document;
  const { seconds, explicit, segue, project } = frontmatter;
  const english = songBilling(document, 'en');
  const played = (lossless: boolean) =>
    songUrl(frontmatter, playedName(frontmatter, english, lossless));
  const audio = played(true);
  const mp3 = played(false);

  assertWritten(document, [audio, mp3]);

  return {
    slug,
    audio,
    mp3,
    seconds,
    explicit,
    segue,
    billing: byLocale((locale) =>
      bill(project, (artist) => ({
        name: projectName(artist, locale),
        href: artistPath(artist, locale),
      })),
    ),
    titles: byLocale((locale) => songTitle(frontmatter, locale)),
    routes: byLocale((locale) =>
      songPath(songPageSlug(document, album), locale),
    ),
  };
}

/** Who the song is billed to and what it is called, as the locale's page spells them. */
export function songBilling(
  { frontmatter, fileName }: SongDocument,
  locale: Locale,
): SongBilling {
  const [artist, ...features] = frontmatter.project.map((project) =>
    projectName(project, locale),
  );

  if (artist === undefined) throw new Error(`${fileName} bills no artist.`);

  return {
    artists: [artist, ...features],
    title: songTitle(frontmatter, locale),
  };
}

/** The names a list of tracks shows under a locale, for `scriptSample` to read: each title and its billing. */
export function trackNames(
  tracks: readonly PlayerTrack[],
  locale: Locale,
): string[] {
  return tracks.flatMap(({ titles, billing }) => [
    titles[locale].original,
    ...billing[locale].map((part) =>
      typeof part === 'string' ? part : part.name.original,
    ),
  ]);
}

/** Every listed song, in catalogue order. */
export function catalogueSongs(): SongDocument[] {
  return listSongDocuments().filter((document) => isListed(document));
}

/**
 * The queue the player starts from: the catalogue, each album's songs together
 * in track order, so skipping forward from one walks its album.
 */
export function listSongs(): PlayerTrack[] {
  return albumsTogether(catalogueSongs()).map((document) =>
    songTrack(document),
  );
}
