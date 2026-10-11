import { useCallback, useSyncExternalStore } from 'react';

/**
 * The bar's switches a reader expects to find as they left them, each with
 * where it starts for a reader who has never touched it.
 */
const DEFAULTS = { shuffle: false, remaining: false };

type StoredFlag = keyof typeof DEFAULTS;

const KEY_PREFIX = 'music.player.';

/**
 * Memory is the flag's truth and `localStorage` only its copy, so a browser
 * that refuses storage — a private window, blocked site data — still gets
 * working switches, just ones that reset on reload.
 */
const flags = new Map<StoredFlag, boolean>();
const listeners = new Set<() => void>();

function load(flag: StoredFlag): boolean {
  try {
    const stored = localStorage.getItem(KEY_PREFIX + flag);

    return stored === null ? DEFAULTS[flag] : stored === 'on';
  } catch {
    return DEFAULTS[flag];
  }
}

function read(flag: StoredFlag): boolean {
  const known = flags.get(flag);

  if (known !== undefined) return known;

  const loaded = load(flag);

  flags.set(flag, loaded);

  return loaded;
}

function write(flag: StoredFlag, value: boolean) {
  flags.set(flag, value);

  try {
    localStorage.setItem(KEY_PREFIX + flag, value ? 'on' : 'off');
  } catch {
    // Storage refused: the switch still holds in memory for this visit.
  }

  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

/**
 * A switch of the bar's, remembered per browser. The static HTML is rendered
 * with every switch at its default, and hydration starts from that same value
 * before React re-renders with the stored one, so a remembered switch never
 * costs a hydration mismatch.
 */
export function useStoredFlag(flag: StoredFlag) {
  const value = useSyncExternalStore(
    subscribe,
    () => read(flag),
    () => DEFAULTS[flag],
  );

  // Stable, so a memo that closes over it is not rebuilt on every render.
  const set = useCallback(
    (next: boolean) => {
      write(flag, next);
    },
    [flag],
  );

  return [value, set] as const;
}
