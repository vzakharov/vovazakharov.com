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
  type MusicAlbum,
  musicAlbumSlugs,
  type MusicProject,
  musicProjectNames,
  projectBySlug,
  projectSlug,
} from './names';
export { type CreditedName, SONG_AUTHOR } from './people';
export { MUSIC_ROUTE } from './route';
export { scriptSample, songTitle, spelledText } from './spelling';
