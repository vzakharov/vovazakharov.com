/**
 * For `scripts/` and the tests, which run with no bundler: the names and the
 * singers without the song schema, whose module is `server-only`.
 */

export {
  MUSIC_ALBUM_SLUGS,
  MUSIC_ORGANIZATION,
  MUSIC_PROJECT_NAMES,
  type MusicProject,
  SONG_DESCRIPTION_PLACEHOLDER,
} from './names.ts';
export { type Singer, singerSchema } from './singers.ts';
