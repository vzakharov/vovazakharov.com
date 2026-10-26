/**
 * A `vovas-music` repository worked on without its audio: a blobless, shallow
 * clone with no checkout holds the trees alone, a blob is fetched only when it
 * is read, and a commit is built in the index — so a song's master and copy
 * are the only audio that crosses the wire, out of an organization whose
 * history runs to tens of gigabytes.
 *
 * A commit is published through GitHub's Git Data API rather than `git push`:
 * the agent proxy lets a session push to the repositories it was started on
 * and no others, while `gh api` carries the session's own token anywhere it
 * reaches. A commit holding a file too large for that API goes through a
 * relay run in the repository instead (`music-relay.ts`).
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

import {
  MUSIC_ORGANIZATION,
  type RepoBranch,
  SONG_BRANCH,
} from '@/music/shared/catalogue/index.node-safe';

import {
  apiStderr,
  githubApi,
  repoEndpoint,
  shaReply,
  uploadBlob,
} from './music-github.ts';
import { API_BLOB_LIMIT, relayCommit } from './music-relay.ts';

import { REPO_ROOT } from '@/kernel/scripts/lib/site-tree';

/** Where the clones live, each replaced by the next run on its repository. */
export const MUSIC_WORK_DIR = path.join(REPO_ROOT, 'tmp', 'music-tag');

/** The clone reads through `gh`'s token; signing is the site repository's, with no key for these. */
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

export function defaultBranch(repo: string): string {
  return z
    .object({ default_branch: z.string() })
    .parse(githubApi('GET', `repos/${MUSIC_ORGANIZATION}/${repo}`))
    .default_branch;
}

/** A new public repository holding a README, which gives it the branch a commit needs. */
export function createRepository(repo: string, description: string): void {
  githubApi('POST', `orgs/${MUSIC_ORGANIZATION}/repos`, {
    name: repo,
    description,
    visibility: 'public',
    auto_init: true,
  });
}

/**
 * Renames a repository, refusing a target that already exists: GitHub
 * redirects the old name to the new one, and a repository later created under
 * the old name would take that redirect over.
 */
export function renameRepository(repo: string, to: string): void {
  // A name that answers at all is taken — by a repository or by another one's redirect.
  if (repositoryAnswers(to)) {
    throw new Error(`${MUSIC_ORGANIZATION}/${to} already exists`);
  }
  githubApi('PATCH', `repos/${MUSIC_ORGANIZATION}/${repo}`, { name: to });
}

/**
 * Renames a repository's default branch to the one the site serves from,
 * since every URL the site derives names `main` — a repository pushed on
 * `master`, as the `gb-*` ones were, serves nothing until then.
 */
export function serveFromSongBranch(repo: string): void {
  const from = defaultBranch(repo);

  if (from === SONG_BRANCH) return;
  githubApi(
    'POST',
    `repos/${MUSIC_ORGANIZATION}/${repo}/branches/${from}/rename`,
    { new_name: SONG_BRANCH },
  );
}

function repositoryAnswers(repo: string): boolean {
  try {
    githubApi('GET', `repos/${MUSIC_ORGANIZATION}/${repo}`);

    return true;
  } catch (error) {
    if (apiStderr(error)?.includes('(HTTP 404)') === true) return false;
    throw error;
  }
}

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

export function removeClone({ dir }: MusicRepo): void {
  fs.rmSync(dir, { recursive: true, force: true });
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
 * Commits the index onto the head and, with `push`, publishes that commit and
 * fast-forwards the remote branch to it. `false` when the index changes
 * nothing.
 */
export function commitStaged(
  repo: MusicRepo,
  message: string,
  push: boolean,
): boolean {
  const { dir } = repo;

  if (text(dir, ['diff', '--cached', '--name-only', 'HEAD']) === '') {
    return false;
  }

  git(dir, ['commit', '--quiet', '--message', message]);
  if (push) publishHead(repo, message);

  return true;
}

/** `:<old mode> <new mode> <old sha> <new sha> <status>`, a `diff-tree` raw record's head. */
const RAW_RECORD = /^:\d{6} (\d{6}) [\da-f]{40} ([\da-f]{40}) ([ADMT])$/;

/** The head commit's changes against its parent, as Git Data API tree entries. */
function headChanges(dir: string) {
  const fields = git(dir, [
    'diff-tree',
    '-r',
    '-z',
    '--no-renames',
    'HEAD^',
    'HEAD',
  ])
    .toString('utf8')
    .split('\0')
    .filter(Boolean);
  const entries = [];

  for (let at = 0; at < fields.length; at += 2) {
    const [, mode, sha, status] = RAW_RECORD.exec(fields[at] ?? '') ?? [];
    const repoPath = fields[at + 1];

    if (mode === undefined || sha === undefined || repoPath === undefined) {
      throw new Error(`${dir}: unexpected diff-tree output ${fields[at]}`);
    }

    const deleted = status === 'D';

    entries.push({
      path: repoPath,
      mode: deleted ? '100644' : mode,
      type: 'blob' as const,
      sha: deleted ? null : sha,
    });
  }

  return entries;
}

/**
 * Re-creates the clone's head commit on GitHub and fast-forwards the branch to
 * it: each new blob uploaded once, a tree on the parent's that must hash to
 * the clone's own, a commit with the parent, then the ref — never forced, so a
 * branch that moved since the clone refuses rather than loses work. A commit
 * with a blob past `API_BLOB_LIMIT` is relayed whole instead, as the same
 * commit.
 */
function publishHead({ repo, branch, dir }: MusicRepo, message: string): void {
  const changes = headChanges(dir);
  const blobs = [
    ...new Set(changes.flatMap(({ sha }) => (sha === null ? [] : [sha]))),
  ];

  if (
    blobs.some(
      (sha) => Number(text(dir, ['cat-file', '-s', sha])) > API_BLOB_LIMIT,
    )
  ) {
    relayCommit(
      { repo, branch },
      git(dir, ['bundle', 'create', '-', 'HEAD^..HEAD']),
      text(dir, ['rev-parse', 'HEAD']),
    );

    return;
  }

  for (const sha of blobs) {
    uploadBlob(repo, git(dir, ['cat-file', 'blob', sha]), sha);
  }

  const tree = shaReply.parse(
    githubApi('POST', repoEndpoint(repo, 'git/trees'), {
      base_tree: text(dir, ['rev-parse', 'HEAD^^{tree}']),
      tree: changes,
    }),
  ).sha;
  const localTree = text(dir, ['rev-parse', 'HEAD^{tree}']);

  if (tree !== localTree) {
    throw new Error(`${repo}: published tree ${tree} is not ${localTree}`);
  }

  const commit = shaReply.parse(
    githubApi('POST', repoEndpoint(repo, 'git/commits'), {
      message,
      tree,
      parents: [text(dir, ['rev-parse', 'HEAD^'])],
    }),
  ).sha;

  githubApi('PATCH', repoEndpoint(repo, `git/refs/heads/${branch}`), {
    sha: commit,
    force: false,
  });
}

/** The staged changes against the head, one `<status>\t<path>` per line under a `<repo>:` header. */
export function stagedSummary({ repo, dir }: MusicRepo): string {
  return `${repo}:\n${text(dir, ['diff', '--cached', '--name-status', 'HEAD'])}`;
}
