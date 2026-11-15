const CYRILLIC = /\p{Script=Cyrillic}+(?:[\s,.!?«»—–-]+\p{Script=Cyrillic}+)*/u;

/** Each line of `text` holding Cyrillic, 1-based, with its first Cyrillic run. */
export const cyrillicLines = (
  text: string,
): Array<{ line: number; words: string }> =>
  text.split('\n').flatMap((content, at) => {
    const words = CYRILLIC.exec(content)?.[0];
    return words === undefined ? [] : [{ line: at + 1, words }];
  });
