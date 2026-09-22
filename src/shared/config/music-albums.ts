/**
 * The releases a song can belong to. A registry rather than a collection:
 * an album has a name in each language and nothing else to route to yet, so a
 * song page can say where a song came from without an album page existing.
 */

import type { Localizable } from '@/shared/i18n';

import type { MusicProject } from './music-projects';

export const MUSIC_ALBUM_SLUGS = ['ctfu', 'vagabond'] as const;

export type MusicAlbum = (typeof MUSIC_ALBUM_SLUGS)[number];

export type MusicAlbumRecord = {
  /**
   * What the release is called — once, or per language where one release went
   * out under two names: `Vagabond` to the Western services and
   * `Скиталец: по следам Конюхова` to the Russian ones.
   */
  title: Localizable;
  /** Whose release it is, which can differ from the song's own billing. */
  artist: Localizable<MusicProject>;
};

export const MUSIC_ALBUMS: Record<MusicAlbum, MusicAlbumRecord> = {
  ctfu: {
    title: 'Cheer The Fuck Up',
    artist: 'GENERATED',
  },
  vagabond: {
    title: { en: 'Vagabond', ru: 'Скиталец: по следам Конюхова' },
    artist: { en: 'GENERATED', ru: 'Полуживые' },
  },
};
