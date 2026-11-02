'use client';

import { useEffect, useState } from 'react';

/**
 * SCOWL's commonest English words — sizes 10 to 35, some 38,000 of them — as
 * lowercase letters only.
 */
async function fetchWords(): Promise<ReadonlySet<string>> {
  const lists = await Promise.all([
    import('wordlist-english/english-words-10.json'),
    import('wordlist-english/english-words-20.json'),
    import('wordlist-english/english-words-35.json'),
  ]);

  return new Set(
    lists.flatMap(({ default: words }) =>
      words.filter((word) => /^[a-z]+$/.test(word)),
    ),
  );
}

let loading: Promise<ReadonlySet<string>> | undefined;

/** `fetchWords`, once for the page. */
async function loadWords(): Promise<ReadonlySet<string>> {
  loading ??= fetchWords();

  return loading;
}

/**
 * The dictionary `domainHacks` splits by, `undefined` until it arrives. It is
 * fetched the first time `wanted` holds rather than with the page, being some
 * 100 KB that a visitor who never types does not need. A failed fetch is
 * reported to the page's error handlers, and the names it would have split
 * stay unsplit.
 */
export function useWords(wanted: boolean): ReadonlySet<string> | undefined {
  const [words, setWords] = useState<ReadonlySet<string>>();

  useEffect(() => {
    if (!wanted || words !== undefined) return;

    let stale = false;

    loadWords().then((loaded) => {
      if (!stale) setWords(loaded);
    }, reportError);

    return () => {
      stale = true;
    };
  }, [wanted, words]);

  return words;
}
