import 'server-only';

import { isListed, type Slugged } from '@/shared/content';
import {
  DEFAULT_LOCALE,
  isLocale,
  type Locale,
  LOCALES,
  type WithLocale,
} from '@/shared/i18n';
import { oneOf } from '@/shared/lib/collections';
import {
  MUSIC_ALBUM_SLUGS,
  MUSIC_PROJECT_NAMES,
  type MusicAlbum,
  type MusicProject,
} from '@/shared/music-catalogue';

import { catalogueAlbums, catalogueArtists } from './catalogue';
import {
  albumPath,
  ALBUMS_SEGMENT,
  artistPath,
  ARTISTS_SEGMENT,
  CATALOGUE_TABS,
  EVERYTHING_SEGMENT,
  musicPath,
  songPath,
  SONGS_SEGMENT,
  tabBySegment,
  tabPath,
  type WithEverything,
  type WithTab,
} from './music-urls';
import { MUSIC_PROJECT_SLUGS } from './projects';
import { catalogueSongs, listSongPages } from './songs';

/** The catch-all's segments as a route hands them over, before the parse narrows them. */
export type WithOptionalMusicSegments = { slugAndLocale?: string[] };

/** A page of one catalogue, public or whole, in one language. */
export type CataloguePageProps = WithLocale & WithEverything;

export type IndexPageProps = CataloguePageProps & WithTab;

export type ArtistPageProps = CataloguePageProps & { artist: MusicProject };

export type AlbumPageProps = CataloguePageProps & { album: MusicAlbum };

export type SongPageProps = WithLocale & Slugged;

/** Which page an address resolves to, and in which language. */
export type MusicAddress =
  | ({ page: 'index' } & IndexPageProps)
  | ({ page: 'artist' } & ArtistPageProps)
  | ({ page: 'album' } & AlbumPageProps)
  | ({ page: 'song' } & SongPageProps);

function artistBySlug(slug: string): MusicProject {
  const artist = MUSIC_PROJECT_NAMES.find(
    (name) => MUSIC_PROJECT_SLUGS[name] === slug,
  );

  if (artist === undefined) {
    throw new Error(`No artist is addressed as ${slug}.`);
  }

  return artist;
}

/**
 * A parse rather than a cast, failing `next build` on an address no reading
 * covers. The locale is the last segment wherever it is present, and the whole
 * catalogue's addresses are the public ones behind `all/`. A song sits under
 * `songs/`, as an artist and an album sit under theirs, and `listSongPages`
 * refuses a song slug that is a locale, so no song can steal the songs tab's
 * URL in a language.
 */
export function parseMusicSegments({
  slugAndLocale = [],
}: WithOptionalMusicSegments): MusicAddress {
  const last = slugAndLocale.at(-1);
  const locale = isLocale(last) ? last : DEFAULT_LOCALE;
  const path = isLocale(last) ? slugAndLocale.slice(0, -1) : slugAndLocale;
  const everything = path[0] === EVERYTHING_SEGMENT;
  const [kind, slug, ...rest] = everything ? path.slice(1) : path;
  const catalogue = { locale, everything };

  if (kind === undefined) {
    return { page: 'index', tab: 'artists', ...catalogue };
  }

  if (slug !== undefined && rest.length === 0) {
    if (kind === ARTISTS_SEGMENT) {
      return { page: 'artist', artist: artistBySlug(slug), ...catalogue };
    }
    if (kind === ALBUMS_SEGMENT) {
      return {
        page: 'album',
        album: oneOf(MUSIC_ALBUM_SLUGS, slug),
        ...catalogue,
      };
    }
    if (kind === SONGS_SEGMENT && !everything) {
      return { page: 'song', slug, locale };
    }
  }

  if (slug === undefined) {
    const tab = tabBySegment(kind);

    if (tab !== undefined) return { page: 'index', tab, ...catalogue };
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
 * One catalogue's pages: its index in each tab, and every artist and album with
 * a song in it — so an artist or album whose songs are all hidden has no public
 * page.
 */
function cataloguePages(catalogue: WithEverything): Addressed[] {
  const songs = catalogueSongs(catalogue);

  return [
    ...CATALOGUE_TABS.map(
      (tab): Addressed =>
        (locale) =>
          tabPath(tab, catalogue, locale),
    ),
    ...catalogueArtists(songs).map(
      (artist): Addressed =>
        (locale) =>
          artistPath(artist, catalogue, locale),
    ),
    ...catalogueAlbums(songs).map(
      (album): Addressed =>
        (locale) =>
          albumPath(album, catalogue, locale),
    ),
  ];
}

/** Every address the music section answers, as the catch-all spells them. */
export function musicSegmentParams(): WithOptionalMusicSegments[] {
  const pages: Addressed[] = [
    ...cataloguePages({ everything: false }),
    ...cataloguePages({ everything: true }),
    ...listSongPages().map((page) => songPage(page)),
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
 * The public catalogue's pages, one address per language and not the alias —
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

  return [...cataloguePages({ everything: false }), ...releasePages].flatMap(
    (page) => LOCALES.map((locale) => page(locale)),
  );
}
