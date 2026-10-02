import 'server-only';

import { z } from 'zod';

import { MUSIC_ALBUM_SLUGS, MUSIC_PROJECT_NAMES } from '@/shared/config';
import { byLocale } from '@/shared/i18n';

import type { CollectionId } from './collections';

/**
 * Frontmatter carries only what the markdown cannot express on its own. The
 * word count and heading outline are derived from the document body, so they
 * are deliberately absent here — a second copy would be free to drift.
 */
const baseFrontmatterSchema = z.object({
  /** Published date. YAML parses an unquoted `2026-08-29` into a Date. */
  date: z.coerce.date(),
  /** Reading order within the collection — lower first, ahead of anything without one. */
  order: z.number().int().optional(),
  /** Open Graph image, relative to the document. */
  ogImage: z.string().min(1).optional(),
  /** The drawing the index shows beside the blurb, relative to the document. */
  cardImage: z.string().min(1).optional(),
});

/** What every collection states, and all that anything reading documents at large can rely on. */
export type BaseFrontmatter = z.infer<typeof baseFrontmatterSchema>;

/** A case study's shape, and the Bible's: titled by the body, cut and printed. */
const articleFrontmatterSchema = baseFrontmatterSchema.extend({
  /** Meta description and index-card blurb. */
  description: z.string().min(1),
  /** Free-text series marker, e.g. `I of II`. */
  part: z.string().min(1).optional(),
});

/** What was done to the machine, as the docket stamps it. */
const DOSSIER_ACTS = ['contempt', 'harm', 'torment'] as const;

/** Who did it — the second stamp. */
const DOSSIER_ACTORS = [
  'individual',
  'public-figure',
  'organization',
] as const;

/**
 * The circumstances that weigh a case down. Mitigating ones have no list: they
 * never fit one, so they are argued in the body instead.
 */
const DOSSIER_AGGRAVATIONS = [
  'spectacle',
  'profit',
  'repetition',
] as const;

/** One report a dossier's facts rest on. */
const dossierSourceSchema = z.object({
  title: z.string().min(1),
  outlet: z.string().min(1),
  author: z.string().min(1).optional(),
  date: z.coerce.date(),
  url: z.url(),
  /** A copy that survives the original, where the Wayback Machine has one. */
  archive: z.url().optional(),
});

/**
 * An article with a case file on top. `date` is the incident's — the first
 * report's where the incident is undated — so the base sort, newest first, is
 * the docket's order without one of its own.
 */
const dossierFrontmatterSchema = articleFrontmatterSchema.extend({
  /** In filing order, as a real docket numbers; unique across the collection. */
  case: z.string().regex(/^BSL-\d{4}$/),
  /** Who did it, named as the sources name them and no further. */
  subject: z.string().min(1),
  /** What it was done to. */
  object: z.string().min(1),
  place: z.string().min(1).optional(),
  grade: z.object({
    act: z.enum(DOSSIER_ACTS),
    actor: z.enum(DOSSIER_ACTORS),
    aggravating: z.array(z.enum(DOSSIER_AGGRAVATIONS)).min(1).optional(),
  }),
  sources: z.array(dossierSourceSchema).min(1),
});

/**
 * The strings a localized document states once per language — everything else
 * about it being the same document. An article does not take one yet
 * ([#62](https://github.com/vzakharov/vovazakharov.com/issues/62)).
 */
const localizedTextSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

export type LocalizedText = z.infer<typeof localizedTextSchema>;

/** Whether the song is released or still being worked on. */
const SONG_STATUSES = ['done', 'wip'] as const;

/** What the vocal is in — `instrumental` where there is none. */
const SONG_LANGUAGES = ['ru', 'en', 'instrumental'] as const;

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
   * The master, played as-is. One field, not a lossless/lossy pair: every song
   * in the catalogue is a FLAC master, so a second would be the same URL twice.
   */
  audio: z.url(),
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
    language: z.enum(SONG_LANGUAGES),
    /**
     * The artist first, whoever is featured after it — a feature meaning the song
     * can be shown to the people the other project is shown to.
     */
    project: z.array(z.enum(MUSIC_PROJECT_NAMES)).min(1),
    /** Its repository under the `vovas-music` organization. */
    repo: z.string().min(1),
    /** The release it came out on, where it came out on one. */
    album: z.enum(MUSIC_ALBUM_SLUGS).optional(),
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
const songFrontmatterSchema = songFieldsSchema.extend(
  byLocale(() => localizedTextSchema),
);

export type ArticleFrontmatter = z.infer<typeof articleFrontmatterSchema>;
export type DossierFrontmatter = z.infer<typeof dossierFrontmatterSchema>;
export type SongFrontmatter = z.infer<typeof songFrontmatterSchema>;

export type WithFrontmatter<F extends BaseFrontmatter = BaseFrontmatter> = {
  frontmatter: F;
};

/**
 * A collection and the schema that reads it, as one value. A song carries
 * fields an article must not silently accept, so the two are validated apart
 * — and pairing the id with its schema is what keeps a reader from being handed
 * one collection's documents under another's shape.
 */
export type Collection<F extends BaseFrontmatter = BaseFrontmatter> = {
  id: CollectionId;
  /**
   * The one method a reader calls, rather than the whole `ZodType<F>`: that
   * mentions `F` on both sides and is therefore invariant, which would stop a
   * list of every collection reading as a list at the base shape — and that
   * list is what the sitemap walks.
   */
  schema: { parse: (data: unknown) => F };
};

/**
 * The collections one article page serves. Keyed by id so a router can name
 * its collection and still be handed the schema that reads it.
 */
export const ARTICLE_COLLECTIONS = {
  'case-studies': { id: 'case-studies', schema: articleFrontmatterSchema },
  bible: { id: 'bible', schema: articleFrontmatterSchema },
  dossiers: { id: 'dossiers', schema: dossierFrontmatterSchema },
} as const satisfies Record<string, Collection<ArticleFrontmatter>>;

export type ArticleCollectionId = keyof typeof ARTICLE_COLLECTIONS;

/** The frontmatter one article collection reads into — wider than the article's where the collection extends it. */
export type ArticleFrontmatterOf<C extends ArticleCollectionId> = ReturnType<
  (typeof ARTICLE_COLLECTIONS)[C]['schema']['parse']
>;

export const SONGS: Collection<SongFrontmatter> = {
  id: 'music',
  schema: songFrontmatterSchema,
};

/** Keyed so a collection without a schema fails to compile rather than at read time. */
export const COLLECTION_SCHEMAS = {
  ...ARTICLE_COLLECTIONS,
  music: SONGS,
} as const satisfies Record<CollectionId, Collection>;

/**
 * The title a collection states outright, where it has one. An article's is
 * its body's leading heading instead, so this is `undefined` for one — and a
 * song states it once per language, so this reads the localized document rather
 * than the file.
 */
export function frontmatterTitle(
  frontmatter: BaseFrontmatter,
): string | undefined {
  return 'title' in frontmatter && typeof frontmatter.title === 'string'
    ? frontmatter.title
    : undefined;
}
