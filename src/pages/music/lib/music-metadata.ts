import 'server-only';

import { SITE_CONFIG } from '@/shared/config';
import { loadMessages, type Locale } from '@/shared/i18n';
import {
  constructMetadata,
  localizedAddresses,
} from '@/shared/seo/index.server-only';

import { albumArtist, albumCover, albumTitle } from './albums';
import type {
  AlbumPageProps,
  ArtistPageProps,
  CataloguePageProps,
  IndexPageProps,
} from './music-route-params';
import { albumPath, artistPath, tabLabels, tabPath } from './music-urls';
import { artistCard, MUSIC_COLLAGE, pictureCard } from './pictures';
import { projectName } from './projects';
import { catalogueSongs } from './songs';

/**
 * A catalogue page, in one language, deferring to the addressed one as the
 * CV's rungs do. The whole catalogue's pages are kept out of search, as the
 * hidden songs on them are.
 */
function catalogueMetadata(
  { locale, everything }: CataloguePageProps,
  title: string,
  ogTitle: string,
  description: string,
  path: (locale?: Locale) => string,
  picture?: string,
) {
  return constructMetadata({
    title: `${title} - ${SITE_CONFIG.name}`,
    ogTitle,
    description,
    path: path(locale),
    ...localizedAddresses(path, locale),
    ...pictureCard(picture),
    hidden: everything,
  });
}

/** What a music page's unfurl is titled, naming what it plays. */
export function listenTitle(name: string, locale: Locale): string {
  return loadMessages(locale).music.ogTitle.replace('{name}', name);
}

/** The index, titled by its tab where that is not the artists it opens on. */
export function generateMusicMetadata(page: IndexPageProps) {
  const { metaTitle, metaDescription, ogTitleIndex } = loadMessages(
    page.locale,
  ).music;

  return catalogueMetadata(
    page,
    page.tab === 'artists'
      ? metaTitle
      : `${metaTitle}: ${tabLabels(page.locale)[page.tab]}`,
    ogTitleIndex,
    metaDescription,
    (locale) => tabPath(page.tab, page, locale),
    MUSIC_COLLAGE,
  );
}

export function generateArtistMetadata(page: ArtistPageProps) {
  const name = projectName(page.artist, page.locale);
  const { artistDescription } = loadMessages(page.locale).music;

  return catalogueMetadata(
    page,
    name,
    listenTitle(name, page.locale),
    artistDescription.replace('{artist}', name),
    (locale) => artistPath(page.artist, page, locale),
    artistCard(page.artist, page.locale, catalogueSongs(page)),
  );
}

export function generateAlbumMetadata(page: AlbumPageProps) {
  const name = albumTitle(page.album, page.locale);
  const { albumDescription } = loadMessages(page.locale).music;

  return catalogueMetadata(
    page,
    name,
    listenTitle(name, page.locale),
    albumDescription
      .replace('{album}', name)
      .replace(
        '{artist}',
        projectName(albumArtist(page.album, page.locale), page.locale),
      ),
    (locale) => albumPath(page.album, page, locale),
    albumCover(page.album),
  );
}
