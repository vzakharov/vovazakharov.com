/**
 * One song, resolved through the catalogue the way its pages resolve it, into
 * what `pnpm music:masters tag` writes: the tags, the cover, the repository it
 * writes into, and every name each of the song's files is saved under.
 */

import path from 'node:path';

import { getAbsoluteUrl } from '@/shared/config';
import { pick } from '@/shared/lib/collections';
import type { MusicAlbum } from '@/shared/music-catalogue/index.node-safe';

import { songPlacements } from '@/pages/music/lib/album-tracks';
import { albumArtist, albumTitle } from '@/pages/music/lib/albums';
import { projectName } from '@/pages/music/lib/artists';
import { entryText } from '@/pages/music/lib/lyric-notes';
import type { RepoLocation } from '@/pages/music/lib/master-url';
import { songPath } from '@/pages/music/lib/music-urls';
import { songPicture } from '@/pages/music/lib/pictures';
import {
  downloadExtensions,
  playedName,
  songHome,
  type WithExtension,
} from '@/pages/music/lib/song-files';
import { savedNames } from '@/pages/music/lib/song-names';
import { type SongDocument, sungStanzas } from '@/pages/music/lib/song-text';
import { listSongPages, songBilling } from '@/pages/music/lib/songs';

import { buildTags, type SongTags, type TagSource } from './song-tags.ts';

/** One of the song's files, the master or its MP3 copy. */
export type MasterFile = WithExtension & {
  /** Every name a page saves it under, the song's own first. */
  names: [string, ...string[]];
};

export type SongTagJob = Pick<SongDocument, 'slug' | 'fileName'> & {
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
      track !== undefined && {
        release: {
          title: albumTitle(album, 'en'),
          artist: projectName(albumArtist(album, 'en'), 'en'),
          track,
          total: releaseTotal(album, songs),
        },
      }),
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
        stream: playedName(frontmatter, songBilling(document, 'en')),
      }),
    };
  });
}
