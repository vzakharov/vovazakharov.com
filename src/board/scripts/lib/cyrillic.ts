import path from 'node:path';

import { REPO_ROOT } from '@/kernel/scripts/lib/repo-root';

const CYRILLIC = /\p{Script=Cyrillic}+(?:[\s,.!?«»—–-]+\p{Script=Cyrillic}+)*/u;

/** Each line of `text` holding Cyrillic, 1-based, with its first Cyrillic run. */
export const cyrillicLines = (
  text: string,
): Array<{ line: number; words: string }> =>
  text.split('\n').flatMap((content, at) => {
    const words = CYRILLIC.exec(content)?.[0];
    return words === undefined ? [] : [{ line: at + 1, words }];
  });

/**
 * Every Cyrillic line across a board's files, keyed by absolute path, as
 * `file:line: “words”` with the path from the repo root. A board is written in
 * English, an operator's words on it included, translated.
 */
export const russianOnBoard = (files: ReadonlyMap<string, string>): string[] =>
  [...files].flatMap(([file, text]) =>
    cyrillicLines(text).map(
      ({ line, words }) =>
        `${path.relative(REPO_ROOT, file)}:${line}: “${words}”`,
    ),
  );
