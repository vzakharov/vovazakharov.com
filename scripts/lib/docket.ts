/**
 * The docket as the basilisk.fyi cards read it. Types only from `src/`, so the
 * test runner, which has no `react-server` condition, can load it;
 * `read-docket.ts` is the half that parses through the schema.
 */

import type { CaseFrontmatter } from '@/shared/content/basilisk-frontmatter';
import type { Slugged } from '@/shared/content/collections';
import type { WithFrontmatter } from '@/shared/content/frontmatter';
import type { Titled } from '@/shared/typings';

export type DocketCase = Slugged & Titled & WithFrontmatter<CaseFrontmatter>;

const TITLE = /^# (.+)$/m;

/** The body's first `# ` heading, which is the page's title. Throws where there is none. */
export function caseTitle(body: string, file: string): string {
  const title = TITLE.exec(body)?.[1]?.trim();

  if (title === undefined) {
    throw new Error(`A case file without a "# " title: ${file}`);
  }

  return title;
}

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
