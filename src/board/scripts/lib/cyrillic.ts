const CYRILLIC = /\p{Script=Cyrillic}+(?:[\s,.!?«»—–-]+\p{Script=Cyrillic}+)*/u;

export type CyrillicLine = { line: number; words: string };

/** Each line of `text` holding Cyrillic, 1-based, with its first Cyrillic run. */
export const cyrillicLines = (text: string): CyrillicLine[] =>
  text.split('\n').flatMap((content, at) => {
    const words = CYRILLIC.exec(content)?.[0];
    return words === undefined ? [] : [{ line: at + 1, words }];
  });
