import 'server-only';

import {
  DEFAULT_LOCALE,
  isLocale,
  type Locale,
  LOCALES,
  type WithLocale,
} from '@/kernel/shared/i18n';
import { oneOf } from '@/kernel/shared/lib/collections';

import { isListed, type Slugged } from '@/blog/shared/content';

import {
  albumPath,
  ALBUMS_SEGMENT,
  artistPath,
  ARTISTS_SEGMENT,
  CATALOGUE_TABS,
  catalogueInfo,
  listSongPages,
  musicAlbumSlugs,
  musicPath,
  type MusicProject,
  projectBySlug,
  RADIO_SEGMENT,
  radioPath,
  songPath,
  SONGS_SEGMENT,
  tabBySegment,
  tabPath,
} from '@/music/shared/catalogue';
import type { AlbumPageProps } from '@/music/pages/album';
import type { ArtistPageProps } from '@/music/pages/artist';
import type { IndexPageProps } from '@/music/pages/music';
import type { SongPageProps } from '@/music/pages/song';

/** The catch-all's segments as a route hands them over, before the parse narrows them. */
export type WithOptionalMusicSegments = { slugAndLocale?: string[] };

/** Which page an address resolves to, and in which language. */
export type MusicAddress =
  | ({ page: 'index' } & IndexPageProps)
  | ({ page: 'artist' } & ArtistPageProps)
  | ({ page: 'album' } & AlbumPageProps)
  | ({ page: 'song' } & SongPageProps)
  | ({ page: 'radio' } & WithLocale);

function artistBySlug(slug: string): MusicProject {
  const artist = projectBySlug(slug);

  if (artist === undefined) {
    throw new Error(`No artist is addressed as ${slug}.`);
  }

  return artist;
}

/**
 * A parse rather than a cast, failing `next build` on an address no reading
 * covers. The locale is the last segment wherever it is present.
 * `listSongPages` refuses a song slug that is a locale, so no song can steal
 * the songs tab's URL in a language.
 */
export function parseMusicSegments({
  slugAndLocale = [],
}: WithOptionalMusicSegments): MusicAddress {
  const last = slugAndLocale.at(-1);
  const locale = isLocale(last) ? last : DEFAULT_LOCALE;
  const [kind, slug, ...rest] = isLocale(last)
    ? slugAndLocale.slice(0, -1)
    : slugAndLocale;

  if (kind === undefined) {
    return { page: 'index', tab: 'artists', locale };
  }

  if (slug !== undefined && rest.length === 0) {
    if (kind === ARTISTS_SEGMENT) {
      return { page: 'artist', artist: artistBySlug(slug), locale };
    }
    if (kind === ALBUMS_SEGMENT) {
      return { page: 'album', album: oneOf(musicAlbumSlugs(), slug), locale };
    }
    if (kind === SONGS_SEGMENT) {
      return { page: 'song', slug, locale };
    }
  }

  if (slug === undefined) {
    const tab = tabBySegment(kind);

    if (tab !== undefined) return { page: 'index', tab, locale };
    if (kind === RADIO_SEGMENT) return { page: 'radio', locale };
  }

  throw new Error(
    `${musicPath()}/${slugAndLocale.join('/')} is no address of the music section.`,
  );
}

/** A page as the function that addresses it in a language, or locale-less. */
type Addressed = (locale?: Locale) => string;

function songPage({ slug }: Slugged): Addressed {
  return (locale) => songPath(slug, locale);
}

/**
 * The catalogue's pages: its index in each tab, and every artist and album with
 * a listed song — so an artist or album whose songs are all hidden has no page.
 */
function cataloguePages(): Addressed[] {
  const { artists, albums } = catalogueInfo();

  return [
    ...CATALOGUE_TABS.map(
      (tab): Addressed =>
        (locale) =>
          tabPath(tab, locale),
    ),
    ...artists.map(
      (artist): Addressed =>
        (locale) =>
          artistPath(artist, locale),
    ),
    ...albums.map(
      (album): Addressed =>
        (locale) =>
          albumPath(album, locale),
    ),
  ];
}

/** Every address the music section answers, as the catch-all spells them. */
export function musicSegmentParams(): WithOptionalMusicSegments[] {
  const pages: Addressed[] = [
    ...cataloguePages(),
    ...listSongPages().map((page) => songPage(page)),
    radioPath,
  ];

  return pages
    .flatMap((page) => [page(), ...LOCALES.map((locale) => page(locale))])
    .map((address) => ({
      slugAndLocale: address
        .slice(musicPath().length)
        .split('/')
        .filter(Boolean),
    }));
}

/**
 * The catalogue's pages, one address per language and not the alias —
 * the section's share of the sitemap. Of the songs only a page on a release
 * other than the song's own is here, the collection's walk advertising the
 * song's own page.
 */
export function musicCatalogueRoutes(): string[] {
  const releasePages = listSongPages()
    .filter(
      ({ slug, document }) => isListed(document) && slug !== document.slug,
    )
    .map((page) => songPage(page));

  return [...cataloguePages(), ...releasePages, radioPath].flatMap((page) =>
    LOCALES.map((locale) => page(locale)),
  );
}
