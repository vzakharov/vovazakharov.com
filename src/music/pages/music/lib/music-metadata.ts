import 'server-only';

import { SITE_CONFIG } from '@/kernel/shared/config';
import type { Locale, WithLocale } from '@/kernel/shared/i18n';
import {
  constructMetadata,
  localizedAddresses,
} from '@/kernel/shared/seo/index.server-only';

import {
  albumInfo,
  albumPath,
  artistInfo,
  artistPath,
  catalogueInfo,
  MUSIC_COLLAGE,
  pictureCard,
  spelledText,
  tabLabels,
  tabPath,
  textHook,
} from '@/music/shared/catalogue';
import { messages } from '@/music/shared/i18n';

import type {
  AlbumPageProps,
  ArtistPageProps,
  IndexPageProps,
} from './music-route-params';

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
  const { name: spelled, text } = artistInfo(page.artist, page.locale);
  const name = spelledText(spelled);
  const { artistDescription } = messages(page.locale);

  return catalogueMetadata(
    page,
    name,
    listenTitle(name, page.locale),
    textHook(text.hook ?? artistDescription.replace('{artist}', name)),
    (locale) => artistPath(page.artist, locale),
    catalogueInfo().artistCard(page.artist, page.locale),
  );
}

export function generateAlbumMetadata(page: AlbumPageProps) {
  const {
    name: spelled,
    text,
    artist,
    cover,
  } = albumInfo(page.album, page.locale);
  const name = spelledText(spelled);
  const { albumDescription } = messages(page.locale);

  return catalogueMetadata(
    page,
    name,
    listenTitle(name, page.locale),
    textHook(
      text.hook ??
        albumDescription
          .replace('{album}', name)
          .replace('{artist}', spelledText(artist.name)),
    ),
    (locale) => albumPath(page.album, locale),
    cover,
  );
}
