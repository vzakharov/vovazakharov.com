import { useSyncExternalStore } from 'react';

import {
  defaultScript,
  isScript,
  type Script,
  SCRIPT_ATTRIBUTE,
  SCRIPT_STORAGE_KEY,
} from './script-preference';

/**
 * Memory is the choice's truth and `localStorage` only its copy, so a browser
 * that refuses storage still switches, just not across a reload. `undefined`
 * is not yet read; `null` is never chosen.
 */
let chosen: Script | null | undefined;
const listeners = new Set<() => void>();

function load(): Script | null {
  try {
    const stored = localStorage.getItem(SCRIPT_STORAGE_KEY);

    return isScript(stored) ? stored : null;
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
    document.documentElement.setAttribute(SCRIPT_ATTRIBUTE, script);
  } else {
    document.documentElement.removeAttribute(SCRIPT_ATTRIBUTE);
  }
}

function choose(script: Script) {
  chosen = script;

  try {
    localStorage.setItem(SCRIPT_STORAGE_KEY, script);
  } catch {
    // Storage refused: the choice still holds in memory for this visit.
  }

  mark(script);

  for (const listener of listeners) listener();
}

/** Another tab's choice arrives as a `storage` event, and this one follows it. */
function subscribe(listener: () => void) {
  function onStorage({ key }: StorageEvent) {
    if (key !== SCRIPT_STORAGE_KEY) return;

    chosen = load();
    mark(current());
    listener();
  }

  listeners.add(listener);
  globalThis.addEventListener('storage', onStorage);

  return () => {
    listeners.delete(listener);
    globalThis.removeEventListener('storage', onStorage);
  };
}

function current(): Script {
  return read() ?? defaultScript(navigator.languages);
}

/**
 * The reader's spelling, for what takes a string rather than markup. The
 * static HTML and hydration render in Latin; the head script has already shown
 * the reader's spelling by then, so only string consumers re-render.
 */
export function useScriptPreference() {
  const script = useSyncExternalStore<Script>(
    subscribe,
    current,
    () => 'latin',
  );

  return { script, choose };
}
