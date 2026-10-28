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
 * the title, `language`, `project`, the body and, where wanted, a per-locale
 * hook.
 *
 * The duration comes out of the master's STREAMINFO block; the MP3 copy's
 * size, `<stem>.master.mp3` beside the master, off the host's
 * `content-length`.
 *
 * It never overwrites a document that exists, so a re-run after the author has
 * edited one is safe and reports what it skipped.
 *
 * Runs under `tsx` from the site directory, like the other content scripts, so
 * `collectionDir` resolves against that site's `public/`. Needs network and, for
 * the API's rate limit, `GH_TOKEN`.
 */

import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';

import { byLocale, inLocale } from '@/kernel/shared/i18n';
import type { Dated, Named, Timed } from '@/kernel/shared/typings';

import { collectionDir } from '@/blog/shared/content/index.node-safe';

import {
  readSiteCatalogueNames,
  readTagManifest,
  writeTagManifest,
} from '@/music/shared/catalogue';
import {
  MUSIC_ORGANIZATION,
  servedPath,
  SONG_BRANCH,
} from '@/music/shared/catalogue/index.node-safe';

import { fetchStreamInfo, type StreamInfo } from './lib/flac-stream-info.ts';
import {
  copyName,
  defaultBranch,
  EXPLICIT_MARKER,
  fetchBytes,
  findMaster,
  firstCommitDate,
  type Master,
} from './lib/scaffold-repository.ts';

const CATALOGUE = readSiteCatalogueNames();

const manifest = readTagManifest();

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
    project: z.array(CATALOGUE.projectSchema).min(1).optional(),
    language: z.array(z.string().min(1)).min(1).optional(),
    album: CATALOGUE.albumSchema.optional(),
    /** Where a store marks the song explicit and its file name does not. */
    explicit: z.literal(true).optional(),
    /** Something for the author to check, kept in the file as a comment. */
    note: z.string().min(1).optional(),
  }),
);

type SongSpec = z.infer<typeof specSchema>[number];

type DocumentFields = Named &
  Dated &
  Timed & {
    spec: SongSpec;
    master: Master;
    streamInfo: StreamInfo;
    mp3Bytes?: number;
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
  const { name, date, spec, seconds, master, streamInfo, mp3Bytes } = fields;
  const {
    repo,
    project,
    language = ['ru'],
    album,
    explicit,
    note,
    title = name,
  } = spec;
  const { sampleRate, bitsPerSample, channels } = streamInfo;
  const titles = byLocale((locale) => inLocale(title, locale));
  // The song's own name is the one in the language it is sung in, the English
  // one where neither locale's is; a locale restates it only to differ, and
  // has a block only then.
  const own = language[0] === 'ru' ? titles.ru : titles.en;
  const { en, ru } = byLocale((locale) =>
    titles[locale] === own
      ? ''
      : `${locale}:\n  title: ${yaml(titles[locale])}\n`,
  );

  return `---
title: ${yaml(own)}
date: ${date}
language: ${language.length === 1 ? language.join('') : `[${language.join(', ')}]`}
${
  project === undefined
    ? `# project: [<artist>, <features...>] — one of ${CATALOGUE.artists.map((artist) => artist.name).join(', ')}`
    : `project: ${yamlList(project)}`
}
repo: ${yaml(repo)}
seconds: ${seconds}
${
  mp3Bytes === undefined
    ? `# mp3Bytes: — encode ${copyName(master.flac)} beside the master first`
    : `mp3Bytes: ${mp3Bytes}`
}
explicit: ${String(master.explicit || explicit === true)}
${album === undefined ? '' : `album: ${album}\n`}${en}${ru}---

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

  const branch = await defaultBranch(repo);

  if (branch !== SONG_BRANCH) {
    throw new Error(
      `${repo}'s default branch is ${branch}; a song's files are served from ${SONG_BRANCH}`,
    );
  }

  const master = await findMaster(repo, branch, spec.master);
  const streamInfo = await fetchStreamInfo(master.url);
  const seconds = Math.round(streamInfo.totalSamples / streamInfo.sampleRate);

  // The tag run finds the files to name and tag here, its empty hash leaving
  // the song stale until it has.
  manifest[slug] = {
    hash: '',
    paths: [master.flac, ...(master.copy ? [master.copy.name] : [])].map(
      (name) => servedPath({ repo }, name),
    ),
  };
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
      ...(master.copy === undefined
        ? {}
        : { mp3Bytes: await fetchBytes(master.copy.url) }),
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

writeTagManifest(manifest);

report(
  `\nWritten to ${directory}. Each still needs a body, its story and words; a field the spec left out is a comment to fill in.`,
);
