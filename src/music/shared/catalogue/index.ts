export type { SongBilling } from './file-name';
export {
  albumFrontmatterSchema,
  type AlbumPlacement,
  artistFrontmatterSchema,
  type LocalName,
  type Playable,
  type SongFrontmatter,
  SONGS,
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
export {
  mostlyNeedsLatin,
  scriptSample,
  songTitle,
  spelledText,
} from './spelling';
