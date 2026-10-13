/**
 * For `scripts/`, the tests and client components, none of which may take the
 * schema, whose module is `server-only`: the names and the spellings.
 */

export {
  MUSIC_ALBUM_SLUGS,
  MUSIC_PROJECT_NAMES,
  MUSIC_PROJECT_SLUGS,
  type MusicProject,
} from './names.ts';
export { MUSIC_ORGANIZATION } from './organization.ts';
export { romanizeRussian } from './romanize.ts';
export {
  spell,
  type Spelled,
  spelledText,
  type WithSpelledName,
} from './spelling.ts';
