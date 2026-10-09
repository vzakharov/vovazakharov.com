import {
  collectionRoute,
  documentRoute,
  localizedRoute,
} from '@/shared/content';
import { loadMessages, type Locale } from '@/shared/i18n';
import type { MusicAlbum, MusicProject } from '@/shared/music-catalogue';

import { MUSIC_PROJECT_SLUGS } from './projects';

/**
 * The segment that turns any catalogue page into the whole catalogue's, hidden
 * songs included — linked from nowhere public and not indexed, for the author to
 * see what the public pages leave out.
 */
export const EVERYTHING_SEGMENT = 'all';

export const ARTISTS_SEGMENT = 'artists';

export const ALBUMS_SEGMENT = 'albums';

export const SONGS_SEGMENT = 'songs';

/**
 * What the index lists: its artists at the section's own address, and every
 * album or every song one segment down.
 */
export const CATALOGUE_TABS = ['artists', 'albums', 'songs'] as const;

export type CatalogueTab = (typeof CATALOGUE_TABS)[number];

export type WithTab = { tab: CatalogueTab };

const TAB_SEGMENTS: Record<CatalogueTab, string | undefined> = {
  artists: undefined,
  albums: ALBUMS_SEGMENT,
  songs: SONGS_SEGMENT,
};

/** What each tab is called, its heading's word for what it lists. */
export function tabLabels(locale: Locale): Record<CatalogueTab, string> {
  const { artists, albums, title } = loadMessages(locale).music;

  return { artists, albums, songs: title };
}

/** The tab a first segment opens, if it opens one. */
export function tabBySegment(segment: string): CatalogueTab | undefined {
  return CATALOGUE_TABS.find((tab) => TAB_SEGMENTS[tab] === segment);
}

/**
 * Which catalogue a page lists: the public one, or the whole one. A page of the
 * whole catalogue links only within it, so leaving it is a choice.
 */
export type WithEverything = { everything: boolean };

function catalogueRoute({ everything }: WithEverything): string {
  return everything
    ? `${collectionRoute('music')}/${EVERYTHING_SEGMENT}`
    : collectionRoute('music');
}

/**
 * The index. The locale-less form is an alias of the default language's page
 * rather than a page of its own, which is what lets `/music` stay the address
 * anyone links to.
 */
export function indexPath(catalogue: WithEverything, locale?: Locale): string {
  return localizedRoute(catalogueRoute(catalogue), locale);
}

export function tabPath(
  tab: CatalogueTab,
  catalogue: WithEverything,
  locale?: Locale,
): string {
  const segment = TAB_SEGMENTS[tab];

  return segment === undefined
    ? indexPath(catalogue, locale)
    : localizedRoute(`${catalogueRoute(catalogue)}/${segment}`, locale);
}

export function musicPath(locale?: Locale): string {
  return indexPath({ everything: false }, locale);
}

export function artistPath(
  artist: MusicProject,
  catalogue: WithEverything,
  locale?: Locale,
): string {
  return localizedRoute(
    `${catalogueRoute(catalogue)}/${ARTISTS_SEGMENT}/${MUSIC_PROJECT_SLUGS[artist]}`,
    locale,
  );
}

export function albumPath(
  album: MusicAlbum,
  catalogue: WithEverything,
  locale?: Locale,
): string {
  return localizedRoute(
    `${catalogueRoute(catalogue)}/${ALBUMS_SEGMENT}/${album}`,
    locale,
  );
}

/** One song, in one language — the canonical address its alias defers to. */
export function songPath(slug: string, locale?: Locale): string {
  return localizedRoute(documentRoute('music', slug), locale);
}
