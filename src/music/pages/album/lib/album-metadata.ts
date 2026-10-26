import 'server-only';

import type { WithLocale } from '@/kernel/shared/i18n';

import {
  albumInfo,
  albumPath,
  type MusicAlbum,
  spelledText,
  textHook,
} from '@/music/shared/catalogue';
import { messages } from '@/music/shared/i18n';
import { catalogueMetadata, listenTitle } from '@/music/shared/seo';

export type AlbumPageProps = WithLocale & { album: MusicAlbum };

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
