/**
 * The releases a song can belong to. A registry rather than a collection: an
 * album has a name in each language and an artist, and its page is its songs
 * in track order, so there is no prose of its own to author. The slug is the
 * album page's address under `/music/albums/`.
 */

// `scripts/scaffold-song.ts` imports this module under tsx: the next-intl-free
// leaf, never the `@/shared/i18n` barrel.
import { inLocale, type Locale, type Localizable } from '@/shared/i18n/locales';

import type { MusicProject } from './music-projects';

export const MUSIC_ALBUM_SLUGS = [
  'ctfu',
  'vagabond',
  'divine',
  'ghosts',
  'pschpthy',
  'nsfl',
  'stories',
  'papa-reka',
  'rus',
  'dng',
  'ignite',
  'nursery',
  'prototypes',
  'nikogo',
  'polzat',
] as const;

export type MusicAlbum = (typeof MUSIC_ALBUM_SLUGS)[number];

type MusicAlbumRecord = {
  /**
   * What the release is called — once, or per language where one release went
   * out under two names: `Vagabond` to the Western services and
   * `Скиталец: по следам Конюхова` to the Russian ones.
   */
  title: Localizable;
  /** Whose release it is, which can differ from the song's own billing. */
  artist: Localizable<MusicProject>;
};

const MUSIC_ALBUMS: Record<MusicAlbum, MusicAlbumRecord> = {
  ctfu: {
    title: 'Cheer The Fuck Up',
    artist: 'GENERATED',
  },
  vagabond: {
    title: { en: 'Vagabond', ru: 'Скиталец: по следам Конюхова' },
    artist: { en: 'GENERATED', ru: 'Полуживые' },
  },
  divine: { title: 'Divine Discontent', artist: 'GENERATED' },
  ghosts: { title: 'Ghosts of Flesh', artist: 'GENERATED' },
  pschpthy: { title: 'PSCHPTHY', artist: 'GENERATED' },
  nsfl: { title: 'Not Safe for Life', artist: 'GENERATED' },
  stories: { title: 'Let the Stories Spin', artist: 'GENERATED' },
  'papa-reka': { title: 'Папа-река', artist: 'Полуживые' },
  rus: { title: 'Кому на Руси жить хорошо', artist: 'Полуживые' },
  dng: {
    title: 'Пять романсов, два сонета и один реквием',
    artist: 'Дамы и господа',
  },
  ignite: { title: 'Ignite', artist: 'Yoohie' },
  nursery: {
    title: 'Nursery Rhymes for the Jilted Generation',
    artist: 'GENERATED',
  },
  prototypes: { title: 'Prototypes', artist: 'GENERATED' },
  nikogo: { title: 'Ни для кого и для всех', artist: 'Грёбаный бал' },
  polzat: { title: 'Сильней любви', artist: 'Грёбаный бал' },
};

export function albumTitle(album: MusicAlbum, locale: Locale): string {
  return inLocale(MUSIC_ALBUMS[album].title, locale);
}

export function albumArtist(album: MusicAlbum, locale: Locale): MusicProject {
  return inLocale(MUSIC_ALBUMS[album].artist, locale);
}
