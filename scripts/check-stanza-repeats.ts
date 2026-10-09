#!/usr/bin/env node

/**
 * Fails on a stanza that repeats the one before it in a song's lyrics — every
 * Markdown file directly under `apps/vova/public/music/`, or the songs named —
 * and with `--fix` collapses each run into its first stanza closed by `xN`:
 *
 *   pnpm check:stanza-repeats [--fix] [<song.md>…]
 *
 * A repeat `scripts/lib/stanza-repeats.ts` refuses to collapse, since it would
 * misalign the lyrics sections, fails with or without `--fix`, saying why.
 */

import fs from 'node:fs';

import { given } from './lib/argv.ts';
import { findingLines, lineAt, songFiles } from './lib/public-markdown.ts';
import { stanzaRepeats } from './lib/stanza-repeats.ts';

const fix = given('fix');
const named = process.argv.slice(2).filter((arg) => !arg.startsWith('--'));

const found: string[] = [];
const refused: string[] = [];
const collapsed: string[] = [];

for (const file of named.length > 0 ? named : songFiles()) {
  const source = fs.readFileSync(file, 'utf8');
  const { repeats, fixed } = stanzaRepeats(source);
  for (const repeat of repeats.toSorted((a, b) => a.offset - b.offset)) {
    const [finding = ''] = findingLines(file, source, [
      lineAt(source, repeat.offset),
    ]);
    if (repeat.refused === undefined) found.push(finding);
    else refused.push(`${finding} — ${repeat.refused}`);
  }
  if (fix && fixed !== source) {
    fs.writeFileSync(file, fixed);
    collapsed.push(file);
  }
}

const out = (lines: string[]) => {
  process.stdout.write(`${lines.join('\n')}\n`);
};

if (collapsed.length > 0)
  out([`stanza-repeats: collapsed repeats in`, ...collapsed, '']);
if (!fix && found.length > 0)
  out([
    `stanza-repeats: ${String(found.length)} stanza(s) repeating the one before — \`pnpm check:stanza-repeats --fix\` collapses them into xN:\n`,
    ...found,
    '',
  ]);
if (refused.length > 0)
  out([
    `stanza-repeats: ${String(refused.length)} repeat(s) that cannot collapse without misaligning the lyrics sections — settle by hand:\n`,
    ...refused,
    '',
  ]);
if (refused.length > 0 || (!fix && found.length > 0)) process.exit(1);
if (collapsed.length === 0) out(['stanza-repeats: clean']);
