import { cleanLabel } from './lookup';

/** Word lengths that run together into a name still short enough to type. */
const LENGTH = { min: 3, max: 7 };

/** A dictionary word as letters only: `made-up` runs on as `madeup`. */
const letters = (word: string) => word.toLowerCase().replaceAll(/[^a-z]/g, '');

/**
 * A random name for the dice: an adjective and a noun run together. faker is
 * loaded on the first roll rather than with the page, whose visitors mostly
 * never roll.
 */
export async function rollName(): Promise<string> {
  const { faker } = await import('@faker-js/faker');

  return cleanLabel(
    `${letters(faker.word.adjective({ length: LENGTH }))}${letters(faker.word.noun({ length: LENGTH }))}`,
  );
}
