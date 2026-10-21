/**
 * What `pnpm music:scaffold` reads off a song's `vovas-music` repository
 * through GitHub: its default branch, its master, the MP3 copy's size and the
 * first commit's date. Needs network and, for the API's rate limit,
 * `GH_TOKEN`.
 */

import { z } from 'zod';

import type { Rated, WithUrl } from '@/kernel/shared/typings';

import { MUSIC_ORGANIZATION } from '@/music/shared/catalogue/index.node-safe';

/** How the explicit-content marker appears in a master's filename. */
export const EXPLICIT_MARKER = '🅴';

/** The single root FLAC that makes a repository a song. */
/** `url` is where `raw.githubusercontent.com` serves it, percent-encoded. */
export type Master = Rated &
  WithUrl & {
    /** Its name in the repository, which is where the song's own name comes from. */
    flac: string;
    /** Its MP3 copy's name and URL, where the repository holds one yet. */
    copy?: { name: string; url: string };
  };

/** The MP3 copy's name beside a FLAC master: `<stem>.master.mp3`. */
export function copyName(flac: string): string {
  return flac.replace(/\.flac$/i, '.master.mp3');
}

/** The API's shapes are parsed rather than trusted, this being someone else's JSON. */
const repositorySchema = z.object({ default_branch: z.string().min(1) });

const rootListingSchema = z.array(z.object({ name: z.string() }));

const commitsSchema = z.array(
  z.object({ commit: z.object({ author: z.object({ date: z.string() }) }) }),
);

const repositoryUrl = (repo: string) =>
  `https://api.github.com/repos/${MUSIC_ORGANIZATION}/${repo}`;

async function api(url: string): Promise<Response> {
  const token = process.env['GH_TOKEN'] ?? process.env['GITHUB_TOKEN'];

  return fetch(url, {
    headers: {
      accept: 'application/vnd.github+json',
      'user-agent': 'vovazakharov.com-scaffold-song',
      ...(token === undefined ? {} : { authorization: `Bearer ${token}` }),
    },
  });
}

async function json<T>(url: string, schema: z.ZodType<T>): Promise<T> {
  const response = await api(url);

  if (!response.ok) {
    throw new Error(`GET ${url} answered ${response.status}`);
  }

  return schema.parse(await response.json());
}

export async function defaultBranch(repo: string): Promise<string> {
  const { default_branch: branch } = await json(
    repositoryUrl(repo),
    repositorySchema,
  );

  return branch;
}

/**
 * A song is a master, and a master is a root `.flac`: the only one, or the one
 * named — a repository holding several is ambiguous until someone picks.
 */
export async function findMaster(
  repo: string,
  branch: string,
  named?: string,
): Promise<Master> {
  const entries = await json(
    `${repositoryUrl(repo)}/contents/`,
    rootListingSchema,
  );

  const masters = entries
    .map(({ name }) => name)
    .filter((name) => name.toLowerCase().endsWith('.flac'));

  const [fileName] =
    named === undefined ? masters : masters.filter((name) => name === named);

  if (fileName === undefined) {
    throw new Error(
      named === undefined
        ? `${repo} has no root FLAC`
        : `${repo} has no root ${named} (it has ${masters.join(', ')})`,
    );
  }
  if (named === undefined && masters.length > 1) {
    throw new Error(
      `${repo} has ${masters.length} root FLACs (${masters.join(', ')}) — name one in a spec`,
    );
  }

  const raw = (name: string) =>
    `https://raw.githubusercontent.com/${MUSIC_ORGANIZATION}/${repo}/${branch}/${encodeURIComponent(name)}`;
  const copy = copyName(fileName);

  return {
    flac: fileName,
    url: raw(fileName),
    explicit: fileName.includes(EXPLICIT_MARKER),
    ...(entries.some(({ name }) => name === copy)
      ? { copy: { name: copy, url: raw(copy) } }
      : {}),
  };
}

/** The file's size as its host reports it, which the feed's enclosure states. */
export async function fetchBytes(url: string): Promise<number> {
  const response = await fetch(url, { method: 'HEAD' });
  const bytes = Number(response.headers.get('content-length'));

  if (!response.ok || !Number.isInteger(bytes) || bytes <= 0) {
    throw new Error(
      `${url} answered ${response.status} with no usable content-length`,
    );
  }

  return bytes;
}

/**
 * The first commit's date, which is when the Reaper project was first put under
 * git — close to when the song was made, and a value to sanity-check rather
 * than a blank. The repository's own creation date would not do: the
 * organization was bulk-pushed long after, carrying each project's local
 * history with it.
 */
export async function firstCommitDate(repo: string): Promise<string> {
  const commits = `${repositoryUrl(repo)}/commits`;
  const probe = await api(`${commits}?per_page=1`);
  const last = /<[^>]*[&?]page=(\d+)>; rel="last"/.exec(
    probe.headers.get('link') ?? '',
  );
  const [oldest] = await json(
    `${commits}?per_page=1&page=${last?.[1] ?? '1'}`,
    commitsSchema,
  );

  if (oldest === undefined) {
    throw new Error(`${repo} has no commits to date it by`);
  }

  return oldest.commit.author.date.slice(0, 10);
}
