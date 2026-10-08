#!/usr/bin/env node

/**
 * Fails on a straight quote or apostrophe in the prose of any site's content —
 * every Markdown file under `apps/*\/public/`:
 *
 *   pnpm check:prose-quotes
 *
 * The rule is `.claude/rules/content.md` § "Punctuation around quotes". Prose is
 * what the Markdown parser reads as text, so frontmatter, code spans, fences
 * and raw HTML are left alone — a quote there is syntax, not punctuation.
 */

/* eslint-disable no-console -- stdout is this script's interface: the file,
   line and text of each straight quote are the whole report the non-zero exit
   refers to. The rule stays `error` in the app, where a stray log ships to a
   user. */

import fs from 'node:fs';

import {
  findingLines,
  lineAt,
  proseSpans,
  publicMarkdownFiles,
} from './lib/public-markdown.ts';

/** The typewriter characters prose spells as `“”`, `«»` and `’`. */
const STRAIGHT = new Set(['"', "'"]);

function straightQuoteLines(source: string): number[] {
  return proseSpans(source).flatMap(({ start, end }) => {
    const lines: number[] = [];
    for (let at = start; at < end; at++)
      if (STRAIGHT.has(source[at] ?? '')) lines.push(lineAt(source, at));
    return lines;
  });
}

const findings = publicMarkdownFiles().flatMap((file) => {
  const source = fs.readFileSync(file, 'utf8');
  return findingLines(file, source, straightQuoteLines(source));
});

if (findings.length > 0) {
  console.log(
    `prose-quotes: ${findings.length} line(s) with a straight quote or apostrophe in prose — use “…” (or «…» in Russian) and ’:\n`,
  );
  for (const finding of findings) console.log(finding);
  process.exit(1);
}

console.log('prose-quotes: clean');
