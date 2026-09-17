/**
 * The releases a song can belong to. A registry rather than a collection:
 * an album has a name in each language and nothing else to route to yet, so a
 * song page can say where a song came from without an album page existing.
 */

import type { Locale } from '@/shared/i18n';

import type { MusicProject } from './music-projects';

export const MUSIC_ALBUM_SLUGS = ['ctfu', 'vagabond'] as const;

export type MusicAlbum = (typeof MUSIC_ALBUM_SLUGS)[number];

export type MusicAlbumRecord = {
  /**
   * What the release is called in each language. Both are the same release —
   * `Vagabond` went to the Western services and `Скиталец: по следам Конюхова`
   * to the Russian ones, under different artist names.
   */
  title: Record<Locale, string>;
  /** Whose release it is, which can differ from the song's own billing. */
  artist: Record<Locale, MusicProject>;
};

export const MUSIC_ALBUMS: Record<MusicAlbum, MusicAlbumRecord> = {
  ctfu: {
    title: { en: 'Cheer The Fuck Up', ru: 'Cheer The Fuck Up' },
    artist: { en: 'GENERATED', ru: 'GENERATED' },
  },
  vagabond: {
    title: { en: 'Vagabond', ru: 'Скиталец: по следам Конюхова' },
    artist: { en: 'GENERATED', ru: 'Полуживые' },
  },
};
