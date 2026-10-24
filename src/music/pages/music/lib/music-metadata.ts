import 'server-only';

import { SITE_CONFIG } from '@/kernel/shared/config';
import type { Locale, WithLocale } from '@/kernel/shared/i18n';
import {
  constructMetadata,
  localizedAddresses,
} from '@/kernel/shared/seo/index.server-only';

import { spelledText, textHook } from '@/music/shared/catalogue';
import { messages } from '@/music/shared/i18n';

import { albumArtist, albumCover, albumTitle } from './albums';
import { projectName } from './artists';
import { albumText, artistText } from './catalogue-text';
import type {
  AlbumPageProps,
  ArtistPageProps,
  IndexPageProps,
} from './music-route-params';
import { albumPath, artistPath, tabLabels, tabPath } from './music-urls';
import { artistCard, MUSIC_COLLAGE, pictureCard } from './pictures';
import { catalogueSongs } from './songs';

/**
 * A catalogue page, in one language, deferring to the addressed one as the
 * CV's rungs do.
 */
function catalogueMetadata(
  { locale }: WithLocale,
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
  });
}

/** What a music page's unfurl is titled, naming what it plays. */
export function listenTitle(name: string, locale: Locale): string {
  return messages(locale).ogTitle.replace('{name}', name);
}

/** The index, titled by its tab where that is not the artists it opens on. */
export function generateMusicMetadata(page: IndexPageProps) {
  const { metaTitle, metaDescription, ogTitleIndex } = messages(page.locale);

  return catalogueMetadata(
    page,
    page.tab === 'artists'
      ? metaTitle
      : `${metaTitle}: ${tabLabels(page.locale)[page.tab]}`,
    ogTitleIndex,
    metaDescription,
    (locale) => tabPath(page.tab, locale),
    MUSIC_COLLAGE,
  );
}

export function generateArtistMetadata(page: ArtistPageProps) {
  const name = spelledText(projectName(page.artist, page.locale));
  const { artistDescription } = messages(page.locale);

  return catalogueMetadata(
    page,
    name,
    listenTitle(name, page.locale),
    textHook(
      artistText(page.artist, page.locale).hook ??
        artistDescription.replace('{artist}', name),
    ),
    (locale) => artistPath(page.artist, locale),
    artistCard(page.artist, page.locale, catalogueSongs()),
  );
}

export function generateAlbumMetadata(page: AlbumPageProps) {
  const name = spelledText(albumTitle(page.album, page.locale));
  const { albumDescription } = messages(page.locale);

  return catalogueMetadata(
    page,
    name,
    listenTitle(name, page.locale),
    textHook(
      albumText(page.album, page.locale).hook ??
        albumDescription
          .replace('{album}', name)
          .replace(
            '{artist}',
            spelledText(
              projectName(albumArtist(page.album, page.locale), page.locale),
            ),
          ),
    ),
    (locale) => albumPath(page.album, locale),
    albumCover(page.album),
  );
}
