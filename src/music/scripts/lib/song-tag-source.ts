/**
 * One song, resolved through the catalogue the way its pages resolve it, into
 * what `pnpm music:masters tag` writes: the tags, the cover, the repository it
 * writes into, and every name each of the song's files is saved under.
 */

import path from 'node:path';

import { getAbsoluteUrl } from '@/kernel/shared/config';
import { pick } from '@/kernel/shared/lib/collections';
import type { WithFileName } from '@/kernel/shared/typings';

import type { Slugged } from '@/blog/shared/content';

import {
  albumInfo,
  listSongPages,
  savedNames,
  songBilling,
  type SongDocument,
  songPath,
  songPicture,
  sungStanzas,
} from '@/music/shared/catalogue';
import {
  downloadExtensions,
  entryText,
  type MusicAlbum,
  playedName,
  type RepoLocation,
  songHome,
  songPlacements,
  type WithExtension,
} from '@/music/shared/catalogue/index.node-safe';

import { buildTags, type SongTags, type TagSource } from './song-tags.ts';

/** One of the song's files, the master or its MP3 copy. */
export type MasterFile = WithExtension & {
  /** Every name a page saves it under, the song's own first. */
  names: [string, ...string[]];
};

export type SongTagJob = Slugged &
  WithFileName & {
    /** Where the song's files are written. */
    home: RepoLocation;
    tags: SongTags;
    /** On disk, the JPEG the song's page shows. */
    coverPath?: string;
    /** The master first, then the MP3 where it is the master's copy. */
    files: MasterFile[];
    /**
     * Where the master is a FLAC, the name its MP4 rewrap is published under.
     * One name: no page offers it for download.
     */
    stream?: string;
  };

/** The highest number any song holds on the release, a gap in the catalogue not lowering it. */
function releaseTotal(
  album: MusicAlbum,
  songs: readonly SongDocument[],
): number {
  return Math.max(
    ...songs.flatMap(({ frontmatter }) =>
      songPlacements(frontmatter)
        .filter((placement) => placement.album === album)
        .map(({ track }) => track),
    ),
  );
}

function releaseTags(
  album: MusicAlbum,
  track: number,
  songs: readonly SongDocument[],
): NonNullable<TagSource['release']> {
  const { name, artist } = albumInfo(album, 'en');

  return {
    title: name,
    artist: artist.name,
    track,
    total: releaseTotal(album, songs),
  };
}

function tagSource(
  document: SongDocument,
  songs: readonly SongDocument[],
): TagSource {
  const { slug, frontmatter } = document;
  const { album, track, date, language, credits } = frontmatter;
  const [sung = 'instrumental'] = language;
  const stanzas = sungStanzas(document)?.map((stanza) =>
    stanza.map((entry) => entryText(entry)),
  );

  return {
    ...songBilling(document, 'en'),
    ...(album !== null &&
      track !== undefined && { release: releaseTags(album, track, songs) }),
    date,
    sungLanguage: sung,
    ...(credits && { credits }),
    ...(stanzas && { stanzas }),
    url: getAbsoluteUrl(songPath(slug)),
  };
}

/** Every song, under `publicDir` (the app's `public/`). */
export function songTagJobs(publicDir: string): SongTagJob[] {
  const songs = [...new Set(listSongPages().map(({ document }) => document))];

  return songs.map((document) => {
    const { frontmatter } = document;
    const picture = songPicture(document);

    return {
      ...pick(document, 'slug', 'fileName'),
      home: songHome(frontmatter),
      tags: buildTags(tagSource(document, songs)),
      ...(picture !== undefined && {
        coverPath: path.join(publicDir, picture),
      }),
      files: downloadExtensions(frontmatter)
        .toReversed()
        .map((extension) => ({
          extension,
          names: savedNames(document, extension),
        })),
      ...(!frontmatter.lossy && {
        stream: playedName(frontmatter, songBilling(document, 'en'), true),
      }),
    };
  });
}
