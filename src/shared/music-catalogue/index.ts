export {
  albumFrontmatterSchema,
  type AlbumPlacement,
  artistFrontmatterSchema,
  type LocalName,
  type Playable,
  type SongFrontmatter,
  songFrontmatterSchema,
  type SongText,
  type SungLanguage,
  type TitleGloss,
} from './frontmatter';
export { type HookRun, hookRuns, textHook } from './hook-marks';
export {
  MUSIC_ALBUM_SLUGS,
  MUSIC_PROJECT_NAMES,
  type MusicAlbum,
  type MusicProject,
  projectBySlug,
  projectSlug,
} from './names';
export { type CreditedName, SONG_AUTHOR } from './people';
export { MUSIC_ROUTE } from './route';
export {
  mostlyNeedsLatin,
  scriptSample,
  songTitle,
  spelledText,
} from './spelling';
