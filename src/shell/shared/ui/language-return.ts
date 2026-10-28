import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import type { Chip } from './chip-nav';

const STORAGE_KEY = 'language';

/** Set on a history entry once a language row has seen it. */
const SEEN_KEY = 'languageSeen';

function readLanguage(): string | null {
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeLanguage(language: string) {
  try {
    sessionStorage.setItem(STORAGE_KEY, language);
  } catch {
    // Storage refused: Back keeps each page's own language.
  }
}

function entryState(): object {
  const state: unknown = history.state;

  return typeof state === 'object' && state !== null ? state : {};
}

/**
 * History can only be rewritten where it stands, so a page Back or Forward
 * returns to in another language than the reader's last replaces itself with
 * its version in that language.
 *
 * What tells a return from a visit is a mark on the history entry itself: an
 * unmarked entry is a visit — the reader followed, typed or switched to this
 * address, so its language becomes theirs — and a marked one is a return.
 * Next's own navigations write a fresh state, so a language switch leaves the
 * entry unmarked and the switched-to language is recorded like any visit.
 */
export function useLanguageReturn(chips: Chip[]) {
  const router = useRouter();

  useEffect(() => {
    const here = chips.find((chip) => chip.current)?.hrefLang;

    if (here === undefined) return;

    const settle = () => {
      const state = entryState();

      if (!(SEEN_KEY in state)) {
        history.replaceState({ ...state, [SEEN_KEY]: true }, '');
        writeLanguage(here);

        return;
      }

      const language = readLanguage();
      const target = chips.find((chip) => chip.hrefLang === language);

      if (target !== undefined && !target.current) router.replace(target.href);
    };

    // A page restored whole from the back/forward cache runs no effect again.
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) settle();
    };

    settle();
    globalThis.addEventListener('pageshow', onPageShow);

    return () => {
      globalThis.removeEventListener('pageshow', onPageShow);
    };
  }, [chips, router]);
}
