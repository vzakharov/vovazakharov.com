import { documentRoute, localizedRoute } from '@/shared/content';
import { loadMessages, type Locale } from '@/shared/i18n';
import {
  MUSIC_ROUTE,
  type MusicAlbum,
  type MusicProject,
} from '@/shared/music-catalogue';

import { MUSIC_PROJECT_SLUGS } from './projects';

export const ARTISTS_SEGMENT = 'artists';

export const ALBUMS_SEGMENT = 'albums';

export const SONGS_SEGMENT = 'songs';

export const RADIO_SEGMENT = 'radio';

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
 * The index. The locale-less form is an alias of the default language's page
 * rather than a page of its own, which is what lets `/music` stay the address
 * anyone links to.
 */
export function musicPath(locale?: Locale): string {
  return localizedRoute(MUSIC_ROUTE, locale);
}

export function tabPath(tab: CatalogueTab, locale?: Locale): string {
  const segment = TAB_SEGMENTS[tab];

  return segment === undefined
    ? musicPath(locale)
    : localizedRoute(`${MUSIC_ROUTE}/${segment}`, locale);
}

export function artistPath(artist: MusicProject, locale?: Locale): string {
  return localizedRoute(
    `${MUSIC_ROUTE}/${ARTISTS_SEGMENT}/${MUSIC_PROJECT_SLUGS[artist]}`,
    locale,
  );
}

export function albumPath(album: MusicAlbum, locale?: Locale): string {
  return localizedRoute(`${MUSIC_ROUTE}/${ALBUMS_SEGMENT}/${album}`, locale);
}

export function radioPath(locale?: Locale): string {
  return localizedRoute(`${MUSIC_ROUTE}/${RADIO_SEGMENT}`, locale);
}

/** One song, in one language — the canonical address its alias defers to. */
export function songPath(slug: string, locale?: Locale): string {
  return localizedRoute(documentRoute('music', slug), locale);
}
