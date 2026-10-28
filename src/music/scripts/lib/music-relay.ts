/**
 * Publishing a commit whose files are too large for the Git Data API, by
 * handing it to GitHub Actions in the repository itself, whose `git push`
 * carries any file git does.
 *
 * The commit travels as a git bundle cut into parts each small enough for
 * the API, on a temporary branch beside a workflow generated for this one
 * commit. The workflow reassembles the bundle, refuses unless it unpacks to
 * exactly the expected commit, and pushes that commit to the target branch
 * without force — so a branch that moved since the clone refuses rather than
 * loses work. The temporary branch is deleted whatever the run's outcome; the
 * run's log outlives it.
 */

import { createHash } from 'node:crypto';
import { z } from 'zod';

import type {
  RepoBranch,
  WithBranch,
} from '@/music/shared/catalogue/index.node-safe';

import {
  githubApi,
  repoEndpoint,
  shaReply,
  sleep,
  uploadBlob,
} from './music-github.ts';

/**
 * The largest file the Git Data API is trusted to take. A 39.4 MB blob went
 * up and a 45.9 MB one was refused (HTTP 422), so the line sits below both.
 */
export const API_BLOB_LIMIT = 36 * 1024 * 1024;

/** A bundle part's size, well inside `API_BLOB_LIMIT`. */
const PART_BYTES = 30 * 1024 * 1024;

const WORKFLOW_PATH = '.github/workflows/masters-relay.yml';

/** How long the run may take to appear and finish, and how often it is asked after. */
const RUN_TIMEOUT_MS = 20 * 60 * 1000;
const RUN_POLL_MS = 10 * 1000;

/** What a generated workflow interpolates into its script, so nothing in it needs quoting. */
const SAFE_NAME = /^[\w.-]+(?:\/[\w.-]+)*$/;
const COMMIT_SHA = /^[\da-f]{40}$/;

/** The SHA git names `content` by as a blob. */
export function blobSha(content: Buffer): string {
  return createHash('sha1')
    .update(`blob ${content.length}\0`)
    .update(content)
    .digest('hex');
}

/** `content` cut into consecutive parts of at most `size` bytes. */
export function splitParts(content: Buffer, size: number): Buffer[] {
  const parts = [];

  for (let at = 0; at < content.length; at += size) {
    parts.push(content.subarray(at, at + size));
  }

  return parts;
}

/** `branch` is the one the commit is pushed to. */
export type RelaySpec = WithBranch & {
  /** The temporary branch holding the parts and this workflow. */
  relayBranch: string;
  /** The commit the bundle must unpack to. */
  commit: string;
  /** The parts' paths on the relay branch, in bundle order. */
  parts: readonly string[];
};

/**
 * The relay job's shell script: reassembles the bundle on `relayBranch` and
 * pushes its commit to `branch`. Reads `TOKEN` and `GITHUB_REPOSITORY` from
 * the environment.
 */
export function relayScript({
  branch,
  relayBranch,
  commit,
  parts,
}: RelaySpec): string {
  for (const name of [branch, relayBranch, ...parts]) {
    if (!SAFE_NAME.test(name))
      throw new Error(`Unsafe name in a relay: ${name}`);
  }
  if (!COMMIT_SHA.test(commit)) throw new Error(`Not a commit SHA: ${commit}`);

  return `set -euo pipefail
git init -q .
git remote add origin "https://x-access-token:$TOKEN@github.com/$GITHUB_REPOSITORY.git"
git fetch -q --depth=1 origin refs/heads/${relayBranch}:refs/relay/parts refs/heads/${branch}:refs/relay/base
for part in ${parts.join(' ')}; do git cat-file blob "refs/relay/parts:$part"; done > relay.bundle
git bundle verify -q relay.bundle
git fetch -q relay.bundle HEAD
test "$(git rev-parse FETCH_HEAD)" = ${commit}
git push origin ${commit}:refs/heads/${branch}
`;
}

/** The workflow running `relayScript` on a push to `relayBranch`. */
export function relayWorkflow(spec: RelaySpec): string {
  const { branch, relayBranch, commit } = spec;
  const script = relayScript(spec)
    .trimEnd()
    .split('\n')
    .map((line) => `          ${line}`)
    .join('\n');

  return `name: Relay a masters commit
on:
  push:
    branches: ['${relayBranch}']
permissions:
  contents: write
jobs:
  relay:
    runs-on: ubuntu-latest
    timeout-minutes: 15
    steps:
      - name: Push ${commit.slice(0, 12)} to ${branch}
        env:
          TOKEN: \${{ github.token }}
        run: |
${script}
`;
}

const runsReply = z.object({
  workflow_runs: z.array(
    z.object({
      head_sha: z.string(),
      status: z.string(),
      conclusion: z.string().nullable(),
      html_url: z.string(),
    }),
  ),
});

type Run = z.infer<typeof runsReply>['workflow_runs'][number];

/** The relay run on `relaySha`, once it has completed. */
function awaitRun(repo: string, relayBranch: string, relaySha: string): Run {
  const deadline = Date.now() + RUN_TIMEOUT_MS;

  for (;;) {
    const run = runsReply
      .parse(
        githubApi(
          'GET',
          repoEndpoint(
            repo,
            `actions/runs?branch=${relayBranch}&event=push&per_page=10`,
          ),
        ),
      )
      .workflow_runs.find(({ head_sha }) => head_sha === relaySha);

    if (run?.status === 'completed') return run;
    if (Date.now() > deadline) {
      throw new Error(
        `${repo}: the relay run on ${relayBranch} ${run === undefined ? 'never started' : `is still ${run.status} at ${run.html_url}`}`,
      );
    }
    sleep(RUN_POLL_MS);
  }
}

/** Pushes `commit`, carried by `bundle`, to `branch` through a relay run. */
export function relayCommit(
  { repo, branch }: RepoBranch,
  bundle: Buffer,
  commit: string,
): void {
  const relayBranch = `masters-relay-${commit.slice(0, 12)}`;
  const parts = splitParts(bundle, PART_BYTES).map((content, at) => ({
    path: `relay/${String(at).padStart(3, '0')}.part`,
    content,
  }));
  const workflow = Buffer.from(
    relayWorkflow({
      branch,
      relayBranch,
      commit,
      parts: parts.map(({ path }) => path),
    }),
  );
  const files = [...parts, { path: WORKFLOW_PATH, content: workflow }].map(
    (file) => ({ ...file, sha: blobSha(file.content) }),
  );

  for (const { content, sha } of files) uploadBlob(repo, content, sha);

  const tree = shaReply.parse(
    githubApi('POST', repoEndpoint(repo, 'git/trees'), {
      tree: files.map(({ path, sha }) => ({
        path,
        mode: '100644',
        type: 'blob',
        sha,
      })),
    }),
  ).sha;
  const relayCommitSha = shaReply.parse(
    githubApi('POST', repoEndpoint(repo, 'git/commits'), {
      message: `chore: relay ${commit.slice(0, 12)} to ${branch}`,
      tree,
      parents: [],
    }),
  ).sha;

  githubApi('POST', repoEndpoint(repo, 'git/refs'), {
    ref: `refs/heads/${relayBranch}`,
    sha: relayCommitSha,
  });

  try {
    const run = awaitRun(repo, relayBranch, relayCommitSha);

    if (run.conclusion !== 'success') {
      throw new Error(
        `${repo}: the relay run ended ${run.conclusion}: ${run.html_url}`,
      );
    }
  } finally {
    githubApi('DELETE', repoEndpoint(repo, `git/refs/heads/${relayBranch}`));
  }

  const landed = z
    .object({ object: shaReply })
    .parse(githubApi('GET', repoEndpoint(repo, `git/ref/heads/${branch}`)))
    .object.sha;

  if (landed !== commit) {
    throw new Error(
      `${repo}: ${branch} is at ${landed} after relaying ${commit}`,
    );
  }
}
