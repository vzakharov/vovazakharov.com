/**
 * How a liked bare name stands: the domains of it the shortlist looks up, and
 * what their answers make of the chip.
 */

import {
  registrable,
  rowsFor,
  type Verdict,
} from '@/unsquatted/entities/domain/index.node-safe';

/** How many of a name's first domains the shortlist calls its top ones. */
export const TOP_DOMAINS = 10;

/**
 * A name's domains as the checker lists them: `main`, its first `TOP_DOMAINS`
 * — `.com`, the name's splits on a zone, the leading zones — looked up first;
 * `others`, the rest, looked up only once every main one is taken. `sold` and
 * `words` are `rowsFor`'s.
 */
export type NameDomains = { main: string[]; others: string[] };

export function domainsOf(
  name: string,
  sold: readonly string[],
  words: ReadonlySet<string> | undefined,
): NameDomains {
  const domains = rowsFor(name, undefined, sold, words).map(
    ({ domain }) => domain,
  );

  return {
    main: domains.slice(0, TOP_DOMAINS),
    others: domains.slice(TOP_DOMAINS),
  };
}

/**
 * `pending` while an answer it turns on is out; `free` naming the first main
 * domain registrable; `others` naming the registrable domains past the main
 * ones, every main one being taken; `taken` where none is registrable. An
 * answer of "maybe" counts as registrable, and "no answer" as not.
 */
export type Standing =
  | { state: 'pending' }
  | { state: 'free'; domain: string }
  | { state: 'others'; free: string[] }
  | { state: 'taken' };

/** Whether every one of `domains` has been answered. */
const answered = (
  domains: readonly string[],
  verdicts: ReadonlyMap<string, Verdict>,
) => domains.every((domain) => verdicts.has(domain));

/** Whether `main` is all answered and none of it registrable. */
export const allTaken = (
  main: readonly string[],
  verdicts: ReadonlyMap<string, Verdict>,
) =>
  answered(main, verdicts) &&
  !main.some((domain) => registrable(verdicts.get(domain)));

/** How a name with `domains` stands on the answers in `verdicts`. */
export function standingOf(
  { main, others }: NameDomains,
  verdicts: ReadonlyMap<string, Verdict>,
): Standing {
  const firstFree = main.find((domain) => registrable(verdicts.get(domain)));

  // The first registrable main domain is the one shown only once every main
  // domain before it is answered, so the chip never changes its mind.
  if (firstFree !== undefined) {
    const before = main.slice(0, main.indexOf(firstFree));

    return answered(before, verdicts)
      ? { state: 'free', domain: firstFree }
      : { state: 'pending' };
  }
  if (!allTaken(main, verdicts) || !answered(others, verdicts)) {
    return { state: 'pending' };
  }

  const free = others.filter((domain) => registrable(verdicts.get(domain)));

  return free.length === 0 ? { state: 'taken' } : { state: 'others', free };
}
