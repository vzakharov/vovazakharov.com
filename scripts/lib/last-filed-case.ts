/**
 * The docket's newest case, read from the case files' text with patterns: the
 * card renders under bare `tsx`, where `shared/content`'s loader is
 * `server-only` and throws.
 */

import type { Titled } from '@/shared/typings';

/** `filed` is the frontmatter's own ISO string, which is what the card prints. */
export type FiledCase = Titled & { number: string; filed: string };

const FRONTMATTER = /^---\r?\n([\S\s]*?)^---/m;
const CASE_NUMBER = /^case:[\t ]*(BAS-\d{4})[\t ]*$/m;
const FILED = /^filed:[\t ]*(\d{4}-\d{2}-\d{2})[\t ]*$/m;
const TITLE = /^# (.+)$/m;

/**
 * Numbers are zero-padded, so their string order is their filing order. Throws
 * on a case file missing its number, filing date or title, and on an empty docket —
 * the card has a line for the case either way.
 */
export function lastFiledCase(sources: readonly string[]): FiledCase {
  const cases = sources.map((source) => {
    const frontmatter = FRONTMATTER.exec(source);
    const number = CASE_NUMBER.exec(frontmatter?.[1] ?? '')?.[1];
    const filed = FILED.exec(frontmatter?.[1] ?? '')?.[1];
    const title = TITLE.exec(
      frontmatter === null ? source : source.slice(frontmatter[0].length),
    )?.[1];

    if (number === undefined || filed === undefined || title === undefined) {
      throw new Error(
        `A case file without a case number, a filing date or a "# " title:\n${source.slice(0, 200)}`,
      );
    }

    return { number, filed, title: title.trim() };
  });

  const last = cases.toSorted((a, b) => b.number.localeCompare(a.number))[0];

  if (last === undefined) throw new Error('The docket has no cases to card.');

  return last;
}
