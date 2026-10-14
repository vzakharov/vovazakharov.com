import type { Mastered, Mp3Copied } from '@/shared/music-catalogue';
import type { Linked } from '@/shared/typings';

export type SongFile = Linked & { extension: string };

function extensionOf(href: string): string {
  return href.slice(href.lastIndexOf('.') + 1).toLowerCase();
}

/** The song's files to take away: the MP3 first, then the master where the MP3 is a copy of it. */
export function songFiles({ audio, mp3 }: Mastered & Mp3Copied): SongFile[] {
  return [mp3.url ?? audio, ...(mp3.url === undefined ? [] : [audio])].map(
    (href) => ({ extension: extensionOf(href), href }),
  );
}
