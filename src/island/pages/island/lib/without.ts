/**
 * The costs of the full looks that `?without=` drops, one at a time, so the
 * frame time shows what each costs: the clouds marched in the sky, their
 * shadow on what they pass over, the air over every surface, the sea's
 * ripples, the sky its ripples mirror, the trees, and the grass, bushes and
 * litter among them.
 */
export const WITHOUTS = [
  'clouds',
  'cloud-shadow',
  'air',
  'ripples',
  'sea-sky',
  'trees',
  'tufts',
] as const;

export type Without = (typeof WITHOUTS)[number];

/** The query parameter naming them, comma-separated: `?without=air,trees`. */
const WITHOUT_QUERY = 'without';

/** What the scene leaves out now; empty unless a page asks for it. */
export type Dropped = {
  readonly has: (cost: Without) => boolean;
};

const isWithout = (name: string): name is Without =>
  (WITHOUTS as readonly string[]).includes(name);

/** The costs `search` (a URL's query string) names under `WITHOUT_QUERY`; throws on a name not in `WITHOUTS`. */
export function withoutOf(search: string): ReadonlySet<Without> {
  const asked = new URLSearchParams(search).get(WITHOUT_QUERY);
  if (asked === null || asked === '') return new Set();
  const names = asked.split(',').map((name) => name.trim());
  const unknown = names.filter((name) => !isWithout(name));
  if (unknown.length > 0) {
    throw new RangeError(
      `?${WITHOUT_QUERY}=${unknown.join(',')}: known are ${WITHOUTS.join(', ')}`,
    );
  }
  return new Set(names.filter((name) => isWithout(name)));
}
