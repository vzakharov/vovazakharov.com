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
 * Set on `<html>` before the body paints, as Mantine's `ColorSchemeScript`
 * sets the colour scheme, so the first paint already shows the stored
 * spelling, else `defaultScript`'s, which it restates. The root layout renders
 * it, which is why the client hook that reads the same choice lives in a module
 * of its own.
 *
 * It renders as a plain `<script>` child, which React HTML-escapes, so it must
 * hold none of `" & ' < >` — its strings are backtick-quoted, and it has no
 * arrow function or `&&`, for that reason.
 */
export const SCRIPT_PREFERENCE_SCRIPT = `try{var s=localStorage.getItem(\`${SCRIPT_STORAGE_KEY}\`);if(s===null)s=navigator.languages.some(function(l){return l.slice(0,2).toLowerCase()===\`${ORIGINAL_READERS}\`})?\`original\`:\`latin\`;if(s===\`original\`)document.documentElement.setAttribute(\`${SCRIPT_ATTRIBUTE}\`,\`original\`)}catch(e){}`;
