import 'server-only';

import { z } from 'zod';

import { MUSIC_ALBUM_SLUGS, MUSIC_PROJECT_NAMES } from '@/shared/config';
import { byLocale } from '@/shared/i18n';

// The leaf rather than the barrel: `shared/content` registers this schema, so
// entering it by its barrel would close an import cycle at module evaluation.
import {
  baseFrontmatterSchema,
  localizedTextSchema,
} from '../content/frontmatter';

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
  'instrumental',
] as const;

export type SongLanguage = (typeof SONG_LANGUAGES)[number];

export type SungLanguage = Exclude<SongLanguage, 'instrumental'>;

const songLanguageSchema = z.enum(SONG_LANGUAGES);

const sungLanguageSchema = songLanguageSchema.exclude(['instrumental']);

/** A song's strings in one locale: the document's own, and three only a song has. */
const songTextSchema = localizedTextSchema.extend({
  /**
   * The title in this locale's letters — Latin under `en`, Cyrillic under `ru`.
   * The page shows it only where the title is in a script its reader does not
   * read, so a Russian title wants one under `en` and none under `ru`.
   */
  transliteration: z.string().min(1).optional(),
  /** The title in this locale's language, where the title is in another. */
  titleTranslation: z.string().min(1).optional(),
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
  lyrics: z.array(z.string().min(1)).min(1).optional(),
  music: z.array(z.string().min(1)).min(1).optional(),
});

/** What the player needs of a song, and all it needs. */
const playableSchema = z.object({
  /**
   * The master, played as-is: a URL, or a site-root path for one the site
   * hosts itself because no repository holds it. One field, not a lossless/lossy
   * pair: a song has one master, so a second would be the same file twice.
   */
  audio: z.union([z.url(), z.string().regex(/^\/(?!\/)/)]),
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
    album: z.enum(MUSIC_ALBUM_SLUGS).nullable(),
    /**
     * Its number on that release — required there and refused on a single, so
     * an album lists in the order it was released in. Numbers may skip: a
     * release can carry a song the catalogue has no master for.
     */
    track: z.number().int().positive().optional(),
    /** What the title is in, where that is not the language sung first. */
    titleLanguage: sungLanguageSchema.optional(),
    credits: creditsSchema.optional(),
    /** Track id, where the song is also on Spotify. */
    spotify: z.string().min(1).optional(),
  });

/**
 * One file per song, both languages in it: the language-agnostic half — dates,
 * masters, credits, the words — is the bigger half, so a file per locale would
 * duplicate most of it. A key per locale, each required, which is what makes it
 * exhaustive: a document carrying `en` and no `ru` fails the build instead of
 * publishing a half-translated catalogue quietly.
 */
export const songFrontmatterSchema = songFieldsSchema
  .extend(byLocale(() => songTextSchema))
  .refine(({ album, track }) => (album === null) === (track === undefined), {
    message:
      'A song on an album takes a track number, and a single takes none.',
    path: ['track'],
  });

export type SongFrontmatter = z.infer<typeof songFrontmatterSchema>;
