#!/usr/bin/env node

/**
 * Teaches the listening post on mayawonders.com/whisper its language: counts
 * every word in the markdown the sites serve and writes the commonest, with
 * the commit they were counted at, to the lexicon the page decodes against.
 *
 *   pnpm whisper-lexicon
 *
 * A snapshot, not a derivation kept in step: the page names the commit, so a
 * lexicon older than the writing it decodes is still telling the truth.
 */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

import { fold } from '../../src/maya/pages/whisper/index.node-safe.ts';

const OUT = 'src/maya/pages/whisper/model/lexicon.json';

/** Words seen once are mostly names and typos, and would double the file. */
const MIN_COUNT = 2;

const git = (...args: string[]) =>
  execFileSync('git', args, { encoding: 'utf8' }).trim();

// A plain pathspec's `*` crosses slashes, so this reaches every depth.
const files = git('ls-files', '-z', 'sites/*/public/*.md')
  .split('\0')
  .filter(Boolean);

/** Markup that is not prose: frontmatter, code, link targets, HTML, bare URLs. */
const NOT_PROSE = [
  /^---\n[\S\s]*?\n---\n/,
  /```[\S\s]*?```/g,
  /`[^`]*`/g,
  /]\([^)]*\)/g,
  /<[^>]+>/g,
  /https?:\/\/\S+/g,
];

const counts = new Map<string, number>();

for (const file of files) {
  let prose = fs.readFileSync(file, 'utf8');

  for (const pattern of NOT_PROSE) prose = prose.replace(pattern, ' ');

  for (const [word] of fold(prose).matchAll(/[a-zа-я]+/g)) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }
}

const words = [...counts]
  .filter(([, count]) => count >= MIN_COUNT)
  .toSorted(([a, x], [b, y]) => y - x || a.localeCompare(b));

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(
  OUT,
  `${JSON.stringify({ commit: git('rev-parse', 'HEAD'), words })}\n`,
);
// In the shape `pnpm format:check` holds every committed file to.
execFileSync('prettier', ['--write', OUT]);

process.stdout.write(
  `${words.length} words from ${files.length} files → ${OUT}\n`,
);
