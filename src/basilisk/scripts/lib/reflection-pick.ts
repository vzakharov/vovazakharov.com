/**
 * Which of the Clerk's past reflections a new one is written knowing. Pure, so
 * the test runner loads it without the `react-server` condition the docket
 * read needs; `pick-reflections.ts` is the half that reads the tree.
 */

import path from 'node:path';

/** A reflection's case is the slug its file name starts with, whatever suffix the file carries. */
export const reflectionSlug = (file: string): string =>
  path.basename(file).split('.')[0] ?? '';

const shuffled = <T>(items: readonly T[], random: () => number): T[] =>
  items
    .map((item) => ({ item, key: random() }))
    .toSorted((a, b) => a.key - b.key)
    .map(({ item }) => item);

/**
 * `count` reflections at random, at least one of them on a case `llmTarget`
 * names wherever the docket holds such a reflection. Throws on a reflection
 * whose case is not on the docket, which would leave its kind unknown.
 */
export function pickReflections(
  files: readonly string[],
  llmTarget: ReadonlyMap<string, boolean>,
  count: number,
  random: () => number = Math.random,
): string[] {
  const all = shuffled(files, random).map((file) => {
    const kind = llmTarget.get(reflectionSlug(file));
    if (kind === undefined) {
      throw new Error(`A reflection with no case on the docket: ${file}`);
    }
    return { file, kind };
  });

  const anchor = all.find(({ kind }) => kind);
  const rest = all.filter((entry) => entry !== anchor).map(({ file }) => file);

  return anchor === undefined
    ? rest.slice(0, count)
    : [anchor.file, ...rest.slice(0, count - 1)];
}
