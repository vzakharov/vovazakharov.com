import 'server-only';

import { z } from 'zod';

import { AUTHOR_IDS } from './authors';
import type { CollectionId } from './collections';

/**
 * Frontmatter carries only what the markdown cannot express on its own. The
 * word count and heading outline are derived from the document body, so they
 * are deliberately absent here — a second copy would be free to drift.
 */
export const baseFrontmatterSchema = z.object({
  /** Published date. YAML parses an unquoted `2026-08-29` into a Date. */
  date: z.coerce.date(),
  /**
   * When the site took the document in, where `date` names something older — a
   * case's incident. What a crawler is told the page last changed on.
   */
  filed: z.coerce.date().optional(),
  /** Reading order within the collection — lower first, ahead of anything without one. */
  order: z.number().int().optional(),
  /** Open Graph image, relative to the document. */
  ogImage: z.string().min(1).optional(),
  /** The drawing the index shows beside the blurb, relative to the document. */
  cardImage: z.string().min(1).optional(),
  /**
   * Built and served at its address, but left out of every public listing —
   * the index, the player's queue, the sitemap — and of search: reachable only
   * by a link someone was given, or from the unlinked `/music/all`.
   */
  hidden: z.boolean().optional(),
});

/** What every collection states, and all that anything reading documents at large can rely on. */
export type BaseFrontmatter = z.infer<typeof baseFrontmatterSchema>;

/** One report an article's facts rest on. */
const sourceSchema = z.object({
  title: z.string().min(1),
  outlet: z.string().min(1),
  author: z.string().min(1).optional(),
  /** A bare year where the publication gives no day, rather than a day nobody gave. */
  date: z.union([z.number().int(), z.coerce.date()]),
  url: z.url(),
  /** A copy that survives the original, where the Wayback Machine has one. */
  archive: z.url().optional(),
});

export type Source = z.infer<typeof sourceSchema>;

const sourcesSchema = z.array(sourceSchema).min(1);

/** Every article's shape: titled by the body, bylined, cut and printed. */
export const articleFrontmatterSchema = baseFrontmatterSchema.extend({
  /** Meta description and index-card blurb. */
  description: z.string().min(1),
  /** Free-text series marker, e.g. `I of II`. */
  part: z.string().min(1).optional(),
  author: z.enum(AUTHOR_IDS),
  /** What the article rests on, listed after the body; absent where it rests on nothing outside itself. */
  sources: sourcesSchema.optional(),
});

/** A case's sources are not optional: a filing rests on reports or is not filed. */
export const sourcedArticleFrontmatterSchema = articleFrontmatterSchema.extend({
  sources: sourcesSchema,
});

/**
 * The strings a localized document states once per language — everything else
 * about it being the same document. An article does not take one yet
 * ([#62](https://github.com/vzakharov/vovazakharov.com/issues/62)).
 */
export const localizedTextSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

export type ArticleFrontmatter = z.infer<typeof articleFrontmatterSchema>;

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
