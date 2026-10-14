import type { SongFrontmatter } from '@/shared/music-catalogue';
import {
  type SongBilling,
  songFileNames,
  type Spelled,
} from '@/shared/music-catalogue/index.node-safe';

import { masterLocation, rawUrl } from './master-url';

/** A file's extension, lowercase and without its dot. */
export type WithExtension = { extension: string };

/** `href` is spelled as the page spells the song, each spelling a path to the same bytes. */
export type SongFile = WithExtension & { href: Spelled };

export function extensionOf(href: string): string {
  return href.slice(href.lastIndexOf('.') + 1).toLowerCase();
}

function namedHref(
  href: string,
  extension: string,
  billing: SongBilling | undefined,
): Spelled {
  const location = masterLocation(href);

  if (billing === undefined || location === null) return { original: href };

  const { original, latin } = songFileNames(billing, extension);

  return {
    original: rawUrl(location, original),
    ...(latin !== undefined && { latin: rawUrl(location, latin) }),
  };
}

/**
 * The song's files to take away: the MP3 first, then the master where the MP3
 * is a copy of it. With a billing, a file a `vovas-music` repository serves is
 * linked under the name `pnpm music:tag` saved it as for that billing; without
 * one, and for a file the site hosts, under the URL the frontmatter states.
 */
export function songFiles(
  { audio, mp3 }: Pick<SongFrontmatter, 'audio' | 'mp3'>,
  billing?: SongBilling,
): SongFile[] {
  return [mp3.url ?? audio, ...(mp3.url === undefined ? [] : [audio])].map(
    (href) => {
      const extension = extensionOf(href);

      return { extension, href: namedHref(href, extension, billing) };
    },
  );
}
