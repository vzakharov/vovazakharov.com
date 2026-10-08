/**
 * The releases a song can belong to. A registry rather than a collection: an
 * album has a name in each language and an artist, and its page is its songs
 * in track order, so there is no prose of its own to author.
 */

import { inLocale, type Locale, type Localizable } from '@/shared/i18n';
import type { MusicAlbum, MusicProject } from '@/shared/song';

type MusicAlbumRecord = {
  /**
   * What the release is called — once, or per language where one release went
   * out under two names: `Vagabond` to the Western services and
   * `Скиталец: по следам Конюхова` to the Russian ones.
   */
  title: Localizable;
  /** Whose release it is, which can differ from the song's own billing. */
  artist: Localizable<MusicProject>;
  /**
   * Whether the release has cover art, at `albumCover`'s path: a 600px square
   * cut from the master in its `vovas-music` repository, or Apple Music's where
   * the repository holds none — small enough for a grid of them.
   */
  cover?: true;
};

const MUSIC_ALBUMS: Record<MusicAlbum, MusicAlbumRecord> = {
  ctfu: {
    title: 'Cheer The Fuck Up',
    artist: 'GENERATED',
    cover: true,
  },
  vagabond: {
    title: { en: 'Vagabond', ru: 'Скиталец: по следам Конюхова' },
    artist: { en: 'GENERATED', ru: 'Полуживые' },
    cover: true,
  },
  divine: { title: 'Divine Discontent', artist: 'GENERATED', cover: true },
  ghosts: { title: 'Ghosts of Flesh', artist: 'GENERATED', cover: true },
  pschpthy: { title: 'PSCHPTHY', artist: 'GENERATED', cover: true },
  nsfl: { title: 'Not Safe for Life', artist: 'GENERATED', cover: true },
  stories: { title: 'Let the Stories Spin', artist: 'GENERATED', cover: true },
  'papa-reka': { title: 'Папа-река', artist: 'Полуживые', cover: true },
  'papa-more': { title: 'Папа-море', artist: 'Полуживые' },
  rus: { title: 'Кому на Руси жить хорошо', artist: 'Полуживые', cover: true },
  dng: {
    title: 'Пять романсов, два сонета и один реквием',
    artist: 'Дамы и господа',
    cover: true,
  },
  ignite: { title: 'Ignite', artist: 'Yoohie', cover: true },
  'old-shite': { title: 'We Made AI Sing Our Old Shite', artist: 'Yoohie' },
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

/** The cover's site-root path, under `apps/vova/public/`. */
export function albumCover(album: MusicAlbum): string | undefined {
  return MUSIC_ALBUMS[album].cover && `/music/assets/covers/${album}.jpg`;
}
