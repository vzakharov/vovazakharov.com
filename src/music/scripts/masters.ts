/**
 * Every operation on the song masters' repositories (`vovas-music`), behind
 * one command, so a permission for the work names this script rather than
 * each `gh` call it makes.
 *
 * Usage, from the repository root:
 *   pnpm music:masters tag [--dry-run] [<slug> ...]   name and tag what drifted, publish, repoint the documents
 *   pnpm music:masters check [<slug> ...]             offline: fail naming the songs whose files are stale
 *   pnpm music:masters prune [<slug> ...]             delete the paths no song derives any more
 *   pnpm music:masters get <repo> <path> <file>       save one file of a repository's default branch
 *   pnpm music:masters put <repo> --message <m> <file>=<path> ...
 *                                               commit local files to a repository's default branch
 *   pnpm music:masters create <repo> --description <d>
 *                                               a new public repository, holding a README
 *   pnpm music:masters rename <repo> <new-name>  rename a repository, refusing a name already taken
 *   pnpm music:masters serve-main <repo> ...     rename a default branch to `main`, the one the site serves
 *
 * `<repo>` is a repository's name inside the organization, and a `<file>` is
 * relative to this repository's root, whatever directory runs it. A write lands as
 * one commit, fast-forwarding the branch; a branch that moved since the run
 * read it refuses instead.
 */

import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

import {
  cloneRepo,
  commitStaged,
  createRepository,
  defaultBranch,
  MUSIC_WORK_DIR,
  readBlob,
  removeClone,
  renameRepository,
  serveFromSongBranch,
  stageBlob,
  stagedSummary,
} from './lib/music-repo.ts';
import { checkSongs, pruneSongs, tagSongs } from './lib/song-tagging.ts';

import { flag, given } from '@/kernel/scripts/lib/argv';
import { REPO_ROOT } from '@/kernel/scripts/lib/site-tree';

const COMMANDS = [
  'tag',
  'check',
  'prune',
  'get',
  'put',
  'create',
  'rename',
  'serve-main',
] as const;

type Command = (typeof COMMANDS)[number];

/** The arguments after the command, the values of `--message` and `--description` dropped with their flags. */
function operands(): string[] {
  const rest = process.argv.slice(3);

  return rest.filter(
    (arg, at) =>
      !arg.startsWith('--') &&
      !['--message', '--description'].includes(rest[at - 1] ?? ''),
  );
}

function required(name: string): string {
  const value = flag(name);

  if (value === undefined) throw new Error(`--${name} is required`);

  return value;
}

function cloneDefault(repo: string): ReturnType<typeof cloneRepo> {
  return cloneRepo(repo, defaultBranch(repo), MUSIC_WORK_DIR);
}

function get([repo, repoPath, file]: string[]): void {
  if (repo === undefined || repoPath === undefined || file === undefined) {
    throw new Error('get <repo> <path> <file>');
  }

  const clone = cloneDefault(repo);

  fs.writeFileSync(path.resolve(REPO_ROOT, file), readBlob(clone, repoPath));
  removeClone(clone);
}

function put([repo, ...pairs]: string[]): void {
  const message = required('message');

  if (repo === undefined || pairs.length === 0) {
    throw new Error('put <repo> --message <m> <file>=<path> ...');
  }

  const clone = cloneDefault(repo);

  for (const pair of pairs) {
    const at = pair.indexOf('=');

    if (at <= 0) throw new Error(`${pair} is not <file>=<path>`);
    stageBlob(
      clone,
      fs.readFileSync(path.resolve(REPO_ROOT, pair.slice(0, at))),
      [pair.slice(at + 1)],
    );
  }

  process.stdout.write(`${stagedSummary(clone)}\n`);
  if (!commitStaged(clone, message, true)) {
    process.stdout.write(`${repo}: nothing changed\n`);
  }
  removeClone(clone);
}

const RUN: Record<Command, (args: string[]) => void> = {
  tag: (slugs) => {
    tagSongs(slugs, given('dry-run'));
  },
  check: (slugs) => {
    process.exitCode = checkSongs(slugs) ? 0 : 1;
  },
  prune: pruneSongs,
  get,
  put,
  create: ([repo]) => {
    if (repo === undefined) throw new Error('create <repo> --description <d>');
    createRepository(repo, required('description'));
  },
  rename: ([repo, to]) => {
    if (repo === undefined || to === undefined) {
      throw new Error('rename <repo> <new-name>');
    }
    renameRepository(repo, to);
  },
  'serve-main': (repos) => {
    if (repos.length === 0) throw new Error('serve-main <repo> ...');
    for (const repo of repos) serveFromSongBranch(repo);
  },
};

const command = z.enum(COMMANDS).safeParse(process.argv[2]);

if (!command.success) {
  throw new Error(`music:masters: expected one of ${COMMANDS.join(', ')}`);
}

RUN[command.data](operands());
