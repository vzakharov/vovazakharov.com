/**
 * For `scripts/`, the tests and client components, none of which may take the
 * schema, whose module is `server-only`: the name brands' types and the spellings.
 * A script reads the names themselves off `catalogue-names.ts`.
 */

// Types only: the schemas are zod, which a client component entering this
// barrel would carry into every song page's bundle.
export type { MusicAlbum, MusicProject } from './name-brands.ts';
export { MUSIC_ORGANIZATION } from './organization.ts';
export { romanizeRussian } from './romanize.ts';
export {
  spell,
  type Spelled,
  spelledText,
  type WithSpelledName,
} from './spelling.ts';
