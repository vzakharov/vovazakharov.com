import 'server-only';

import type { WithLocale } from '@/kernel/shared/i18n';

import {
  artistCard,
  artistPath,
  catalogueInfo,
  type MusicProject,
  spelledText,
  textHook,
} from '@/music/shared/catalogue';
import { messages } from '@/music/shared/i18n';
import { catalogueMetadata, listenTitle } from '@/music/shared/seo';

export type ArtistPageProps = WithLocale & { artist: MusicProject };

export function generateArtistMetadata(page: ArtistPageProps) {
  const {
    name: spelled,
    text,
    picture,
  } = catalogueInfo().artist(page.artist, page.locale);
  const name = spelledText(spelled);
  const { artistDescription } = messages(page.locale);

  return catalogueMetadata(
    page,
    name,
    listenTitle(name, page.locale),
    textHook(text.hook ?? artistDescription.replace('{artist}', name)),
    (locale) => artistPath(page.artist, locale),
    artistCard(page.artist, picture),
  );
}
