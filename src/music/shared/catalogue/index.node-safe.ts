/**
 * For `scripts/`, the tests and client components: the runtime graph behind it
 * reaches no `server-only`, filesystem or zod. A script reads the names
 * themselves through `index.no-browser.ts`.
 */

export { songPlacements } from './album-tracks.ts';
export { type CreditedName, SONG_AUTHOR } from './author.ts';
export { billedArtists, type SongBilling } from './file-name.ts';
export { hookRuns } from './hook-marks.ts';
export { inlineRuns } from './lyric-inline.ts';
export { entryText, type LyricLine, type WithStanzas } from './lyric-notes.ts';
export {
  type RepoBranch,
  type RepoLocation,
  servedPath,
  type WithBranch,
  type WithRepo,
} from './master-url.ts';
// Types only: the schemas are zod, which a client component entering this
// barrel would carry into every song page's bundle.
export type { MusicAlbum } from './name-brands.ts';
export { MUSIC_ORGANIZATION } from './organization.ts';
export { bill, songRepositoryUrl } from './projects.ts';
export {
  localeProse,
  splitSections,
  type StoryHeadings,
  storyOrder,
} from './sections.ts';
export {
  downloadExtensions,
  extensionOf,
  playedName,
  SONG_BRANCH,
  type SongFile,
  songHome,
  type WithExtension,
} from './song-files.ts';
export {
  type Spelled,
  spelledText,
  type WithSpelledTitle,
} from './spelling.ts';
export {
  type Billing,
  billingText,
  hasLossless,
  type PlayerTrack,
  type SpelledLink,
  trackSource,
  type WithTrack,
  type WithTracks,
} from './track.ts';
export { romanizedTag, type Transliteration } from './transliteration.ts';
