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
export { hookRuns, textHook } from './hook-marks';
export {
  MUSIC_ALBUM_SLUGS,
  MUSIC_PROJECT_NAMES,
  MUSIC_PROJECT_SLUGS,
  type MusicAlbum,
  type MusicProject,
} from './names';
export { type CreditedName, SONG_AUTHOR } from './people';
export {
  mostlyNeedsLatin,
  scriptSample,
  songTitle,
  spelledText,
} from './spelling';
