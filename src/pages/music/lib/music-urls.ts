import {
  MUSIC_PROJECT_SLUGS,
  type MusicAlbum,
  type MusicProject,
} from '@/shared/config';
import {
  collectionRoute,
  documentRoute,
  localizedRoute,
} from '@/shared/content';
import type { Locale } from '@/shared/i18n';

/**
 * The segment that turns any catalogue page into the whole catalogue's, hidden
 * songs included — linked from nowhere public and not indexed, for the author to
 * see what the public pages leave out.
 */
export const EVERYTHING_SEGMENT = 'all';

export const ARTISTS_SEGMENT = 'artists';

export const ALBUMS_SEGMENT = 'albums';

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
