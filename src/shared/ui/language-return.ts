import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import type { Chip } from './chip-nav';

const KEY = 'language';

/**
 * The language the reader last switched to in this tab. Memory is the truth
 * and `sessionStorage` its copy, so a browser that refuses storage still
 * returns in the switched language within the visit, just not across a reload.
 */
let chosen: string | null | undefined;

function readChosen(): string | null {
  if (chosen !== undefined) return chosen;

  try {
    chosen = sessionStorage.getItem(KEY);
  } catch {
    chosen = null;
  }

  return chosen;
}

export function rememberLanguage(language: string) {
  chosen = language;

  try {
    sessionStorage.setItem(KEY, language);
  } catch {
    // Storage refused: the choice still holds in memory for this visit.
  }
}

/**
 * The address a Back or Forward has just landed on, until a language row
 * there has had its chance to act on it. Keyed by address so a traversal to a
 * page with no row cannot be claimed by the next page that has one.
 */
const inBrowser = 'window' in globalThis;

let traversedTo: string | null =
  inBrowser &&
  performance
    .getEntriesByType('navigation')
    .some(
      (entry) =>
        entry instanceof PerformanceNavigationTiming &&
        entry.type === 'back_forward',
    )
    ? location.href
    : null;

if (inBrowser) {
  globalThis.addEventListener('popstate', () => {
    traversedTo = location.href;
  });
}

function claimTraversal(): boolean {
  const claimed = traversedTo === location.href;

  traversedTo = null;

  return claimed;
}

/**
 * History can only be rewritten where it stands, so a page reached by Back
 * or Forward in a language other than the one last switched to replaces itself
 * with its own version in that language. Only a traversal does: an address
 * followed or typed keeps the language it names.
 */
export function useLanguageReturn(chips: Chip[]) {
  const router = useRouter();

  useEffect(() => {
    if (!chips.some((chip) => chip.hrefLang !== undefined)) return;

    const returnTo = (traversed: boolean) => {
      if (!traversed) return;

      const language = readChosen();
      const target = chips.find((chip) => chip.hrefLang === language);

      if (target !== undefined && !target.current) {
        router.replace(target.href);
      }
    };

    // A page restored whole from the back/forward cache runs no effect again.
    const onPageShow = (event: PageTransitionEvent) => {
      returnTo(event.persisted);
    };

    returnTo(claimTraversal());
    window.addEventListener('pageshow', onPageShow);

    return () => {
      window.removeEventListener('pageshow', onPageShow);
    };
  }, [chips, router]);
}
