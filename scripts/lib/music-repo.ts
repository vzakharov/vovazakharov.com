/**
 * A `vovas-music` repository worked on without its audio: a blobless, shallow
 * clone with no checkout holds the trees alone, a blob is fetched only when it
 * is read, and a commit is built in the index — so a song's master and copy
 * are the only audio that crosses the wire, out of an organization whose
 * history runs to tens of gigabytes.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { MUSIC_ORGANIZATION } from '@/shared/music-catalogue/index.node-safe';

import type { RepoBranch } from '@/pages/music/lib/master-url';

/**
 * The agent proxy authenticates pushes to the site's own repository only, so
 * a push here carries the session's GitHub token through `gh`; commit signing
 * is the site repository's, with no key for these.
 */
const GIT_CONFIG = [
  '-c',
  'credential.helper=',
  '-c',
  'credential.helper=!gh auth git-credential',
  '-c',
  'commit.gpgsign=false',
  '-c',
  'core.quotePath=false',
];

export type MusicRepo = RepoBranch & {
  /** The clone's directory. */
  dir: string;
};

function git(dir: string, args: readonly string[], input?: Buffer): Buffer {
  return execFileSync('git', [...GIT_CONFIG, '-C', dir, ...args], {
    input,
    maxBuffer: 1024 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'inherit'],
  });
}

const text = (dir: string, args: readonly string[]): string =>
  git(dir, args).toString('utf8').trim();

/** A fresh clone of `branch` under `root`, replacing any earlier one. */
export function cloneRepo(
  repo: string,
  branch: string,
  root: string,
): MusicRepo {
  const dir = path.join(root, repo);

  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(root, { recursive: true });
  git(root, [
    'clone',
    '--quiet',
    '--filter=blob:none',
    '--depth=1',
    '--no-checkout',
    '--branch',
    branch,
    `https://github.com/${MUSIC_ORGANIZATION}/${repo}.git`,
    dir,
  ]);
  git(dir, ['read-tree', 'HEAD']);

  return { repo, branch, dir };
}

/** Every file path the branch's head holds. */
export function treePaths({ dir }: MusicRepo): Set<string> {
  return new Set(
    git(dir, ['ls-tree', '-r', '-z', '--name-only', 'HEAD'])
      .toString('utf8')
      .split('\0')
      .filter(Boolean),
  );
}

export function readBlob({ dir }: MusicRepo, repoPath: string): Buffer {
  return git(dir, ['cat-file', 'blob', `HEAD:${repoPath}`]);
}

/** Stages `content` under every path in `repoPaths`, stored once. */
export function stageBlob(
  { dir }: MusicRepo,
  content: Buffer,
  repoPaths: readonly string[],
): void {
  // No filters: `* text=auto` in a repository's attributes must not reach audio.
  const sha = git(
    dir,
    ['hash-object', '-w', '--no-filters', '--stdin'],
    content,
  )
    .toString('utf8')
    .trim();

  for (const repoPath of repoPaths) {
    git(dir, [
      'update-index',
      '--add',
      '--cacheinfo',
      `100644,${sha},${repoPath}`,
    ]);
  }
}

export function unstagePaths(
  { dir }: MusicRepo,
  repoPaths: readonly string[],
): void {
  for (const repoPath of repoPaths) {
    git(dir, ['update-index', '--force-remove', repoPath]);
  }
}

/**
 * Commits the index onto the head and, with `push`, fast-forwards the remote
 * branch to it. `false` when the index changes nothing.
 */
export function commitStaged(
  repo: MusicRepo,
  message: string,
  push: boolean,
): boolean {
  const { dir, branch } = repo;

  if (text(dir, ['diff', '--cached', '--name-only', 'HEAD']) === '') {
    return false;
  }

  git(dir, ['commit', '--quiet', '--message', message]);
  if (push)
    git(dir, ['push', '--quiet', 'origin', `HEAD:refs/heads/${branch}`]);

  return true;
}

/** The staged changes against the head, one `<status>\t<path>` per line. */
export function stagedSummary({ dir }: MusicRepo): string {
  return text(dir, ['diff', '--cached', '--name-status', 'HEAD']);
}
