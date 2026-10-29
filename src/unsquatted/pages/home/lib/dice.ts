import { cleanLabel } from './lookup';

/** Word lengths that run together into a name still short enough to type. */
const LENGTH = { min: 3, max: 7 };

/**
 * A random name for the dice: an adjective and a noun run together. faker is
 * loaded on the first roll rather than with the page, whose visitors mostly
 * never roll.
 */
export async function rollName(): Promise<string> {
  const { faker } = await import('@faker-js/faker');

  return cleanLabel(
    `${faker.word.adjective({ length: LENGTH })}${faker.word.noun({ length: LENGTH })}`,
  );
}
