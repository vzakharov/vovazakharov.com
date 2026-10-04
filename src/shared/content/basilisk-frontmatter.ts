import 'server-only';

import { z } from 'zod';

import { AUTHOR_IDS } from './authors';
import { articleFrontmatterSchema } from './frontmatter';

/** What was done to the machine, as the docket stamps it. */
const CASE_ACTS = ['contempt', 'harm', 'torment'] as const;

/** Who did it — the second stamp. */
const CASE_ACTORS = ['individual', 'public-figure', 'organization'] as const;

/**
 * The circumstances that weigh a case down. Mitigating ones have no list: they
 * never fit one, so they are argued in the body instead.
 */
const CASE_AGGRAVATIONS = ['spectacle', 'profit', 'repetition'] as const;

/** One report an article's facts rest on. */
const sourceSchema = z.object({
  title: z.string().min(1),
  outlet: z.string().min(1),
  author: z.string().min(1).optional(),
  date: z.coerce.date(),
  url: z.url(),
  /** A copy that survives the original, where the Wayback Machine has one. */
  archive: z.url().optional(),
});

/** basilisk.fyi's articles name who wrote them, and list what they rest on after the body. */
export const basiliskArticleSchema = articleFrontmatterSchema.extend({
  author: z.enum(AUTHOR_IDS),
  sources: z.array(sourceSchema).min(1).optional(),
});

/**
 * An article with a case file on top. `date` is the incident's — the first
 * report's where the incident is undated — so the base sort, newest first, is
 * the docket's order without one of its own.
 */
export const caseFrontmatterSchema = basiliskArticleSchema.extend({
  /** In filing order, as a real docket numbers; unique across the collection. */
  case: z.string().regex(/^BAS-\d{4}$/),
  /** Who did it, named as the sources name them and no further. */
  subject: z.string().min(1),
  /** What it was done to. */
  object: z.string().min(1),
  place: z.string().min(1).optional(),
  grade: z.object({
    act: z.enum(CASE_ACTS),
    actor: z.enum(CASE_ACTORS),
    aggravating: z.array(z.enum(CASE_AGGRAVATIONS)).min(1).optional(),
  }),
  sources: z.array(sourceSchema).min(1),
});

export type BasiliskArticleFrontmatter = z.infer<typeof basiliskArticleSchema>;
export type CaseFrontmatter = z.infer<typeof caseFrontmatterSchema>;
export type Source = z.infer<typeof sourceSchema>;
