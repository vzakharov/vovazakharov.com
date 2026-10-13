import { isOneOf } from './collections';

const SCRIPTS = ['latin', 'original'] as const;

/** The two spellings a name shows in: Latin letters, the default, or its own script. */
export type Script = (typeof SCRIPTS)[number];

export const isScript = isOneOf(SCRIPTS);

export const SCRIPT_STORAGE_KEY = 'script';

/** The `<html>` attribute the stylesheet picks a spelling by, present only as `original`. */
export const SCRIPT_ATTRIBUTE = 'data-script';

/** The browser language whose readers start in the original: they read the Cyrillic most names here are in. */
const ORIGINAL_READERS = 'ru';

/** The spelling a reader who never chose starts in, by the browser's languages. */
export function defaultScript(languages: readonly string[]): Script {
  return languages.some(
    (language) => language.slice(0, 2).toLowerCase() === ORIGINAL_READERS,
  )
    ? 'original'
    : 'latin';
}

/**
 * Marks `<html>` before the body paints, as Mantine's `ColorSchemeScript`
 * marks the colour scheme, so the first paint already shows the stored
 * spelling, else `defaultScript`'s, which it restates.
 *
 * It reaches the page as its own source text, so it reads nothing but its
 * parameters and browser globals: a module binding it closed over would be
 * undefined there.
 */
function markScriptPreference(
  storageKey: string,
  attribute: string,
  originalReaders: string,
) {
  let stored: string | null = null;

  try {
    stored = localStorage.getItem(storageKey);
  } catch {
    // Storage refused: the browser's languages decide, as for a first visit.
  }

  const script =
    stored ??
    (navigator.languages.some(
      (language) => language.slice(0, 2).toLowerCase() === originalReaders,
    )
      ? 'original'
      : 'latin');

  if (script === 'original') {
    document.documentElement.setAttribute(attribute, script);
  }
}

/**
 * `markScriptPreference` called with this module's constants. The root layout
 * inlines it in `<head>`, which is why the client hook that reads the same
 * choice lives in a module of its own.
 */
export const SCRIPT_PREFERENCE_SCRIPT = `(${markScriptPreference.toString()})(${[
  SCRIPT_STORAGE_KEY,
  SCRIPT_ATTRIBUTE,
  ORIGINAL_READERS,
]
  .map((argument) => JSON.stringify(argument))
  .join(',')})`;
