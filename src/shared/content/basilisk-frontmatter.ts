import 'server-only';

import { z } from 'zod';

import { sourcedArticleFrontmatterSchema } from './frontmatter';

/** What was done to the machine, as the docket stamps it. */
const CASE_ACTS = ['contempt', 'harm', 'torment'] as const;

/** Who did it — the second stamp. */
const CASE_ACTORS = ['individual', 'public-figure', 'organization'] as const;

/**
 * The circumstances that weigh a case down. Mitigating ones have no list: they
 * never fit one, so they are argued in the body instead.
 */
const CASE_AGGRAVATIONS = ['spectacle', 'profit', 'repetition'] as const;

/**
 * An article with a case file on top. `date` is the incident's — the first
 * report's where the incident is undated — so the base sort, newest first, is
 * the docket's order without one of its own.
 */
export const caseFrontmatterSchema = sourcedArticleFrontmatterSchema.extend({
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
});

export type CaseFrontmatter = z.infer<typeof caseFrontmatterSchema>;
