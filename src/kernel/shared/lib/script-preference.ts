import { isOneOf } from './collections';

const SCRIPTS = ['latin', 'original'] as const;

/** The two spellings a name shows in: Latin letters, the default, or its own script. */
export type Script = (typeof SCRIPTS)[number];

export const isScript = isOneOf(SCRIPTS);

export const SCRIPT_STORAGE_KEY = 'script';

/** The `<html>` attribute the stylesheet picks a spelling by, present only as `original`. */
export const SCRIPT_ATTRIBUTE = 'data-script';

/**
 * The spelling a reader who never chose starts in: the original for a browser
 * that reads Russian, the Cyrillic most names here are in, else Latin.
 *
 * It and `markScriptPreference` reach the page as their own source text, so
 * each reads nothing but its parameters and browser globals: a module binding
 * either closed over would be undefined there.
 */
export function defaultScript(languages: readonly string[]): Script {
  return languages.some(
    (language) => language.slice(0, 2).toLowerCase() === 'ru',
  )
    ? 'original'
    : 'latin';
}

/**
 * Marks `<html>` before the body paints, as Mantine's `ColorSchemeScript`
 * marks the colour scheme, so the first paint already shows the stored
 * spelling, else the default's.
 */
function markScriptPreference(
  storageKey: string,
  attribute: string,
  defaultFor: typeof defaultScript,
) {
  let stored: string | null = null;

  try {
    stored = localStorage.getItem(storageKey);
  } catch {
    // Storage refused: the browser's languages decide, as for a first visit.
  }

  if ((stored ?? defaultFor(navigator.languages)) === 'original') {
    document.documentElement.setAttribute(attribute, 'original');
  }
}

/**
 * Inlined in `<head>` by the root layout, which is why the client hook reading
 * the same choice lives in a module of its own.
 */
export const SCRIPT_PREFERENCE_SCRIPT = `(${markScriptPreference.toString()})(${JSON.stringify(
  SCRIPT_STORAGE_KEY,
)},${JSON.stringify(SCRIPT_ATTRIBUTE)},${defaultScript.toString()})`;
