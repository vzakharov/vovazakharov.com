import type { SongFrontmatter } from '@/shared/music-catalogue';
import type { Linked } from '@/shared/typings';

/** A file's extension, lowercase and without its dot. */
export type WithExtension = { extension: string };

export type SongFile = Linked & WithExtension;

export function extensionOf(href: string): string {
  return href.slice(href.lastIndexOf('.') + 1).toLowerCase();
}

/** The song's files to take away: the MP3 first, then the master where the MP3 is a copy of it. */
export function songFiles({
  audio,
  mp3,
}: Pick<SongFrontmatter, 'audio' | 'mp3'>): SongFile[] {
  return [mp3.url ?? audio, ...(mp3.url === undefined ? [] : [audio])].map(
    (href) => ({ extension: extensionOf(href), href }),
  );
}
