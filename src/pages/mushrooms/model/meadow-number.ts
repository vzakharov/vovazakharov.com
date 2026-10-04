/**
 * Which meadow a load opens, read off the page's hash against the numbers
 * kept: `#n` names meadow n, `#new` asks for one past the highest, and any
 * other hash reopens the highest.
 */

/** The meadow to open, and whether none is kept under its number yet. */
export type MeadowChoice = { number: number; fresh: boolean };

const NAMED = /^#[1-9]\d*$/;

/** The meadow `hash` opens among the `kept` numbers. */
export function meadowNumber(
  hash: string,
  kept: readonly number[],
): MeadowChoice {
  const highest = Math.max(0, ...kept);
  const named = NAMED.test(hash) ? Number(hash.slice(1)) : undefined;
  if (named !== undefined && Number.isSafeInteger(named)) {
    return { number: named, fresh: !kept.includes(named) };
  }
  if (hash === '#new') return { number: highest + 1, fresh: true };
  return highest > 0
    ? { number: highest, fresh: false }
    : { number: 1, fresh: true };
}

/** The hash that names meadow `number`, as `meadowNumber` reads it back. */
export function meadowHash(number: number): string {
  return `#${String(number)}`;
}
