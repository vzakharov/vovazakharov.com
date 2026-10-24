import { type SongBilling, songFileName, songFileNames } from './file-name.ts';
import type { Mastered, RepoHeld } from './frontmatter.ts';
import { rawUrl, type RepoLocation } from './master-url.ts';
import type { Spelled } from './spelling.ts';

/** A file's extension, lowercase and without its dot. */
export type WithExtension = { extension: string };

/** `href` is spelled as the page spells the song, each spelling a path to the same bytes. */
export type SongFile = WithExtension & { href: Spelled };

/** What a song's files are derived from beside its billing. */
export type SongHosting = RepoHeld & Mastered;

export function extensionOf(href: string): string {
  return href.slice(href.lastIndexOf('.') + 1).toLowerCase();
}

/** The branch every song's repository serves its files from. */
export const SONG_BRANCH = 'main';

/** Where every file of a song sits: its repository's root. */
export function songHome({ repo }: RepoHeld): RepoLocation {
  return { repo, branch: SONG_BRANCH, directory: '' };
}

/** Where `raw.githubusercontent.com` serves the song's file of that name. */
export function songUrl(hosting: RepoHeld, name: string): string {
  return rawUrl(songHome(hosting), name);
}

/** The extensions of the song's files to take away: the MP3, then the FLAC master it is a copy of. */
export function downloadExtensions({ lossy }: Mastered): string[] {
  return ['mp3', ...(lossy ? [] : ['flac'])];
}

/**
 * The song's files to take away, each under the name `pnpm music:masters tag`
 * saved it as for the billing.
 */
export function songFiles(
  hosting: SongHosting,
  billing: SongBilling,
): SongFile[] {
  return downloadExtensions(hosting).map((extension) => {
    const { original, latin } = songFileNames(billing, extension);

    return {
      extension,
      href: {
        original: songUrl(hosting, original),
        ...(latin !== undefined && { latin: songUrl(hosting, latin) }),
      },
    };
  });
}

/**
 * The file the player plays, under the English page's Latin name (a Russian
 * page spells its Latin names in Cyrillic): the MP3, or for a reader asking for
 * lossless, a FLAC master's MP4 rewrap, whose sample index AVFoundation — every
 * iOS browser's player — seeks exactly where a bare FLAC lands seconds off. A
 * lossy song plays its MP3 master either way.
 */
export function playedName(
  { lossy }: Mastered,
  english: SongBilling,
  lossless: boolean,
): string {
  return songFileName(english, 'latin', lossless && !lossy ? 'mp4' : 'mp3');
}
