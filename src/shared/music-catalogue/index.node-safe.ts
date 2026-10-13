/**
 * For `scripts/`, the tests and client components, none of which may take the
 * schema, whose module is `server-only`: the names and the spellings.
 */

export {
  MUSIC_ALBUM_SLUGS,
  MUSIC_ORGANIZATION,
  MUSIC_PROJECT_NAMES,
  type MusicProject,
} from './names.ts';
export { romanizeRussian } from './romanize.ts';
export {
  defaultSpelling,
  mostlyNeedsLatin,
  needsLatin,
  spell,
  type Spellable,
  type Spelled,
  songTitle,
} from './spelling.ts';
