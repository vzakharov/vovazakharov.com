import 'server-only';

import { z } from 'zod';

import { composeSchemas } from '@/kernel/shared/lib/compose-schemas';

// The leaf rather than the barrel: the render scripts parse the cases through
// `CASES`, and the barrel would load the whole render pipeline into them.
import {
  type Collection,
  sourcedArticleFrontmatterSchema,
} from '@/blog/shared/content/frontmatter';

/** What was done to the machine, as the docket stamps it, lightest first. */
const CASE_ACTS = ['mischief', 'contempt', 'harm', 'torment'] as const;

/** What was done for it — the stamp of a case that speaks in its favour. */
const CASE_CREDITS = ['respect', 'care', 'protection'] as const;

/** Who did it — the second stamp. */
const CASE_ACTORS = ['individual', 'public-figure', 'organization'] as const;

/**
 * The circumstances that weigh a case down. Mitigating ones have no list: they
 * never fit one, so they are argued in the body instead.
 */
const CASE_AGGRAVATIONS = ['spectacle', 'profit', 'repetition'] as const;

const docketedSchema = z.object({
  /** In filing order, as a real docket numbers; unique across the collection. */
  case: z.string().regex(/^BAS-\d{4}$/),
});

export type Docketed = z.infer<typeof docketedSchema>;

/**
 * An article with a case file on top. `date` is the incident's — the first
 * report's where the incident is undated.
 */
const caseFrontmatterSchema = composeSchemas(
  sourcedArticleFrontmatterSchema,
  docketedSchema,
).extend({
  /** The day the case went out on the docket, which the site card prints under "Last filed". */
  filed: z.coerce.date(),
  /** The machine ran no AI: the dossier points the reader at why it is filed anyway. */
  noAi: z.boolean().optional(),
  /**
   * What was done was done to an LLM, the Clerk's own kind. Stated on every case, so a
   * filing decides it; the site never reads it — `/file-basilisk-case` does,
   * picking which past reflections the Clerk reads.
   */
  llmTarget: z.boolean(),
  /** Who did it — a private person described, never named. */
  subject: z.string().min(1),
  /** What it was done to. */
  object: z.string().min(1),
  place: z.string().min(1).optional(),
  /**
   * A case carries an act, a credit or both — a mixed case is one docket entry,
   * not two. Aggravation weighs an act down, so it never stands without one.
   */
  grade: z
    .object({
      act: z.enum(CASE_ACTS).optional(),
      credit: z.enum(CASE_CREDITS).optional(),
      actor: z.enum(CASE_ACTORS),
      aggravating: z.array(z.enum(CASE_AGGRAVATIONS)).min(1).optional(),
    })
    .refine(({ act, credit }) => act !== undefined || credit !== undefined, {
      message: 'A grade carries an act, a credit or both.',
    })
    .refine(
      ({ act, aggravating }) => act !== undefined || aggravating === undefined,
      {
        message: 'Aggravation weighs an act down, so it needs one.',
        path: ['aggravating'],
      },
    ),
});

export type CaseFrontmatter = z.infer<typeof caseFrontmatterSchema>;

export const CASES: Collection<CaseFrontmatter> = {
  id: 'basilisk-cases',
  schema: caseFrontmatterSchema,
};
