import 'server-only';

import { SITE_CONFIG } from '@/shared/config';
import { loadMessages, type Locale } from '@/shared/i18n';
import {
  constructMetadata,
  localizedAddresses,
} from '@/shared/seo/index.server-only';

import { albumArtist, albumTitle } from './albums';
import type {
  AlbumPageProps,
  ArtistPageProps,
  CataloguePageProps,
} from './music-route-params';
import { albumPath, artistPath, indexPath } from './music-urls';
import { projectName } from './projects';

/**
 * A catalogue page, in one language, deferring to the addressed one as the
 * CV's rungs do. The whole catalogue's pages are kept out of search, as the
 * hidden songs on them are.
 */
function catalogueMetadata(
  { locale, everything }: CataloguePageProps,
  title: string,
  description: string,
  path: (locale?: Locale) => string,
) {
  return constructMetadata({
    title: `${title} - ${SITE_CONFIG.name}`,
    description,
    path: path(locale),
    ...localizedAddresses(path, locale),
    hidden: everything,
  });
}

export function generateMusicMetadata(page: CataloguePageProps) {
  const { metaTitle, metaDescription } = loadMessages(page.locale).music;

  return catalogueMetadata(page, metaTitle, metaDescription, (locale) =>
    indexPath(page, locale),
  );
}

export function generateArtistMetadata(page: ArtistPageProps) {
  const name = projectName(page.artist, page.locale);
  const { artistDescription } = loadMessages(page.locale).music;

  return catalogueMetadata(
    page,
    name,
    artistDescription.replace('{artist}', name),
    (locale) => artistPath(page.artist, page, locale),
  );
}

export function generateAlbumMetadata(page: AlbumPageProps) {
  const name = albumTitle(page.album, page.locale);
  const { albumDescription } = loadMessages(page.locale).music;

  return catalogueMetadata(
    page,
    name,
    albumDescription
      .replace('{album}', name)
      .replace(
        '{artist}',
        projectName(albumArtist(page.album, page.locale), page.locale),
      ),
    (locale) => albumPath(page.album, page, locale),
  );
}
