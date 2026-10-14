/**
 * One song, resolved through the catalogue the way its pages resolve it, into
 * what `pnpm music:tag` writes: the tags, the cover, and for each of its files
 * the repository path it is read from and every name it is saved under.
 */

import path from 'node:path';

import { listSongPages, songBilling } from '@/pages/music/lib/songs';
import { albumArtist, albumTitle } from '@/pages/music/lib/albums';
import { projectName } from '@/pages/music/lib/artists';
import { songPlacements } from '@/pages/music/lib/album-tracks';
import { entryText } from '@/pages/music/lib/lyric-notes';
import { songPath } from '@/pages/music/lib/music-urls';
import { songPicture } from '@/pages/music/lib/pictures';
import { type SongDocument, sungStanzas } from '@/pages/music/lib/song-text';
import { getAbsoluteUrl } from '@/shared/config';
import { isLocale, type Locale, LOCALES } from '@/shared/i18n';
import {
  type MusicAlbum,
  MUSIC_ORGANIZATION,
  songFileName,
  songFileNames,
} from '@/shared/music-catalogue/index.node-safe';

import { buildTags, type SongTags, type TagSource } from './song-tags.ts';

const RAW_HOST = 'raw.githubusercontent.com';

/** The frontmatter fields that hold a file's URL. */
export type MasterField = 'audio' | 'mp3';

/** Where a file lives in its repository, read off its raw URL. */
type RepoLocation = {
  repo: string;
  branch: string;
  /** The file's directory in the repository, `''` at its root. */
  directory: string;
};

export type MasterFile = RepoLocation & {
  field: MasterField;
  /** The URL the frontmatter states now. */
  url: string;
  /** The repository path that URL serves. */
  source: string;
  extension: string;
  /** Every name a page saves it under, the frontmatter's own first. */
  names: [string, ...string[]];
};

export type SongTagJob = {
  slug: string;
  fileName: string;
  tags: SongTags;
  /** On disk, the JPEG the song's page shows. */
  cover?: string;
  files: MasterFile[];
};

/** `null` for a file no `vovas-music` repository serves. */
function repoPath(url: string): (RepoLocation & { path: string }) | null {
  // A site-root path is a file the site hosts itself.
  if (!URL.canParse(url)) return null;

  const { host, pathname } = new URL(url);
  const [, organization, repo, branch, ...segments] = pathname.split('/');

  if (
    host !== RAW_HOST ||
    organization !== MUSIC_ORGANIZATION ||
    repo === undefined ||
    branch === undefined ||
    segments.length === 0
  ) {
    return null;
  }

  const decoded = segments.map((segment) => decodeURIComponent(segment));

  return {
    repo,
    branch,
    directory: decoded.slice(0, -1).join('/'),
    path: decoded.join('/'),
  };
}

/** The URL a repository serves `name` at, beside the file it replaces. */
export function rawUrl(
  { repo, branch, directory }: RepoLocation,
  name: string,
): string {
  const segments = [...(directory === '' ? [] : directory.split('/')), name];

  return `https://${RAW_HOST}/${MUSIC_ORGANIZATION}/${repo}/${branch}/${segments.map((segment) => encodeURIComponent(segment)).join('/')}`;
}

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
  const urls: [MasterField, string][] = [
    ['audio', audio],
    ...(mp3.url === undefined ? [] : [['mp3', mp3.url] as const]),
  ];

  return urls.flatMap(([field, url]) => {
    const location = repoPath(url);

    if (location === null) return [];

    const { path: source, ...where } = location;
    const extension = source.slice(source.lastIndexOf('.') + 1).toLowerCase();

    return [
      {
        ...where,
        field,
        url,
        source,
        extension,
        names: fileNames(document, extension),
      },
    ];
  });
}

/** The highest number any song holds on the release, a gap in the catalogue not lowering it. */
function releaseTotal(album: MusicAlbum, songs: readonly SongDocument[]): number {
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
    language: sung,
    ...(credits && { credits }),
    ...(stanzas && { stanzas }),
    url: getAbsoluteUrl(songPath(slug)),
  };
}

/** Every song a `vovas-music` repository serves, under `publicDir` (the app's `public/`). */
export function songTagJobs(publicDir: string): SongTagJob[] {
  const songs = [
    ...new Set(listSongPages().map(({ document }) => document)),
  ];

  return songs.flatMap((document) => {
    const files = masterFiles(document);

    if (files.length === 0) return [];

    const picture = songPicture(document);

    return [
      {
        slug: document.slug,
        fileName: document.fileName,
        tags: buildTags(tagSource(document, songs)),
        ...(picture !== undefined && {
          cover: path.join(publicDir, picture),
        }),
        files,
      },
    ];
  });
}
