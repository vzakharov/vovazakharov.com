import 'server-only';

import { z } from 'zod';

import { byLocale, type Locale, LOCALES } from '@/shared/i18n';

// The leaf rather than the barrel: `shared/content` registers this schema, so
// entering it by its barrel would close an import cycle at module evaluation.
import { baseFrontmatterSchema } from '../content/frontmatter';
import { MUSIC_ALBUM_SLUGS, MUSIC_PROJECT_NAMES } from './names';
import { creditedNameSchema } from './people';
import { songDateSchema } from './song-date';

/** Whether the song is released or still being worked on. */
const SONG_STATUSES = ['done', 'wip'] as const;

/**
 * What the vocal is in — `instrumental` where there is none. Beyond the site's
 * two locales a song can be sung in a language nobody reads the site in; its
 * words then show with a crib in the reader's.
 */
const SONG_LANGUAGES = [
  'ru',
  'en',
  'tt',
  'ar',
  'pl',
  'la',
  'zh',
  'fr',
  'el',
  'de',
  'it',
  'es',
  // Russisch: Russian spelled the German way, a language of one song — Russian
  // in Latin letters, the private-use subtag naming it. Lowercase, as a
  // section marker takes it; BCP 47 ignores case.
  'ru-latn-x-russisch',
  'instrumental',
] as const;

type SongLanguage = (typeof SONG_LANGUAGES)[number];

export type SungLanguage = Exclude<SongLanguage, 'instrumental'>;

const songLanguageSchema = z.enum(SONG_LANGUAGES);

const sungLanguageSchema = songLanguageSchema.exclude(['instrumental']);

/** What a locale's reader is told of a title it keeps but may not understand. */
const titleGlossSchema = z.object({
  /** The title in this locale's language, where the title is in another. */
  translation: z.string().min(1),
});

export type TitleGloss = z.infer<typeof titleGlossSchema>;

/** A song's, an album's or an artist's hook in one locale, and its page's meta description. */
const hookedSchema = z.object({ hook: z.string().min(1).optional() });

/**
 * A hook in one locale and not the other fails the build instead of publishing
 * a half-translated catalogue quietly.
 */
const HOOK_IN_EVERY_LOCALE_OR_NONE = [
  (page: Record<Locale, z.infer<typeof hookedSchema>>) =>
    new Set(LOCALES.map((locale) => page[locale].hook === undefined)).size ===
    1,
  { message: 'A hook is written in every locale or in none.' },
] as const;

/**
 * An album's or an artist's frontmatter, above the text its page sets: a key
 * per locale, as a song's.
 */
export const catalogueFrontmatterSchema = z
  .object(byLocale(() => hookedSchema.default({})))
  .refine(...HOOK_IN_EVERY_LOCALE_OR_NONE);

/** A song's strings in one locale. */
const songTextSchema = hookedSchema.extend({
  /**
   * Absent where the locale keeps the song's own title, as most do. A string
   * is the name the song goes by in this locale instead — `breathe` is _Breathe_
   * and _Повелитель ветра_ — and a gloss keeps the title and explains it.
   */
  title: z.union([z.string().min(1), titleGlossSchema]).optional(),
  /**
   * What the crib beside the words is, in place of the stock line — whose
   * translation it is, or that the column is the original. One line of markdown.
   */
  cribNote: z.string().min(1).optional(),
});

export type SongText = z.infer<typeof songTextSchema>;

/**
 * Who wrote which half, in contribution order rather than billing order. Absent
 * means the author alone, which is the common case and not worth restating.
 */
const creditsSchema = z.object({
  lyrics: z.array(creditedNameSchema).min(1).optional(),
  music: z.array(creditedNameSchema).min(1).optional(),
});

const albumSchema = z.enum(MUSIC_ALBUM_SLUGS);

/**
 * A song's number on a release — required there and refused on a single, so
 * an album lists in the order it was released in. Numbers may skip: a release
 * can carry a song the catalogue has no master for.
 */
const trackSchema = z.number().int().positive();

/** Where on a release a song sits. */
const placementSchema = z.object({ album: albumSchema, track: trackSchema });

export type AlbumPlacement = z.infer<typeof placementSchema>;

/** A URL, or a site-root path for a file the site hosts itself. */
const mediaSourceSchema = z.union([z.url(), z.string().regex(/^\/(?!\/)/)]);

/** What the player needs of a song, and all it needs. */
const playableSchema = z.object({
  /**
   * The master, played as-is — site-hosted where no repository holds it. One
   * field, not a lossless/lossy pair: a song has one master, so a second would
   * be the same file twice.
   */
  audio: mediaSourceSchema,
  /**
   * The master's duration, read off its own FLAC header by the scaffolder. A
   * cache, and safe to be one because a master never changes — it is what lets
   * the track list render complete HTML with nothing fetched in the browser.
   */
  seconds: z.number().int().positive(),
  /** Read off the 🅴 in the master's file name by the scaffolder. */
  explicit: z.boolean().default(false),
});

export type Playable = z.infer<typeof playableSchema>;

const songFieldsSchema = baseFrontmatterSchema
  .extend(playableSchema.shape)
  .extend({
    date: songDateSchema,
    /**
     * The song's own name — in the language it is sung in, or the English one
     * where neither locale's is that. A locale states one only where it differs.
     */
    title: z.string().min(1),
    status: z.enum(SONG_STATUSES),
    /**
     * One language, or a list where a song is sung in several — the main one
     * first, whose words the page shows.
     */
    language: z
      .union([songLanguageSchema, z.array(songLanguageSchema).min(1)])
      .transform((language) =>
        Array.isArray(language) ? language : [language],
      ),
    /**
     * The artist first, whoever is featured after it — a feature meaning the song
     * can be shown to the people the other project is shown to.
     */
    project: z.array(z.enum(MUSIC_PROJECT_NAMES)).min(1),
    /** Its repository under the `vovas-music` organization; absent where none holds it. */
    repo: z.string().min(1).optional(),
    /**
     * The release it came out on; `null` for a single. Required, so a song whose
     * release nobody has decided yet cannot pass for a single by omission.
     */
    album: albumSchema.nullable(),
    track: trackSchema.optional(),
    /**
     * The other releases the same master went out on — a maxi-single, a
     * compilation — each at its own number there. The song's page and its
     * links stay one; `album` remains the release it is filed under.
     */
    alsoOn: z.array(placementSchema).min(1).optional(),
    /** What the title is in, where that is not the language sung first. */
    titleLanguage: sungLanguageSchema.optional(),
    /**
     * The title in Latin letters, written by hand: for a script no rule
     * romanizes (`Mithqāl`), or a name with an established Latin spelling.
     */
    titleLatin: z.string().min(1).optional(),
    /**
     * The words keep their script beside the romanization rather than giving
     * way to it — a sacred text, whose letters are not to be replaced. The
     * title is a name, and switches as any other does.
     */
    keepsScript: z.boolean().default(false),
    credits: creditsSchema.optional(),
    video: z
      .object({
        src: mediaSourceSchema,
        /**
         * Where the master's start falls on the video's timeline, in seconds —
         * negative where the video starts after it. A video is cut on its own,
         * so opening it mid-song lands on the same moment only with this.
         * `scripts/song-intake/video-offset.py` measures it.
         */
        offsetSeconds: z.number(),
      })
      .optional(),
    /** Track id, where the song is also on Spotify. */
    spotify: z.string().min(1).optional(),
  });

/**
 * One file per song, both languages in it: the language-agnostic half — dates,
 * masters, credits, the words — is the bigger half, so a file per locale would
 * duplicate most of it. A key per locale, absent where the locale has nothing to
 * say.
 */
export const songFrontmatterSchema = songFieldsSchema
  .extend(byLocale(() => songTextSchema.default({})))
  .refine(...HOOK_IN_EVERY_LOCALE_OR_NONE)
  .refine(({ album, track }) => (album === null) === (track === undefined), {
    message:
      'A song on an album takes a track number, and a single takes none.',
    path: ['track'],
  })
  .refine(
    ({ album, alsoOn = [] }) => {
      const albums = [album, ...alsoOn.map((placement) => placement.album)];

      return new Set(albums).size === albums.length;
    },
    {
      message:
        'A song is on each release once: `alsoOn` names neither its own `album` nor one release twice.',
      path: ['alsoOn'],
    },
  );

export type SongFrontmatter = z.infer<typeof songFrontmatterSchema>;
