import { useSyncExternalStore } from 'react';

/** The two spellings a name shows in: Latin letters, the default, or its own script. */
export type Script = 'latin' | 'original';

const STORAGE_KEY = 'script';

/**
 * Set on `<html>` before the body paints, as Mantine's `ColorSchemeScript`
 * sets the colour scheme, so the first paint already shows the stored
 * spelling. Only `original` is marked, Latin being what an unmarked page shows.
 */
export const SCRIPT_PREFERENCE_SCRIPT = `try{if(localStorage.getItem('${STORAGE_KEY}')==='original')document.documentElement.setAttribute('data-script','original')}catch(e){}`;

/**
 * Memory is the choice's truth and `localStorage` only its copy, so a browser
 * that refuses storage still switches, just not across a reload. `undefined`
 * is not yet read; `null` is never chosen.
 */
let chosen: Script | null | undefined;
const listeners = new Set<() => void>();

function load(): Script | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    return stored === 'latin' || stored === 'original' ? stored : null;
  } catch {
    return null;
  }
}

function read(): Script | null {
  if (chosen === undefined) chosen = load();

  return chosen;
}

function mark(script: Script) {
  if (script === 'original') {
    document.documentElement.dataset['script'] = 'original';
  } else {
    delete document.documentElement.dataset['script'];
  }
}

function choose(script: Script) {
  chosen = script;

  try {
    localStorage.setItem(STORAGE_KEY, script);
  } catch {
    // Storage refused: the choice still holds in memory for this visit.
  }

  mark(script);

  for (const listener of listeners) listener();
}

/** Another tab's choice arrives as a `storage` event, and this one follows it. */
function subscribe(listener: () => void) {
  function onStorage({ key }: StorageEvent) {
    if (key !== STORAGE_KEY) return;

    chosen = load();
    mark(chosen ?? 'latin');
    listener();
  }

  listeners.add(listener);
  globalThis.addEventListener('storage', onStorage);

  return () => {
    listeners.delete(listener);
    globalThis.removeEventListener('storage', onStorage);
  };
}

/**
 * The reader's spelling, for what takes a string rather than markup, and
 * whether they ever chose one, which the tip waits on. The static HTML and
 * hydration render as never chosen; the head script has already shown the
 * stored spelling by then, so only string consumers re-render.
 */
export function useScriptPreference() {
  const choice = useSyncExternalStore(subscribe, read, () => null);

  return { script: choice ?? 'latin', chosen: choice !== null, choose };
}
