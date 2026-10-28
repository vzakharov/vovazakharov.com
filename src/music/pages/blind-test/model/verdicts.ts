import { z } from 'zod';

import type { BlindTest } from './blind-test';

/** Free text per piece id, as typed: "B > A > C". */
const verdictsSchema = z.record(z.string(), z.string());
export type Verdicts = z.infer<typeof verdictsSchema>;

const NONE: Verdicts = {};

// Keyed by where the audio is served from, which names the test.
const storageKey = (test: BlindTest) => `blind-test-verdicts:${test.base}`;

const listeners = new Set<() => void>();
// `useSyncExternalStore` wants the same object back until the stored text changes.
let cached: { stored: string; verdicts: Verdicts } | undefined;

/**
 * The verdicts kept in this browser, as a store for `useSyncExternalStore`;
 * the server snapshot is empty, since a static export has no browser to read.
 * A snapshot that does not parse throws: it is not this page's to overwrite.
 */
export const verdictStore = (test: BlindTest) => ({
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    globalThis.addEventListener('storage', listener);
    return () => {
      listeners.delete(listener);
      globalThis.removeEventListener('storage', listener);
    };
  },
  getSnapshot: (): Verdicts => {
    const stored = localStorage.getItem(storageKey(test));
    if (stored === null) return NONE;
    if (cached?.stored !== stored) {
      cached = { stored, verdicts: verdictsSchema.parse(JSON.parse(stored)) };
    }
    return cached.verdicts;
  },
  getServerSnapshot: () => NONE,
  save: (verdicts: Verdicts) => {
    localStorage.setItem(storageKey(test), JSON.stringify(verdicts));
    for (const listener of listeners) listener();
  },
});
