/**
 * Where a `vovas-music` repository serves a song's file, read off and written
 * back into its raw URL — the one shape the page's download links and
 * `pnpm music:masters tag` both derive their names in.
 */

import { MUSIC_ORGANIZATION } from './organization.ts';

const RAW_HOST = 'raw.githubusercontent.com';

export type WithBranch = { branch: string };

/** A repository's name inside the `vovas-music` organization. */
export type WithRepo = { repo: string };

/** A branch of a `vovas-music` repository. */
export type RepoBranch = WithBranch & WithRepo;

/** Where a file lives in its repository, read off its raw URL. */
export type RepoLocation = RepoBranch & {
  /** The file's directory in the repository, `''` at its root. */
  directory: string;
};

/** `null` for a file no `vovas-music` repository serves. */
export function masterLocation(
  url: string,
): (RepoLocation & { path: string }) | null {
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

/** `<repo>/<path>`, the key `tag-renders.json` records a file under. */
export function servedPath({ repo }: WithRepo, filePath: string): string {
  return `${repo}/${filePath}`;
}
