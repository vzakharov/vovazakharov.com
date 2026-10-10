/**
 * The releases a song can belong to. A registry rather than a collection: an
 * album's names and artist are typed values keyed by the enum a song's `album`
 * names, not frontmatter. Its prose, where it has any, is a markdown file at
 * its page's route plus `.md`, which `albumText` reads.
 */

import { inLocale, type Locale, type Localizable } from '@/shared/i18n';
import type {
  MusicAlbum,
  MusicProject,
  TitleGloss,
} from '@/shared/music-catalogue';

import { titleGloss } from './title-gloss';

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
   * cut from the master in its `vovas-music` repository, or Apple Music's or
   * SoundCloud's where the repository holds none — small enough for a grid of
   * them. A release with no artwork yet has one drawn: the SVG of the same stem
   * beside it, which `pnpm music:covers` renders.
   */
  cover?: true;
  /** What each locale tells its reader about the title, as a song's gloss does. */
  gloss?: Partial<Record<Locale, TitleGloss>>;
};

const MUSIC_ALBUMS: Record<MusicAlbum, MusicAlbumRecord> = {
  ctfu: {
    title: 'Cheer The Fuck Up',
    artist: 'GENERATED',
    cover: true,
    gloss: { ru: { translation: 'Взбодрись, блядь' } },
  },
  vagabond: {
    title: { en: 'Vagabond', ru: 'Скиталец: по следам Конюхова' },
    artist: { en: 'GENERATED', ru: 'Полуживые' },
    cover: true,
  },
  'divine-discontent': {
    title: 'Divine Discontent',
    artist: 'GENERATED',
    cover: true,
    gloss: { ru: { translation: 'Божественное недовольство' } },
  },
  'ghosts-of-flesh': {
    title: 'Ghosts of Flesh',
    artist: 'GENERATED',
    cover: true,
    gloss: { ru: { translation: 'Призраки плоти' } },
  },
  pschpthy: {
    title: 'PSCHPTHY',
    artist: 'GENERATED',
    cover: true,
    gloss: { ru: { translation: 'Психопатия' } },
  },
  nsfl: {
    title: 'Not Safe for Life',
    artist: 'GENERATED',
    cover: true,
    gloss: { ru: { translation: 'Опасно для жизни' } },
  },
  'let-the-stories-spin': {
    title: 'Let the Stories Spin',
    artist: 'GENERATED',
    cover: true,
    gloss: { ru: { translation: 'Пусть сплетаются истории' } },
  },
  'father-river': {
    title: 'Папа-река',
    artist: 'Полуживые',
    cover: true,
    gloss: {
      en: { transliteration: 'Papa-reka', translation: 'Father River' },
    },
  },
  hamlet: {
    title: 'Гамлет',
    artist: 'Полуживые',
    cover: true,
    gloss: { en: { transliteration: 'Gamlet', translation: 'Hamlet' } },
  },
  'father-sea': {
    title: 'Папа-море',
    artist: 'Полуживые',
    cover: true,
    gloss: { en: { transliteration: 'Papa-more', translation: 'Father Sea' } },
  },
  'who-is-happy-in-russia': {
    title: 'Кому на Руси жить хорошо',
    artist: 'Полуживые',
    cover: true,
    gloss: {
      en: {
        transliteration: 'Komu na Rusi zhit khorosho',
        translation: 'Who Is Happy in Russia?',
      },
    },
  },
  'five-romances': {
    title: 'Пять романсов, два сонета и один реквием',
    artist: 'Дамы и господа',
    cover: true,
    gloss: {
      en: {
        transliteration: 'Pyat romansov, dva soneta i odin rekviem',
        translation: 'Five Romances, Two Sonnets and One Requiem',
      },
    },
  },
  ignite: {
    title: 'Ignite',
    artist: 'Yoohie',
    cover: true,
    gloss: { ru: { translation: 'Зажигаем' } },
  },
  'old-shite': {
    title: 'We Made AI Sing Our Old Shite',
    artist: 'Yoohie',
    cover: true,
    gloss: {
      ru: { translation: 'Мы заставили ИИ спеть наше старое дерьмо' },
    },
  },
  'nursery-rhymes': {
    title: 'Nursery Rhymes for the Jilted Generation',
    artist: 'GENERATED',
    cover: true,
    gloss: { ru: { translation: 'Детские стишки для брошенного поколения' } },
  },
  prototypes: {
    title: 'Prototypes',
    artist: 'GENERATED',
    cover: true,
    gloss: { ru: { translation: 'Прототипы' } },
  },
  'for-none-and-for-all': {
    title: 'Ни для кого и для всех',
    artist: 'Грёбаный бал',
    cover: true,
    gloss: {
      en: {
        transliteration: 'Ni dlya kogo i dlya vsekh',
        translation: 'For None and for All',
      },
    },
  },
  'stronger-than-love': {
    title: 'Сильней любви',
    artist: 'Грёбаный бал',
    cover: true,
    gloss: {
      en: {
        transliteration: 'Silney lyubvi',
        translation: 'Stronger Than Love',
      },
    },
  },
  wings: {
    title: 'Крылья',
    artist: 'за/обложкой',
    cover: true,
    gloss: { en: { transliteration: 'Krylya', translation: 'Wings' } },
  },
  'punctuation-marks': {
    title: 'Знаки препинания',
    artist: 'за/обложкой',
    cover: true,
    gloss: {
      en: {
        transliteration: 'Znaki prepinaniya',
        translation: 'Punctuation Marks',
      },
    },
  },
};

export function albumTitle(album: MusicAlbum, locale: Locale): string {
  return inLocale(MUSIC_ALBUMS[album].title, locale);
}

export function albumGloss(album: MusicAlbum, locale: Locale): TitleGloss {
  return titleGloss(
    {
      title: albumTitle(album, locale),
      gloss: MUSIC_ALBUMS[album].gloss?.[locale],
    },
    locale,
  );
}

export function albumArtist(album: MusicAlbum, locale: Locale): MusicProject {
  return inLocale(MUSIC_ALBUMS[album].artist, locale);
}

/** The cover's site-root path, under `apps/vova/public/`. */
export function albumCover(album: MusicAlbum): string | undefined {
  return MUSIC_ALBUMS[album].cover && `/music/assets/covers/${album}.jpg`;
}
