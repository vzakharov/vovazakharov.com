import 'server-only';

import { z } from 'zod';

import { byLocale, type Locale, LOCALES } from '@/kernel/shared/i18n';
import { composeSchemas } from '@/kernel/shared/lib/compose-schemas';

import { baseFrontmatterSchema, type Collection } from '@/blog/shared/content';

import { albumSchema, projectSchema } from './names.ts';
import { creditedNameSchema } from './people.ts';
import { songDateSchema } from './song-date.ts';

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

export type Glossed = { gloss: TitleGloss | undefined };

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
 * A name in one locale: absent where the locale keeps its own, as most do.
 * A string is the name it goes by in this locale instead — `breathe` is
 * _Breathe_ and _Повелитель ветра_ — and a gloss keeps the name and explains it.
 */
const localNameSchema = z.union([z.string().min(1), titleGlossSchema]);

export type LocalName = z.infer<typeof localNameSchema>;

/**
 * An album's frontmatter, a key per locale as a song's. Its slug is its file
 * name, and its cover is `albumCover`'s to find.
 */
export const albumFrontmatterSchema = z
  .object({
    /** What the release is called, in the language it is called in. */
    title: z.string().min(1),
    /** Whose release it is, which can differ from a song's own billing. */
    artist: projectSchema,
    /** The release is still being made, so its songs and their order may change. */
    wip: z.literal(true).optional(),
  })
  .extend(
    byLocale(() =>
      hookedSchema
        .extend({
          title: localNameSchema.optional(),
          /**
           * Whose release it is in this locale, where one release went out
           * under two names: `vagabond` is GENERATED's to the Western
           * services and Полуживые's to the Russian ones.
           */
          artist: projectSchema.optional(),
        })
        .default({}),
    ),
  )
  .refine(...HOOK_IN_EVERY_LOCALE_OR_NONE);

/**
 * An artist's frontmatter, a key per locale as a song's. Its slug is its file
 * name, and its `name` is what a song's `project` bills it by.
 */
export const artistFrontmatterSchema = z
  .object({
    name: projectSchema,
  })
  .extend(
    byLocale(() =>
      hookedSchema.extend({ name: localNameSchema.optional() }).default({}),
    ),
  )
  .refine(...HOOK_IN_EVERY_LOCALE_OR_NONE);

/** A song's strings in one locale, its title aside. */
const untitledSongTextSchema = hookedSchema.extend({
  /**
   * What the crib beside the words is, in place of the stock line — whose
   * translation it is, or that the column is the original. One line of markdown.
   */
  cribNote: z.string().min(1).optional(),
});

export type UntitledSongText = z.infer<typeof untitledSongTextSchema>;

/** A song's strings in one locale. */
const songTextSchema = untitledSongTextSchema.extend({
  title: localNameSchema.optional(),
});

/**
 * Who wrote which half, in contribution order rather than billing order. Absent
 * means the author alone, which is the common case and not worth restating.
 */
const creditsSchema = z.object({
  lyrics: z.array(creditedNameSchema).min(1).optional(),
  music: z.array(creditedNameSchema).min(1).optional(),
});

/** What a credits line reads: who wrote the song, and what it is sung in. */
const creditedSongSchema = z.object({
  /**
   * One language, or a list where a song is sung in several — the main one
   * first, whose words the page shows.
   */
  language: z
    .union([songLanguageSchema, z.array(songLanguageSchema).min(1)])
    .transform((language) => (Array.isArray(language) ? language : [language])),
  credits: creditsSchema.optional(),
});

export type CreditedSong = z.infer<typeof creditedSongSchema>;

/**
 * A song's number on a release — required there and refused on a single, so
 * an album lists in the order it was released in. Numbers may skip: a release
 * can carry a song the catalogue has no master for.
 */
const trackSchema = z.number().int().positive();

/** A song's number on the one release in view. */
const trackedSchema = z.object({ track: trackSchema });

export type Tracked = z.infer<typeof trackedSchema>;

/** Where on a release a song sits. */
const placementSchema = trackedSchema.extend({ album: albumSchema });

export type AlbumPlacement = z.infer<typeof placementSchema>;

/** Every release a song is on. */
const releasedSchema = z.object({
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
});

export type Released = z.infer<typeof releasedSchema>;

/**
 * The words keep their script beside the romanization rather than giving way
 * to it — a sacred text, whose letters are not to be replaced. The title is a
 * name, and switches as any other does.
 */
const scriptKeptSchema = z.object({ keepsScript: z.boolean().default(false) });

export type ScriptKept = z.infer<typeof scriptKeptSchema>;

/** A URL, or a site-root path for a file the site hosts itself. */
const mediaSourceSchema = z.union([z.url(), z.string().regex(/^\/(?!\/)/)]);

const repoHeldSchema = z.object({
  /**
   * Its repository under the `vovas-music` organization, whose `main` holds
   * every file the song is played and downloaded from, at its root under the
   * names `pnpm music:masters tag` derives.
   */
  repo: z.string().min(1),
});

export type RepoHeld = z.infer<typeof repoHeldSchema>;

const masteredSchema = z.object({
  /**
   * The master is itself an MP3, there being no lossless one; otherwise it is
   * a FLAC beside an MP3 copy and an MP4 rewrap the player streams on lossless.
   */
  lossy: z.boolean().default(false),
});

export type Mastered = z.infer<typeof masteredSchema>;

/** What the player needs of a song beside the files it plays. */
const playableSchema = z.object({
  /**
   * The master's duration, read off its own FLAC header by the scaffolder. A
   * cache, and safe to be one because a master never changes — it is what lets
   * the track list render complete HTML with nothing fetched in the browser.
   */
  seconds: z.number().int().positive(),
  /** Read off the 🅴 in the master's file name by the scaffolder. */
  explicit: z.boolean().default(false),
  /**
   * The song runs straight into its release's next track, so a shuffle keeps
   * the two together, in order.
   */
  segue: z.boolean().default(false),
});

export type Playable = z.infer<typeof playableSchema>;

const songFieldsSchema = composeSchemas(
  baseFrontmatterSchema,
  playableSchema,
  repoHeldSchema,
  masteredSchema,
  creditedSongSchema,
  releasedSchema,
  scriptKeptSchema,
).extend({
  date: songDateSchema,
  /**
   * The song's own name — in the language it is sung in, or the English one
   * where neither locale's is that. A locale states one only where it differs.
   */
  title: z.string().min(1),
  /**
   * The artist first, whoever is featured after it — a feature meaning the song
   * can be shown to the people the other project is shown to.
   */
  project: z.array(projectSchema).min(1),
  /**
   * The MP3's size, which the songs feeds' enclosures state — recorded by the
   * tag run rather than fetched, so a deploy depends on no request to the
   * file's host.
   */
  mp3Bytes: z.number().int().positive(),
  /** What the title is in, where that is not the language sung first. */
  titleLanguage: sungLanguageSchema.optional(),
  /**
   * The title in Latin letters, written by hand: for a script no rule
   * romanizes (`Mithqāl`), or a name with an established Latin spelling.
   */
  titleLatin: z.string().min(1).optional(),
  video: z
    .object({
      src: mediaSourceSchema,
      /**
       * Where the master's start falls on the video's timeline, in seconds —
       * negative where the video starts after it. A video is cut on its own,
       * so opening it mid-song lands on the same moment only with this.
       * `src/music/scripts/song-intake/video-offset.py` measures it.
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
const songFrontmatterSchema = songFieldsSchema
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

export const SONGS: Collection<SongFrontmatter> = {
  id: 'music',
  schema: songFrontmatterSchema,
};
