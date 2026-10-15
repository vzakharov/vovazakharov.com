import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, describe, it } from 'node:test';

import {
  blobSha,
  relayScript,
  type RelaySpec,
  relayWorkflow,
  splitParts,
} from './music-relay.ts';

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'music-relay-'));

after(() => {
  fs.rmSync(root, { recursive: true, force: true });
});

const GIT_ENV = {
  ...process.env,
  GIT_AUTHOR_NAME: 'test',
  GIT_AUTHOR_EMAIL: 'test@example.com',
  GIT_COMMITTER_NAME: 'test',
  GIT_COMMITTER_EMAIL: 'test@example.com',
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_CONFIG_GLOBAL: '/dev/null',
};

function git(dir: string, args: readonly string[], input?: Buffer): string {
  return execFileSync('git', ['-C', dir, ...args], {
    env: GIT_ENV,
    input,
    stdio: ['pipe', 'pipe', 'pipe'],
  })
    .toString('utf8')
    .trim();
}

/** A bare "GitHub" repository whose `main` holds one file, and a clone of it. */
function remoteWithClone(name: string): { bare: string; clone: string } {
  const bare = path.join(root, `${name}.git`);
  const clone = path.join(root, name);

  git(root, ['init', '-q', '--bare', '--initial-branch=main', bare]);
  git(root, ['clone', '-q', bare, clone]);
  fs.writeFileSync(path.join(clone, 'README.md'), '# song\n');
  git(clone, ['add', '.']);
  git(clone, ['commit', '-q', '-m', 'init']);
  git(clone, ['push', '-q', 'origin', 'HEAD:main']);

  return { bare, clone };
}

/** Pushes `parts` to `relayBranch` on `bare` as one parentless commit. */
function pushRelayBranch(
  bare: string,
  relayBranch: string,
  parts: readonly Buffer[],
): string[] {
  const dir = fs.mkdtempSync(path.join(root, 'relay-src-'));

  git(root, ['init', '-q', dir]);

  const paths = parts.map((part, at) => {
    const partPath = `relay/${String(at).padStart(3, '0')}.part`;

    fs.mkdirSync(path.join(dir, 'relay'), { recursive: true });
    fs.writeFileSync(path.join(dir, partPath), part);

    return partPath;
  });

  git(dir, ['add', '.']);
  git(dir, ['commit', '-q', '-m', 'relay']);
  git(dir, ['push', '-q', bare, `HEAD:refs/heads/${relayBranch}`]);

  return paths;
}

/** Runs the relay script in an empty directory, `origin` mapped onto `bare`. */
function runRelay(bare: string, spec: RelaySpec): void {
  const dir = fs.mkdtempSync(path.join(root, 'runner-'));
  const repository = 'vovas-music/song';

  execFileSync('bash', ['-c', relayScript(spec)], {
    cwd: dir,
    env: {
      ...GIT_ENV,
      TOKEN: 'token',
      GITHUB_REPOSITORY: repository,
      GIT_CONFIG_COUNT: '1',
      GIT_CONFIG_KEY_0: `url.file://${bare}.insteadOf`,
      GIT_CONFIG_VALUE_0: `https://x-access-token:token@github.com/${repository}.git`,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

/** A commit on top of `main` adding an incompressible file, and its bundle. */
function commitToRelay(clone: string): { commit: string; bundle: Buffer } {
  fs.writeFileSync(path.join(clone, 'Artist - Song.flac'), randomBytes(5000));
  git(clone, ['add', '.']);
  git(clone, ['commit', '-q', '-m', 'chore: name and tag the masters']);

  return {
    commit: git(clone, ['rev-parse', 'HEAD']),
    bundle: execFileSync(
      'git',
      ['-C', clone, 'bundle', 'create', '-', 'HEAD^..HEAD'],
      {
        env: GIT_ENV,
        stdio: ['ignore', 'pipe', 'pipe'],
      },
    ),
  };
}

describe('blobSha', () => {
  it('names content as git hash-object does', () => {
    const content = Buffer.from('a master\n');

    assert.equal(
      blobSha(content),
      git(root, ['hash-object', '--stdin'], content),
    );
  });
});

describe('splitParts', () => {
  it('cuts consecutive parts that join back to the whole', () => {
    const content = Buffer.from('abcdefghij');
    const parts = splitParts(content, 4);

    assert.deepEqual(
      parts.map((part) => part.toString()),
      ['abcd', 'efgh', 'ij'],
    );
  });
});

describe('relayWorkflow', () => {
  const spec: RelaySpec = {
    branch: 'main',
    relayBranch: 'masters-relay-0123456789ab',
    commit: '0123456789abcdef0123456789abcdef01234567',
    parts: ['relay/000.part'],
  };

  it('runs on a push to the relay branch alone, with write access', () => {
    const workflow = relayWorkflow(spec);

    assert.match(workflow, /branches: \['masters-relay-0123456789ab']/);
    assert.match(workflow, /contents: write/);
    assert.match(workflow, /TOKEN: \${{ github\.token }}/);
  });

  it('refuses a name the script would have to quote', () => {
    assert.throws(
      () => relayWorkflow({ ...spec, branch: 'main; rm -rf /' }),
      /Unsafe name/,
    );
    assert.throws(
      () => relayWorkflow({ ...spec, commit: 'HEAD' }),
      /Not a commit SHA/,
    );
  });
});

describe('relayScript', () => {
  it('reassembles the bundle and fast-forwards the branch to its commit', () => {
    const { bare, clone } = remoteWithClone('lands');
    const { commit, bundle } = commitToRelay(clone);
    const relayBranch = `masters-relay-${commit.slice(0, 12)}`;
    const parts = pushRelayBranch(bare, relayBranch, splitParts(bundle, 1024));

    assert.ok(parts.length > 1);
    runRelay(bare, { branch: 'main', relayBranch, commit, parts });
    assert.equal(git(bare, ['rev-parse', 'main']), commit);
  });

  it('pushes nothing when the bundle unpacks to another commit', () => {
    const { bare, clone } = remoteWithClone('refuses');
    const before = git(bare, ['rev-parse', 'main']);
    const { commit, bundle } = commitToRelay(clone);
    const relayBranch = `masters-relay-${commit.slice(0, 12)}`;
    const parts = pushRelayBranch(bare, relayBranch, splitParts(bundle, 1024));

    assert.throws(() => {
      runRelay(bare, {
        branch: 'main',
        relayBranch,
        commit: before,
        parts,
      });
    });
    assert.equal(git(bare, ['rev-parse', 'main']), before);
  });
});
