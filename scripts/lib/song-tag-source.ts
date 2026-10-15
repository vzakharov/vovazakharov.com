/**
 * One song, resolved through the catalogue the way its pages resolve it, into
 * what `pnpm music:masters tag` writes: the tags, the cover, and for each of its files
 * the repository path it is read from and every name it is saved under.
 */

import path from 'node:path';

import { getAbsoluteUrl } from '@/shared/config';
import { isLocale, type Locale, LOCALES } from '@/shared/i18n';
import { pick } from '@/shared/lib/collections';
import {
  type MusicAlbum,
  songFileName,
  songFileNames,
} from '@/shared/music-catalogue/index.node-safe';
import type { WithUrl } from '@/shared/typings';

import { songPlacements } from '@/pages/music/lib/album-tracks';
import { albumArtist, albumTitle } from '@/pages/music/lib/albums';
import { projectName } from '@/pages/music/lib/artists';
import { entryText } from '@/pages/music/lib/lyric-notes';
import {
  masterLocation,
  type RepoLocation,
} from '@/pages/music/lib/master-url';
import { songPath } from '@/pages/music/lib/music-urls';
import { songPicture } from '@/pages/music/lib/pictures';
import { extensionOf, type WithExtension } from '@/pages/music/lib/song-files';
import { type SongDocument, sungStanzas } from '@/pages/music/lib/song-text';
import { listSongPages, songBilling } from '@/pages/music/lib/songs';

import { buildTags, type SongTags, type TagSource } from './song-tags.ts';

/** The frontmatter fields that hold a file's URL. */
type MasterField = 'audio' | 'mp3';

/** `url` is the one the frontmatter states now. */
export type MasterFile = RepoLocation &
  WithUrl &
  WithExtension & {
    field: MasterField;
    /** The repository path that URL serves. */
    sourcePath: string;
    /** Every name a page saves it under, the frontmatter's own first. */
    names: [string, ...string[]];
  };

export type SongTagJob = Pick<SongDocument, 'slug' | 'fileName'> & {
  tags: SongTags;
  /** On disk, the JPEG the song's page shows. */
  coverPath?: string;
  files: MasterFile[];
  /**
   * Where the master is a FLAC, the name its MP4 rewrap is published under
   * beside it — what the player streams, AVFoundation seeking a bare FLAC by
   * estimate. One Latin name: no page offers it for download.
   */
  stream?: string;
};

/** The locale whose page calls the song by its own name, the one it is sung in first. */
function ownLocale({ frontmatter }: SongDocument): Locale {
  const keepsName = (locale: Locale) =>
    typeof frontmatter[locale].title !== 'string';
  const sung = frontmatter.titleLanguage ?? frontmatter.language[0];

  return isLocale(sung) && keepsName(sung)
    ? sung
    : (LOCALES.find((locale) => keepsName(locale)) ?? 'en');
}

function fileNames(
  document: SongDocument,
  extension: string,
): [string, ...string[]] {
  const own = songFileName(
    songBilling(document, ownLocale(document)),
    'original',
    extension,
  );
  const pages = LOCALES.flatMap((locale) =>
    Object.values(songFileNames(songBilling(document, locale), extension)),
  );

  return [own, ...new Set(pages).difference(new Set([own]))];
}

function masterFiles(document: SongDocument): MasterFile[] {
  const { audio, mp3 } = document.frontmatter;
  const urls: Array<[MasterField, string]> =
    mp3.url === undefined
      ? [['audio', audio]]
      : [
          ['audio', audio],
          ['mp3', mp3.url],
        ];

  return urls.flatMap(([field, url]) => {
    const location = masterLocation(url);

    if (location === null) return [];

    const { path: sourcePath, ...where } = location;
    const extension = extensionOf(sourcePath);

    return [
      {
        ...where,
        field,
        url,
        sourcePath,
        extension,
        names: fileNames(document, extension),
      },
    ];
  });
}

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

/** Every song a `vovas-music` repository serves, under `publicDir` (the app's `public/`). */
export function songTagJobs(publicDir: string): SongTagJob[] {
  const songs = [...new Set(listSongPages().map(({ document }) => document))];

  return songs.flatMap((document) => {
    const files = masterFiles(document);

    if (files.length === 0) return [];

    const picture = songPicture(document);
    const flac = files.some(
      ({ field, extension }) => field === 'audio' && extension === 'flac',
    );

    return [
      {
        ...pick(document, 'slug', 'fileName'),
        tags: buildTags(tagSource(document, songs)),
        ...(picture !== undefined && {
          coverPath: path.join(publicDir, picture),
        }),
        files,
        ...(flac && {
          // The English page's billing: a Russian page spells its Latin
          // names in Cyrillic.
          stream: songFileName(songBilling(document, 'en'), 'latin', 'mp4'),
        }),
      },
    ];
  });
}
