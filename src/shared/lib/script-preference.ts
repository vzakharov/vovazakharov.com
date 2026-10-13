/** The two spellings a name shows in: Latin letters, the default, or its own script. */
export type Script = 'latin' | 'original';

export const SCRIPT_STORAGE_KEY = 'script';

/**
 * Set on `<html>` before the body paints, as Mantine's `ColorSchemeScript`
 * sets the colour scheme, so the first paint already shows the stored
 * spelling. Only `original` is marked, Latin being what an unmarked page shows.
 * The root layout renders it, which is why the client hook that reads the same
 * choice lives in a module of its own.
 */
export const SCRIPT_PREFERENCE_SCRIPT = `try{if(localStorage.getItem('${SCRIPT_STORAGE_KEY}')==='original')document.documentElement.setAttribute('data-script','original')}catch(e){}`;
