/**
 * Name and tag every song master a `vovas-music` repository serves.
 *
 * Usage, from the repository root:
 *   pnpm music:tag [<slug> ...]           tag what drifted, push, repoint the documents
 *   pnpm music:tag --dry-run [<slug> ...] build each commit in tmp/music-tag/ and stop there
 *   pnpm music:tag --check                offline: fail naming the songs that drifted
 *   pnpm music:tag --prune                delete the paths no song derives any more
 *
 * Per repository, one commit: each song's master and MP3 copy, tagged from
 * the catalogue and checked to decode to the same audio, under every name a
 * page saves it as, and the README's mentions of the old names renamed. Then
 * each document's URLs point at the song's own name and `mp3.bytes` states
 * the tagged size.
 *
 * `tag-renders.json` beside the songs records, per song, a hash of what its
 * files were built from — tags, cover, names — and every repository path the
 * runs read or wrote, as `<repo>/<path>`. A song whose hash matches is
 * skipped, which makes an interrupted run resumable; the paths are what
 * `--prune` deletes, minus what is derived now, and it runs only once the
 * site serving the new names has deployed.
 *
 * Runs under `tsx --conditions=react-server` from the app directory, so it
 * reads the catalogue through the page's own model. Needs network, `ffmpeg`,
 * and `gh` holding a token that can push to the organization.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { collectionDir, PUBLIC_DIR } from '@/shared/content/collections';
import { contentHash } from '@/shared/content/content-hash';

import { rawUrl, servedPath } from '@/pages/music/lib/master-url';
import {
  readTagManifest,
  TAG_MANIFEST,
  type TagManifest,
} from '@/pages/music/lib/song-downloads';

import { given } from './lib/argv.ts';
import { REPO_ROOT } from './lib/content-tree.ts';
import {
  cloneRepo,
  commitStaged,
  type MusicRepo,
  readBlob,
  stageBlob,
  stagedSummary,
  treePaths,
  unstagePaths,
} from './lib/music-repo.ts';
import {
  renameMentions,
  rewriteSongDocument,
} from './lib/song-tag-rewrites.ts';
import {
  type MasterFile,
  type SongTagJob,
  songTagJobs,
} from './lib/song-tag-source.ts';
import { writeSongTags } from './lib/song-tag-writer.ts';

const WORK_DIR = path.join(REPO_ROOT, 'tmp', 'music-tag');
const README = 'README.md';

function report(line: string): void {
  process.stdout.write(`${line}\n`);
}

function writeManifest(manifest: TagManifest): void {
  const sorted = Object.entries(manifest).toSorted(([a], [b]) =>
    a.localeCompare(b),
  );

  fs.writeFileSync(
    TAG_MANIFEST,
    `${JSON.stringify(Object.fromEntries(sorted), undefined, 2)}\n`,
  );
}

function jobHash({ tags, coverPath, files }: SongTagJob): string {
  return contentHash(
    JSON.stringify({
      tags,
      cover:
        coverPath === undefined
          ? null
          : fs.readFileSync(coverPath).toString('base64'),
      names: files.map(({ directory, names }) => [directory, names]),
    }),
  );
}

const inDirectory = (directory: string, name: string): string =>
  directory === '' ? name : `${directory}/${name}`;

/** `<repo>/<path>` for each name the file is derived under. */
const derivedPaths = (file: MasterFile): string[] =>
  file.names.map((name) => servedPath(file, inDirectory(file.directory, name)));

/** The decoded audio's MD5, which tagging must leave as it was. */
function audioMd5(file: string): string {
  return execFileSync(
    'ffmpeg',
    ['-v', 'error', '-i', file, '-map', '0:a', '-f', 'md5', '-'],
    { encoding: 'utf8' },
  ).trim();
}

/** Fetches, tags and stages one file; the tagged bytes. */
function tagFile(repo: MusicRepo, job: SongTagJob, file: MasterFile): Buffer {
  const local = path.join(
    WORK_DIR,
    `${job.slug}.${file.field}.${file.extension}`,
  );

  fs.writeFileSync(local, readBlob(repo, file.sourcePath));

  const before = audioMd5(local);

  writeSongTags(local, job.tags, job.coverPath);

  if (audioMd5(local) !== before) {
    throw new Error(
      `Tagging ${file.sourcePath} in ${repo.repo} changed its audio`,
    );
  }

  const tagged = fs.readFileSync(local);

  fs.rmSync(local);
  stageBlob(
    repo,
    tagged,
    file.names.map((name) => inDirectory(file.directory, name)),
  );

  return tagged;
}

function renameInReadme(repo: MusicRepo, jobs: readonly SongTagJob[]): void {
  if (!treePaths(repo).has(README)) return;

  const renames = new Map(
    jobs.flatMap(({ files }) =>
      files.map(({ sourcePath, names }): [string, string] => [
        path.posix.basename(sourcePath),
        names[0],
      ]),
    ),
  );
  const readme = readBlob(repo, README).toString('utf8');
  const renamed = renameMentions(readme, renames);

  if (renamed !== readme) stageBlob(repo, Buffer.from(renamed), [README]);
}

function repointDocument(job: SongTagJob, mp3Bytes: number): void {
  const document = path.join(collectionDir('music'), job.fileName);
  const changes = job.files
    .map((file) => ({
      oldUrl: file.url,
      newUrl: rawUrl(file, file.names[0]),
    }))
    .filter(({ oldUrl, newUrl }) => oldUrl !== newUrl);

  fs.writeFileSync(
    document,
    rewriteSongDocument(fs.readFileSync(document, 'utf8'), changes, mp3Bytes),
  );
}

/** Two songs in one repository that a page would save under the same path. */
function assertNoCollision(jobs: readonly SongTagJob[]): void {
  const holders = new Map<string, string>();

  for (const job of jobs) {
    for (const derived of job.files.flatMap((file) => derivedPaths(file))) {
      const holder = holders.get(derived);

      if (holder !== undefined && holder !== job.slug) {
        throw new Error(`${holder} and ${job.slug} both save as ${derived}`);
      }
      holders.set(derived, job.slug);
    }
  }
}

function songRepo(job: SongTagJob): MasterFile {
  const [first, ...rest] = job.files;

  if (
    first === undefined ||
    rest.some(
      ({ repo, branch }) => repo !== first.repo || branch !== first.branch,
    )
  ) {
    throw new Error(`${job.fileName}'s files are not in one repository`);
  }

  return first;
}

function byRepository(
  jobs: readonly SongTagJob[],
): Map<string, { branch: string; jobs: SongTagJob[] }> {
  const groups = new Map<string, { branch: string; jobs: SongTagJob[] }>();

  for (const job of jobs) {
    const { repo, branch } = songRepo(job);
    const group = groups.get(repo) ?? { branch, jobs: [] };

    group.jobs.push(job);
    groups.set(repo, group);
  }

  return groups;
}

function tagRepository(
  name: string,
  branch: string,
  jobs: readonly SongTagJob[],
  manifest: TagManifest,
  dryRun: boolean,
): void {
  const repo = cloneRepo(name, branch, WORK_DIR);
  const mp3Bytes = new Map<string, number>();

  for (const job of jobs) {
    for (const file of job.files) {
      const tagged = tagFile(repo, job, file);

      if (file.extension === 'mp3') mp3Bytes.set(job.slug, tagged.length);
    }
  }

  renameInReadme(repo, jobs);
  report(`${name}:\n${stagedSummary(repo)}`);
  commitStaged(repo, 'chore: name and tag the masters for download', !dryRun);

  // A dry run keeps the clone and its unpushed commit to look at.
  if (dryRun) return;

  fs.rmSync(repo.dir, { recursive: true, force: true });

  for (const job of jobs) {
    const bytes = mp3Bytes.get(job.slug);

    if (bytes === undefined) throw new Error(`${job.fileName} has no MP3`);
    repointDocument(job, bytes);
    manifest[job.slug] = {
      hash: jobHash(job),
      paths: [
        ...new Set([
          ...(manifest[job.slug]?.paths ?? []),
          ...job.files.map((file) => servedPath(file, file.sourcePath)),
          ...job.files.flatMap((file) => derivedPaths(file)),
        ]),
      ].toSorted(),
    };
  }
  writeManifest(manifest);
}

function prune(jobs: readonly SongTagJob[], manifest: TagManifest): void {
  for (const [name, group] of byRepository(jobs)) {
    const derived = new Set(
      group.jobs.flatMap(({ files }) =>
        files.flatMap((file) => derivedPaths(file)),
      ),
    );
    const recorded = group.jobs.flatMap(
      ({ slug }) => manifest[slug]?.paths ?? [],
    );
    const gone = recorded.filter((at) => !derived.has(at));

    if (gone.length === 0) continue;

    const repo = cloneRepo(name, group.branch, WORK_DIR);
    const held = treePaths(repo);

    unstagePaths(
      repo,
      gone.map((at) => at.slice(name.length + 1)).filter((at) => held.has(at)),
    );
    report(`${name}:\n${stagedSummary(repo)}`);
    commitStaged(repo, "chore: prune the masters' old names", true);
    fs.rmSync(repo.dir, { recursive: true, force: true });

    for (const job of group.jobs) {
      const entry = manifest[job.slug];

      if (entry !== undefined) {
        entry.paths = entry.paths.filter((at) => derived.has(at));
      }
    }
    writeManifest(manifest);
  }
}

function selectedJobs(): SongTagJob[] {
  const all = songTagJobs(PUBLIC_DIR);
  const slugs = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));
  const unknown = slugs.filter((slug) => !all.some((job) => job.slug === slug));

  if (unknown.length > 0) {
    throw new Error(
      `No song a vovas-music repository serves: ${unknown.join(', ')}`,
    );
  }

  return slugs.length === 0
    ? all
    : all.filter((job) => slugs.includes(job.slug));
}

function main(): void {
  const jobs = selectedJobs();
  const manifest = readTagManifest();

  if (given('prune')) {
    prune(jobs, manifest);
    return;
  }

  const stale = jobs.filter((job) => manifest[job.slug]?.hash !== jobHash(job));

  report(`${jobs.length} song(s), ${stale.length} to tag.`);

  if (given('check')) {
    for (const job of stale) report(`  stale: ${job.slug}`);
    process.exitCode = stale.length > 0 ? 1 : 0;
    return;
  }

  assertNoCollision(songTagJobs(PUBLIC_DIR));

  for (const [name, { branch, jobs: group }] of byRepository(stale)) {
    tagRepository(name, branch, group, manifest, given('dry-run'));
  }
}

main();
