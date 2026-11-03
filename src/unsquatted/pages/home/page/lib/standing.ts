/**
 * How a liked bare name stands: the domains of it the shortlist looks up, and
 * what their answers make of the chip.
 */

import { ZONES } from '../../checker';
import type { Verdict } from '../../verdict';

/** The zones a bare name is looked up in first: the checker's leading ones. */
export const MAIN_ZONES = ZONES.slice(0, 4);

/** The zones looked up only once every main one is taken. */
const OTHER_ZONES = ZONES.slice(MAIN_ZONES.length);

/** `name` in each of `zones`. */
const inZones = (name: string, zones: readonly string[]) =>
  zones.map((zone) => `${name}.${zone}`);

export const mainDomains = (name: string) => inZones(name, MAIN_ZONES);

export const otherDomains = (name: string) => inZones(name, OTHER_ZONES);

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

const registrable = (verdict: Verdict | undefined) =>
  verdict?.state === 'free' || verdict?.state === 'maybe';

/** Whether every one of `domains` has been answered. */
const answered = (
  domains: readonly string[],
  verdicts: ReadonlyMap<string, Verdict>,
) => domains.every((domain) => verdicts.has(domain));

/** Whether `name`'s main domains are all answered and none registrable. */
export const mainTaken = (
  name: string,
  verdicts: ReadonlyMap<string, Verdict>,
) =>
  answered(mainDomains(name), verdicts) &&
  !mainDomains(name).some((domain) => registrable(verdicts.get(domain)));

/** How `name` stands on the answers in `verdicts`. */
export function standingOf(
  name: string,
  verdicts: ReadonlyMap<string, Verdict>,
): Standing {
  const main = mainDomains(name);
  const firstFree = main.find((domain) => registrable(verdicts.get(domain)));

  // The first registrable main domain is the one shown only once every main
  // domain before it is answered, so the chip never changes its mind.
  if (firstFree !== undefined) {
    const before = main.slice(0, main.indexOf(firstFree));

    return answered(before, verdicts)
      ? { state: 'free', domain: firstFree }
      : { state: 'pending' };
  }
  if (!mainTaken(name, verdicts)) return { state: 'pending' };

  const others = otherDomains(name);

  if (!answered(others, verdicts)) return { state: 'pending' };

  const free = others.filter((domain) => registrable(verdicts.get(domain)));

  return free.length === 0 ? { state: 'taken' } : { state: 'others', free };
}
