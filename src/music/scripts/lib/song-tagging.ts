/**
 * Naming and tagging every song's files in its `vovas-music` repository —
 * `pnpm music:masters`' `tag`, `check` and `prune`.
 *
 * Per repository, one commit: each song's master and MP3 copy, tagged from
 * the catalogue and checked to decode to the same audio, under every name a
 * page saves it as, at the repository's root; a FLAC master's MP4 rewrap,
 * which the player streams on lossless; and the README's mentions of the old
 * names renamed. Then each document's `mp3Bytes` states the tagged size —
 * every URL is derived, so nothing else in it moves.
 *
 * `tag-renders.json` beside the songs records, per song, a hash of what its
 * files were built from — tags, cover, names — and every repository path the
 * runs read or wrote, as `<repo>/<path>`. A song is stale while its hash
 * differs or a path it derives was never recorded, which makes an
 * interrupted run resumable and a song moved to another repository a song to
 * tag. `prune` deletes the recorded paths no song derives any more, and runs
 * only once the site serving the new names has deployed.
 *
 * Runs under `tsx --conditions=react-server` from the site directory, so it
 * reads the catalogue through the page's own model. Needs network and
 * `ffmpeg`.
 */

import fs from 'node:fs';
import path from 'node:path';

import { PUBLIC_DIR } from '@/kernel/shared/config/index.node-safe';

import { collectionDir } from '@/blog/shared/content/index.node-safe';

import {
  readTagManifest,
  type TagManifest,
  writeTagManifest,
} from '@/music/shared/catalogue';
import { servedPath } from '@/music/shared/catalogue/index.node-safe';

import {
  cloneRepo,
  commitStaged,
  defaultBranch,
  MUSIC_WORK_DIR,
  type MusicRepo,
  readBlob,
  removeClone,
  stageBlob,
  stagedSummary,
  treePaths,
  unstagePaths,
} from './music-repo.ts';
import { stageStream, tagFile } from './song-tag-audio.ts';
import {
  assertNoCollision,
  jobHash,
  jobPaths,
  parseServed,
  type Served,
  sourceOf,
  streamFile,
} from './song-tag-paths.ts';
import { renameMentions, rewriteMp3Bytes } from './song-tag-rewrites.ts';
import { type SongTagJob, songTagJobs } from './song-tag-source.ts';

const README = 'README.md';

function report(line: string): void {
  process.stdout.write(`${line}\n`);
}

function renameInReadme(
  repo: MusicRepo,
  renames: ReadonlyMap<string, string>,
): void {
  if (!treePaths(repo).has(README)) return;

  const readme = readBlob(repo, README).toString('utf8');
  const renamed = renameMentions(readme, renames);

  if (renamed !== readme) stageBlob(repo, Buffer.from(renamed), [README]);
}

function repointDocument(job: SongTagJob, mp3Bytes: number): void {
  const document = path.join(collectionDir('music'), job.fileName);

  fs.writeFileSync(
    document,
    rewriteMp3Bytes(fs.readFileSync(document, 'utf8'), mp3Bytes),
  );
}

function byRepository(
  jobs: readonly SongTagJob[],
): Map<string, { branch: string; jobs: SongTagJob[] }> {
  const groups = new Map<string, { branch: string; jobs: SongTagJob[] }>();

  for (const job of jobs) {
    const { repo, branch } = job.home;
    const group = groups.get(repo) ?? { branch, jobs: [] };

    group.jobs.push(job);
    groups.set(repo, group);
  }

  return groups;
}

/** Clones of the repositories a run reads from beside the one it writes, each made once. */
function sourceClones(): {
  read: (source: Served, own: MusicRepo) => Buffer;
  remove: () => void;
} {
  const clones = new Map<string, MusicRepo>();
  const root = path.join(MUSIC_WORK_DIR, 'sources');

  return {
    read: (source, own) => {
      if (source.repo === own.repo) return readBlob(own, source.path);

      const clone =
        clones.get(source.repo) ??
        cloneRepo(source.repo, defaultBranch(source.repo), root);

      clones.set(source.repo, clone);

      return readBlob(clone, source.path);
    },
    remove: () => {
      for (const clone of clones.values()) removeClone(clone);
    },
  };
}

function tagRepository(
  name: string,
  branch: string,
  jobs: readonly SongTagJob[],
  manifest: TagManifest,
  dryRun: boolean,
): void {
  const repo = cloneRepo(name, branch, MUSIC_WORK_DIR);
  const held = treePaths(repo);
  const sources = sourceClones();
  const mp3Bytes = new Map<string, number>();
  const read = new Map<string, string[]>();
  const renames = new Map<string, string>();

  for (const job of jobs) {
    const stream = streamFile(job);
    const recorded = manifest[job.slug]?.paths ?? [];

    for (const file of job.files) {
      const source = sourceOf(job, file, held, recorded);
      const tagged = tagFile(repo, job, file, sources.read(source, repo));

      read.set(job.slug, [
        ...(read.get(job.slug) ?? []),
        servedPath(source, source.path),
      ]);
      renames.set(path.posix.basename(source.path), file.names[0]);
      if (file.extension === 'mp3') mp3Bytes.set(job.slug, tagged.length);
      if (stream !== undefined && file.extension === 'flac') {
        stageStream(repo, job, stream, tagged);
      }
    }
  }

  sources.remove();
  renameInReadme(repo, renames);
  report(stagedSummary(repo));
  commitStaged(
    repo,
    'chore: name and tag the masters, rewrap the FLAC to stream',
    !dryRun,
  );

  // A dry run keeps the clone and its unpushed commit to look at.
  if (dryRun) return;

  removeClone(repo);

  for (const job of jobs) {
    const bytes = mp3Bytes.get(job.slug);

    if (bytes === undefined) throw new Error(`${job.fileName} has no MP3`);
    repointDocument(job, bytes);
    manifest[job.slug] = {
      hash: jobHash(job),
      paths: [
        ...new Set([
          ...(manifest[job.slug]?.paths ?? []),
          ...(read.get(job.slug) ?? []),
          ...jobPaths(job),
        ]),
      ].toSorted(),
    };
  }
  writeTagManifest(manifest);
}

/**
 * Deletes, from whichever repository holds each, the paths the manifest
 * recorded for the songs and no song derives any more.
 */
export function pruneSongs(slugs: readonly string[]): void {
  const all = songTagJobs(PUBLIC_DIR);
  const jobs = selectedJobs(slugs, all);
  const manifest = readTagManifest();
  const derived = new Set(all.flatMap((job) => jobPaths(job)));
  const gone = new Map<string, string[]>();

  for (const { slug } of jobs) {
    for (const at of manifest[slug]?.paths ?? []) {
      if (derived.has(at)) continue;

      const { repo, path: repoPath } = parseServed(at);

      gone.set(repo, [...(gone.get(repo) ?? []), repoPath]);
    }
  }

  for (const [name, paths] of gone) {
    const repo = cloneRepo(name, defaultBranch(name), MUSIC_WORK_DIR);
    const held = treePaths(repo);

    unstagePaths(
      repo,
      paths.filter((at) => held.has(at)),
    );
    report(stagedSummary(repo));
    commitStaged(repo, "chore: prune the masters' old names", true);
    removeClone(repo);
  }

  for (const { slug } of jobs) {
    const entry = manifest[slug];

    if (entry !== undefined) {
      entry.paths = entry.paths.filter((at) => derived.has(at));
    }
  }
  writeTagManifest(manifest);
}

function selectedJobs(
  slugs: readonly string[],
  all: readonly SongTagJob[] = songTagJobs(PUBLIC_DIR),
): SongTagJob[] {
  const unknown = slugs.filter((slug) => !all.some((job) => job.slug === slug));

  if (unknown.length > 0) throw new Error(`No song: ${unknown.join(', ')}`);

  return slugs.length === 0
    ? [...all]
    : all.filter((job) => slugs.includes(job.slug));
}

/** The selected songs whose files were never tagged where they are derived, or tagged from inputs that changed since. */
function staleJobs(
  slugs: readonly string[],
  manifest: TagManifest,
): SongTagJob[] {
  const jobs = selectedJobs(slugs);
  const stale = jobs.filter((job) => {
    const entry = manifest[job.slug];
    const recorded = new Set(entry?.paths);

    return (
      entry?.hash !== jobHash(job) ||
      jobPaths(job).some((at) => !recorded.has(at))
    );
  });

  report(`${jobs.length} song(s), ${stale.length} to tag.`);

  return stale;
}

/** Offline: `false`, naming each, when a song's files are stale. */
export function checkSongs(slugs: readonly string[]): boolean {
  const stale = staleJobs(slugs, readTagManifest());

  for (const job of stale) report(`  stale: ${job.slug}`);

  return stale.length === 0;
}

/**
 * Tags what drifted, publishes it, and states each MP3's size in its
 * document; a dry run builds each repository's commit in its clone and stops
 * there.
 */
export function tagSongs(slugs: readonly string[], dryRun: boolean): void {
  const manifest = readTagManifest();
  const stale = staleJobs(slugs, manifest);

  assertNoCollision(songTagJobs(PUBLIC_DIR));

  for (const [name, { branch, jobs: group }] of byRepository(stale)) {
    tagRepository(name, branch, group, manifest, dryRun);
  }
}
