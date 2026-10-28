/**
 * Where a tag job's files are: every `<repo>/<path>` it derives, the hash of
 * what it builds them from, and where each file's current bytes are read.
 */

import fs from 'node:fs';

import { pick } from '@/kernel/shared/lib/collections';
import { contentHash } from '@/kernel/shared/lib/content-hash';
import type { WithPath } from '@/kernel/shared/typings';

import { TAG_MANIFEST } from '@/music/shared/catalogue';
import {
  extensionOf,
  servedPath,
  type WithRepo,
} from '@/music/shared/catalogue/index.node-safe';

import type { MasterFile, SongTagJob } from './song-tag-source.ts';

/** A file in a repository, as `tag-renders.json` records it. */
export type Served = WithRepo & WithPath;

export function jobHash({
  home,
  tags,
  coverPath,
  files,
  stream,
}: SongTagJob): string {
  return contentHash(
    JSON.stringify({
      tags,
      cover:
        coverPath === undefined
          ? null
          : fs.readFileSync(coverPath).toString('base64'),
      names: files.map(({ names }) => [home.directory, names]),
      stream: stream ?? null,
    }),
  );
}

/** `<repo>/<path>` for each name the file is derived under. */
const derivedPaths = ({ home }: SongTagJob, { names }: MasterFile): string[] =>
  names.map((name) => servedPath(home, name));

/** The FLAC master a job's stream is rewrapped from, named as the stream. */
export function streamFile(job: SongTagJob): MasterFile | undefined {
  const master = job.files.find(({ extension }) => extension === 'flac');

  return job.stream === undefined || master === undefined
    ? undefined
    : { ...master, extension: 'mp4', names: [job.stream] };
}

/** `<repo>/<path>` of every file the job derives, its stream included. */
export function jobPaths(job: SongTagJob): string[] {
  const stream = streamFile(job);

  return [job.files, stream === undefined ? [] : [stream]]
    .flat()
    .flatMap((file) => derivedPaths(job, file));
}

export function parseServed(at: string): Served {
  const slash = at.indexOf('/');

  return { repo: at.slice(0, slash), path: at.slice(slash + 1) };
}

/**
 * Where the file's current bytes are: under a name it derives in the song's
 * own repository, else at a path a run recorded with its extension, the
 * song's own repository first.
 */
export function sourceOf(
  job: SongTagJob,
  file: MasterFile,
  held: ReadonlySet<string>,
  recorded: readonly string[],
): Served {
  const own = file.names.find((name) => held.has(name));

  if (own !== undefined) return { ...pick(job.home, 'repo'), path: own };

  const sources = recorded
    .map((at) => parseServed(at))
    .filter(({ path: at }) => extensionOf(at) === file.extension);
  const source =
    sources.find(({ repo }) => repo === job.home.repo) ?? sources[0];

  if (source === undefined) {
    throw new Error(
      `${job.fileName}: no ${file.extension} under its names in ${job.home.repo}, and none recorded in ${TAG_MANIFEST}`,
    );
  }

  return source;
}

/** Two songs in one repository that would publish a file at the same path. */
export function assertNoCollision(jobs: readonly SongTagJob[]): void {
  const holders = new Map<string, string>();

  for (const job of jobs) {
    for (const derived of jobPaths(job)) {
      const holder = holders.get(derived);

      if (holder !== undefined && holder !== job.slug) {
        throw new Error(`${holder} and ${job.slug} both save as ${derived}`);
      }
      holders.set(derived, job.slug);
    }
  }
}
