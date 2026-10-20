export type { SongBilling } from './file-name';
export {
  albumFrontmatterSchema,
  type AlbumPlacement,
  artistFrontmatterSchema,
  type CreditedSong,
  type LocalName,
  type Mastered,
  type Playable,
  type Released,
  type RepoHeld,
  type ScriptKept,
  type SongFrontmatter,
<<<<<<< HEAD:src/music/shared/catalogue/index.ts
  SONGS,
  type SongText,
=======
  songFrontmatterSchema,
>>>>>>> origin/main:src/shared/music-catalogue/index.ts
  type SungLanguage,
  type TitleGloss,
  type Tracked,
  type UntitledSongText,
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
