/**
 * GitHub's REST API for `vovas-music`, through `gh api` and so the session's
 * own token — which reaches the organization where the agent proxy's
 * `git push` does not.
 */

import { execFileSync } from 'node:child_process';
import { z } from 'zod';

import { MUSIC_ORGANIZATION } from '@/music/shared/catalogue/index.node-safe';

export const shaReply = z.object({ sha: z.string() });

/** Tries per call while GitHub answers 5xx — a large blob's upload meets the odd 502. */
const API_ATTEMPTS = 3;

export const sleep = (ms: number): void => {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
};

/** What `gh api` printed to stderr before failing, `undefined` for any other error. */
export const apiStderr = (error: unknown): string | undefined =>
  z
    .object({ stderr: z.instanceof(Buffer) })
    .safeParse(error)
    .data?.stderr.toString('utf8');

/**
 * One call to `endpoint`, its JSON reply parsed — `undefined` for an empty
 * one, as a `DELETE` answers. A 5xx is retried: a publish's writes are
 * content-addressed or a fast-forward to a known SHA, so repeating one that
 * landed unseen changes nothing, and a repository created unseen answers the
 * retry with a 422.
 */
export function githubApi(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  endpoint: string,
  body?: unknown,
): unknown {
  for (let attempt = 1; ; attempt++) {
    try {
      const reply = execFileSync(
        'gh',
        [
          'api',
          '--method',
          method,
          endpoint,
          ...(body === undefined ? [] : ['--input', '-']),
        ],
        {
          input: body === undefined ? undefined : JSON.stringify(body),
          maxBuffer: 64 * 1024 * 1024,
          stdio: ['pipe', 'pipe', 'pipe'],
        },
      ).toString('utf8');

      return reply.trim() === '' ? undefined : JSON.parse(reply);
    } catch (error) {
      const stderr = apiStderr(error);

      if (stderr === undefined) throw error;
      process.stderr.write(stderr);
      if (attempt === API_ATTEMPTS || !/\(HTTP 5\d\d\)/.test(stderr)) {
        throw error;
      }
      sleep(5000 * attempt);
    }
  }
}

export const repoEndpoint = (repo: string, rest: string): string =>
  `repos/${MUSIC_ORGANIZATION}/${repo}/${rest}`;

/** Uploads `content` as a blob, refusing a reply that names other bytes than `sha`. */
export function uploadBlob(repo: string, content: Buffer, sha: string): void {
  const reply = shaReply.parse(
    githubApi('POST', repoEndpoint(repo, 'git/blobs'), {
      content: content.toString('base64'),
      encoding: 'base64',
    }),
  );

  if (reply.sha !== sha) {
    throw new Error(`${repo}: blob ${sha} uploaded as ${reply.sha}`);
  }
}
