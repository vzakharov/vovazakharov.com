import 'server-only';

import { z, type ZodType } from 'zod';

import { MUSIC_PROJECT_NAMES } from '@/shared/config';

import type { CollectionId } from './collections';

/**
 * Frontmatter carries only what the markdown cannot express on its own. The
 * title, word count and heading outline are derived from the document body, so
 * they are deliberately absent here — a second copy would be free to drift.
 */
const baseFrontmatterSchema = z.object({
  /** Meta description and index-card blurb. */
  description: z.string().min(1),
  /** Published date. YAML parses an unquoted `2026-08-29` into a Date. */
  date: z.coerce.date(),
  /** Open Graph image, relative to the document. */
  ogImage: z.string().min(1).optional(),
});

/** What every collection states, and all that anything reading documents at large can rely on. */
export type BaseFrontmatter = z.infer<typeof baseFrontmatterSchema>;

const caseStudyFrontmatterSchema = baseFrontmatterSchema.extend({
  /** Free-text series marker, e.g. `I of II`. */
  part: z.string().min(1).optional(),
});

/** Whether the song is released or still being worked on. */
export const SONG_STATUSES = ['done', 'wip'] as const;

/** What the vocal is in — `instrumental` where there is none. */
export const SONG_LANGUAGES = ['ru', 'en', 'instrumental'] as const;

const songFrontmatterSchema = baseFrontmatterSchema.extend({
  /**
   * The track name. A field rather than the body's leading `# `, unlike a case
   * study's title: the player bar shows it as `Name — Project`, so deriving it
   * would mean parsing prose to render a control.
   */
  name: z.string().min(1),
  status: z.enum(SONG_STATUSES),
  language: z.enum(SONG_LANGUAGES),
  /** Which of the three releases it belongs to; absent until the author says. */
  project: z.enum(MUSIC_PROJECT_NAMES).optional(),
  /** Its repository under the `vovas-music` organization. */
  repo: z.string().min(1),
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
  /** Track id, where the song is also on Spotify. */
  spotify: z.string().min(1).optional(),
});

export type CaseStudyFrontmatter = z.infer<typeof caseStudyFrontmatterSchema>;
export type SongFrontmatter = z.infer<typeof songFrontmatterSchema>;

export type WithFrontmatter<F extends BaseFrontmatter = BaseFrontmatter> = {
  frontmatter: F;
};

/**
 * A collection and the schema that reads it, as one value. A song carries
 * fields a case study must not silently accept, so the two are validated apart
 * — and pairing the id with its schema is what keeps a reader from being handed
 * one collection's documents under another's shape.
 */
export type Collection<F extends BaseFrontmatter = BaseFrontmatter> = {
  id: CollectionId;
  schema: ZodType<F>;
};

export const CASE_STUDIES: Collection<CaseStudyFrontmatter> = {
  id: 'case-studies',
  schema: caseStudyFrontmatterSchema,
};

export const SONGS: Collection<SongFrontmatter> = {
  id: 'music',
  schema: songFrontmatterSchema,
};

/** Keyed so a collection without a schema fails to compile rather than at read time. */
export const COLLECTION_SCHEMAS = {
  'case-studies': CASE_STUDIES,
  music: SONGS,
} as const satisfies Record<CollectionId, Collection>;

/**
 * The title a collection states outright, where it has one. A case study's is
 * its body's leading heading instead, so this is `undefined` for one.
 */
export function frontmatterTitle(
  frontmatter: BaseFrontmatter,
): string | undefined {
  return 'name' in frontmatter && typeof frontmatter.name === 'string'
    ? frontmatter.name
    : undefined;
}
