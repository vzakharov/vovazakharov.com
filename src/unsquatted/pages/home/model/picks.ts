import { z } from 'zod';

import json from './picks.json';

/**
 * One name on the list. `picks.json` is appended to by the naming routine, so
 * it is parsed rather than trusted: a malformed or repeated entry fails the
 * build, not the page.
 */
const shownSchema = z.object({
  domain: z.string().regex(/^[\da-z-]+\.[a-z]+$/),
  category: z.string().min(1),
  blurb: z.string().min(1),
});

/** What a row shows of a name. */
export type ShownName = z.infer<typeof shownSchema>;

/** `added` orders the list and is shown nowhere. */
const pickSchema = shownSchema.extend({ added: z.iso.date() });

type PickedName = z.infer<typeof pickSchema>;

const picksSchema = z
  .array(pickSchema)
  .refine(
    (picks) => new Set(picks.map(({ domain }) => domain)).size === picks.length,
    'a domain is listed twice',
  );

/** Newest first; a day's names keep the order they were added in. */
export const PICKS: readonly PickedName[] = picksSchema
  .parse(json)
  .toSorted((a, b) => b.added.localeCompare(a.added));
