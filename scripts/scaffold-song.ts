/**
 * Turn a `vovas-music` repository into a song document.
 *
 * Usage, from the repository root:
 *   pnpm music:scaffold <repo> [<repo> ...]
 *   pnpm music:scaffold --spec <file.json>
 *
 * The second form writes what the author already decided rather than leaving
 * it blank; `specSchema` below is its shape.
 *
 * A song's mechanical fields all live outside this repo — in the master's
 * filename, in its FLAC header and in the source repository's own history — so
 * they are read rather than typed. What is left for the author is the prose:
 * the title, the per-locale blurbs, `language`, `project` and the body.
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

import { collectionDir } from '@/shared/content/collections';
import { byLocale, inLocale } from '@/shared/i18n/locales';
import {
  MUSIC_ALBUM_SLUGS,
  MUSIC_ORGANIZATION,
  MUSIC_PROJECT_NAMES,
} from '@/shared/music-catalogue/index.node-safe';
import type { Dated, Named } from '@/shared/typings';

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
 * A quoted YAML scalar. Every authored value goes through it: a title or a
 * blurb holding `: ` parses as a mapping unquoted, and the document is then
 * rejected at build time rather than where it was written. Single-quoted unless
 * the value holds a `'` — the choice Prettier makes, so a fresh file passes the
 * format check; the double-quoted form is JSON's string form.
 */
function yaml(value: string): string {
  return value.includes("'") ? JSON.stringify(value) : `'${value}'`;
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

/**
 * A song is a master, and a master is a root `.flac`: the only one, or the one
 * named — a repository holding several is ambiguous until someone picks.
 */
async function findMaster(
  repo: string,
  branch: string,
  named?: string,
): Promise<Master> {
  const entries = await json(
    `https://api.github.com/repos/${MUSIC_ORGANIZATION}/${repo}/contents/`,
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

/**
 * What the author already decided about a song, as `--spec` reads it. The
 * language is left for the build to check: its list lives behind
 * `server-only`, which a script cannot load.
 */
const specSchema = z.array(
  z.object({
    repo: z.string().min(1),
    /** The file's name, where it is not the repository's — an album track. */
    slug: z.string().min(1).optional(),
    /** The root FLAC, where the repository holds several. */
    master: z.string().min(1).optional(),
    title: z
      .union([
        z.string().min(1),
        z.object({ en: z.string().min(1), ru: z.string().min(1) }),
      ])
      .optional(),
    project: z.array(z.enum(MUSIC_PROJECT_NAMES)).min(1).optional(),
    language: z.array(z.string().min(1)).min(1).optional(),
    album: z.enum(MUSIC_ALBUM_SLUGS).optional(),
    hidden: z.boolean().optional(),
    /** Where a store marks the song explicit and its file name does not. */
    explicit: z.literal(true).optional(),
    /** Something for the author to check, kept in the file as a comment. */
    note: z.string().min(1).optional(),
  }),
);

type SongSpec = z.infer<typeof specSchema>[number];

type DocumentFields = Named &
  Dated & {
    spec: SongSpec;
    seconds: number;
    master: Master;
    streamInfo: StreamInfo;
  };

function yamlList(values: readonly string[]): string {
  return `[${values.map((value) => yaml(value)).join(', ')}]`;
}

/**
 * The frontmatter this script can fill, plus a body that says what is left. A
 * field the spec leaves out is written as a YAML comment rather than an empty
 * value: an empty one parses as null and the schema rejects it, which is the
 * loud failure a placeholder string would not be.
 */
function document(fields: DocumentFields): string {
  const { name, date, spec, seconds, master, streamInfo } = fields;
  const {
    repo,
    project,
    language = ['ru'],
    album,
    hidden,
    explicit,
    note,
    title = name,
  } = spec;
  const { sampleRate, bitsPerSample, channels } = streamInfo;
  const titles = byLocale((locale) => inLocale(title, locale));
  // The song's own name is the one in the language it is sung in, the English
  // one where neither locale's is; a locale restates it only to differ.
  const own = language[0] === 'ru' ? titles.ru : titles.en;
  const { en, ru } = byLocale((locale) =>
    titles[locale] === own ? '' : `  title: ${yaml(titles[locale])}\n`,
  );

  return `---
title: ${yaml(own)}
date: ${date}
status: done
language: ${language.length === 1 ? language.join('') : `[${language.join(', ')}]`}
${
  project === undefined
    ? `# project: [<artist>, <features...>] — one of ${MUSIC_PROJECT_NAMES.join(', ')}`
    : `project: ${yamlList(project)}`
}
repo: ${yaml(repo)}
audio: ${master.audio}
seconds: ${seconds}
explicit: ${String(master.explicit || explicit === true)}
${album === undefined ? '' : `album: ${album}\n`}${hidden === true ? 'hidden: true\n' : ''}en:
${en}  description: ${yaml('TBD')}
ru:
${ru}  description: ${yaml('TBD')}
---

${note === undefined ? '' : `<!-- For Vova to check: ${note} -->\n\n`}<!-- Scaffolded from https://github.com/${MUSIC_ORGANIZATION}/${repo} — ${master.flac},
     ${sampleRate / 1000} kHz / ${bitsPerSample}-bit / ${channels === 2 ? 'stereo' : `${channels} ch`}.
     Replace this with the story, told once per language under a "lang:en" and
     a "lang:ru" marker, and put the words under "lyrics:" plus the language
     they are sung in. Each marker is an HTML comment, like this note. -->
`;
}

async function scaffold(spec: SongSpec, directory: string): Promise<string> {
  const { repo, slug = repo } = spec;
  const filePath = path.join(directory, `${slug}.md`);

  if (fs.existsSync(filePath)) return `${slug}: already written, left alone`;

  const { default_branch: branch } = await json(
    `https://api.github.com/repos/${MUSIC_ORGANIZATION}/${repo}`,
    repositorySchema,
  );
  const master = await findMaster(repo, branch, spec.master);
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
      spec,
      seconds,
      master,
      streamInfo,
    }),
  );

  const minutes = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

  return `${slug}: ${master.flac} — ${minutes}`;
}

function readSpecs(argv: readonly string[]): SongSpec[] {
  const [flag, file, ...rest] = argv;

  if (flag !== '--spec') return argv.map((repo) => ({ repo }));
  if (file === undefined || rest.length > 0) {
    throw new Error('Usage: pnpm music:scaffold --spec <file.json>');
  }

  return specSchema.parse(JSON.parse(fs.readFileSync(file, 'utf8')));
}

const specs = readSpecs(process.argv.slice(2));

if (specs.length === 0) {
  throw new Error(
    'Usage: pnpm music:scaffold <repo> [<repo> ...] | --spec <file.json>',
  );
}

const directory = collectionDir('music');

fs.mkdirSync(directory, { recursive: true });

for (const line of await Promise.all(
  specs.map(async (spec) => scaffold(spec, directory)),
)) {
  report(line);
}

report(
  `\nWritten to ${directory}. Each still needs its blurbs in both languages and a body; a field the spec left out is a comment to fill in.`,
);
