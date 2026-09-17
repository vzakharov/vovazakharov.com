/**
 * Turn a `vovas-music` repository into a song document.
 *
 * Usage, from the repository root:
 *   pnpm music:scaffold <repo> [<repo> ...]
 *
 * A song's mechanical fields all live outside this repo — in the master's
 * filename, in its FLAC header and in the source repository's own history — so
 * they are read rather than typed. What is left for the author is the prose:
 * `description`, `language`, `project` and the body.
 *
 * The duration comes out of the master's STREAMINFO block, fetched as the
 * first 128 KB of the file rather than the whole of it: a ten-song scaffold
 * moves about 1 MB where the masters themselves are a quarter of a gigabyte.
 * That the host answers a range request at all is what lets the player seek.
 *
 * It never overwrites a document that exists, so a re-run after the author has
 * edited one is safe and reports what it skipped.
 *
 * Runs under `tsx` from the app directory, like the other content scripts, so
 * `collectionDir` resolves against that app's `public/`. Needs network and, for
 * the API's rate limit, `GH_TOKEN`.
 */

import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

import { MUSIC_ORGANIZATION } from '@/shared/config/music-projects';
import { collectionDir } from '@/shared/content/collections';
import type { Named } from '@/shared/typings';

/** Enough of the file to hold `fLaC` plus the STREAMINFO block, with room for a large one. */
const HEADER_BYTES = 128 * 1024;

/** How the explicit-content marker appears in a master's filename. */
const EXPLICIT_MARKER = '🅴';

/** The single root FLAC that makes a repository a song. */
type Master = {
  /** Its name in the repository, which is where the song's own name comes from. */
  flac: string;
  /** Where `raw.githubusercontent.com` serves it, percent-encoded. */
  audio: string;
  explicit: boolean;
};

/** Sample rate, channel count and total samples, as STREAMINFO packs them. */
type StreamInfo = {
  sampleRate: number;
  channels: number;
  bitsPerSample: number;
  totalSamples: number;
};

/** The API's shapes are parsed rather than trusted, this being someone else's JSON. */
const repositorySchema = z.object({ default_branch: z.string().min(1) });

const rootListingSchema = z.array(z.object({ name: z.string() }));

const commitsSchema = z.array(
  z.object({ commit: z.object({ author: z.object({ date: z.string() }) }) }),
);

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

/**
 * A YAML double-quoted scalar, which JSON's string form already is. Every
 * authored value goes through it: a title or a blurb holding `: ` parses as a
 * mapping unquoted, and the document is then rejected at build time rather than
 * where it was written.
 */
function yaml(value: string): string {
  return JSON.stringify(value);
}

/** Everything this script prints is its result, so it goes to stdout directly. */
function report(line: string): void {
  process.stdout.write(`${line}\n`);
}

/**
 * The 36-bit sample count and the fields packed beside it. Offsets are
 * STREAMINFO's own: the last eight bytes carry a 20-bit sample rate, a 3-bit
 * channel count, a 5-bit sample depth and the sample total, none of them
 * byte-aligned.
 */
function parseStreamInfo(block: Buffer): StreamInfo {
  const at = (offset: number) => block.readUInt8(offset);

  return {
    sampleRate: (at(10) << 12) | (at(11) << 4) | (at(12) >> 4),
    channels: ((at(12) >> 1) & 0b111) + 1,
    bitsPerSample: (((at(12) & 1) << 4) | (at(13) >> 4)) + 1,
    // Beyond 32 bits, so the top nibble is added rather than shifted in.
    totalSamples:
      (at(13) & 0b1111) * 2 ** 32 +
      ((at(14) << 24) >>> 0) +
      (at(15) << 16) +
      (at(16) << 8) +
      at(17),
  };
}

/** Walks the metadata blocks to STREAMINFO, which the format puts first. */
function readStreamInfo(header: Buffer, url: string): StreamInfo {
  if (header.subarray(0, 4).toString('latin1') !== 'fLaC') {
    throw new Error(`${url} does not begin with a FLAC signature`);
  }

  const length = header.readUIntBE(5, 3);

  if ((header.readUInt8(4) & 0x7f) !== 0 || length < 34) {
    throw new Error(`${url} does not lead with a STREAMINFO block`);
  }

  return parseStreamInfo(header.subarray(8, 8 + length));
}

async function fetchStreamInfo(url: string): Promise<StreamInfo> {
  const response = await fetch(url, {
    headers: { range: `bytes=0-${HEADER_BYTES - 1}` },
  });

  if (response.status !== 206) {
    throw new Error(
      `${url} answered ${response.status} to a range request; the player needs one to seek`,
    );
  }

  return readStreamInfo(
    Buffer.from(await response.arrayBuffer()),
    new URL(url).pathname,
  );
}

/** A song is a master, and a master is the single root `.flac`. */
async function findMaster(repo: string, branch: string): Promise<Master> {
  const entries = await json(
    `https://api.github.com/repos/${MUSIC_ORGANIZATION}/${repo}/contents/`,
    rootListingSchema,
  );

  const masters = entries
    .map(({ name }) => name)
    .filter((name) => name.toLowerCase().endsWith('.flac'));

  const [fileName] = masters;

  if (fileName === undefined) throw new Error(`${repo} has no root FLAC`);
  if (masters.length > 1) {
    throw new Error(
      `${repo} has ${masters.length} root FLACs (${masters.join(', ')}) — pick one by hand`,
    );
  }

  return {
    flac: fileName,
    audio: `https://raw.githubusercontent.com/${MUSIC_ORGANIZATION}/${repo}/${branch}/${encodeURIComponent(fileName)}`,
    explicit: fileName.includes(EXPLICIT_MARKER),
  };
}

/**
 * The first commit's date, which is when the Reaper project was first put under
 * git — close to when the song was made, and a value to sanity-check rather
 * than a blank. The repository's own creation date would not do: the
 * organization was bulk-pushed long after, carrying each project's local
 * history with it.
 */
async function firstCommitDate(repo: string): Promise<string> {
  const commits = `https://api.github.com/repos/${MUSIC_ORGANIZATION}/${repo}/commits`;
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

type DocumentFields = Named & {
  date: string;
  repo: string;
  seconds: number;
  master: Master;
  streamInfo: StreamInfo;
};

/**
 * The frontmatter this script can fill, plus a body that says what is left. The
 * author's fields are written as YAML comments rather than empty values: an
 * empty one parses as null and the schema rejects it, which is the loud
 * failure a placeholder string would not be.
 */
function document(fields: DocumentFields): string {
  const { name, date, repo, seconds, master, streamInfo } = fields;
  const { sampleRate, bitsPerSample, channels } = streamInfo;

  return `---
name: ${yaml(name)}
description: ${yaml('TODO')}
date: ${date}
status: done
language: ru
# project: one of GENERATED, Полуживые, Downtemple
repo: ${yaml(repo)}
audio: ${master.audio}
seconds: ${seconds}
---

<!-- Scaffolded from https://github.com/${MUSIC_ORGANIZATION}/${repo} — ${master.flac},
     ${sampleRate / 1000} kHz / ${bitsPerSample}-bit / ${channels === 2 ? 'stereo' : `${channels} ch`}.${
       master.explicit ? '\n     The master is marked explicit.' : ''
     }
     Replace this with what the song is and how it came about, and add the
     lyrics under a "## Текст" heading. -->
`;
}

async function scaffold(repo: string, directory: string): Promise<string> {
  const filePath = path.join(directory, `${repo}.md`);

  if (fs.existsSync(filePath)) return `${repo}: already written, left alone`;

  const { default_branch: branch } = await json(
    `https://api.github.com/repos/${MUSIC_ORGANIZATION}/${repo}`,
    repositorySchema,
  );
  const master = await findMaster(repo, branch);
  const streamInfo = await fetchStreamInfo(master.audio);
  const seconds = Math.round(streamInfo.totalSamples / streamInfo.sampleRate);

  fs.writeFileSync(
    filePath,
    document({
      name: master.flac
        .replace(/\.flac$/i, '')
        .replace(EXPLICIT_MARKER, '')
        .trim(),
      date: await firstCommitDate(repo),
      repo,
      seconds,
      master,
      streamInfo,
    }),
  );

  const minutes = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

  return `${repo}: ${master.flac} — ${minutes}`;
}

const repos = process.argv.slice(2);

if (repos.length === 0) {
  throw new Error('Usage: pnpm music:scaffold <repo> [<repo> ...]');
}

const directory = collectionDir('music');

fs.mkdirSync(directory, { recursive: true });

for (const line of await Promise.all(
  repos.map(async (repo) => scaffold(repo, directory)),
)) {
  report(line);
}

report(
  `\nWritten to ${directory}. Each still needs a description, its language checked, a project and a body.`,
);
