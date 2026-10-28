/**
 * The docket as the basilisk.fyi cards read it. Imports types only, so the test
 * runner, which has no `react-server` condition, can load it;
 * `read-collection.ts` is the half that parses through the schema.
 */

import type { CaseFrontmatter } from '@/basilisk/shared/content';

import type { CollectionEntry } from '@/blog/scripts/lib/read-collection';

export type DocketCase = CollectionEntry<CaseFrontmatter>;

/**
 * Numbers are zero-padded, so their string order is their filing order. Throws
 * on an empty docket — the site card has a line for the case either way.
 */
export function lastFiledCase(cases: readonly DocketCase[]): DocketCase {
  const last = cases.toSorted((a, b) =>
    b.frontmatter.case.localeCompare(a.frontmatter.case),
  )[0];

  if (last === undefined) throw new Error('The docket has no cases to card.');

  return last;
}
