#!/usr/bin/env node

/**
 * Fails on a word masked with asterisks — `f*ck`, `f\*\*k`, `х\*й`, `s***` — in
 * any site's content, every Markdown file under `apps/*\/public/`:
 *
 *   pnpm check:masked-words
 *
 * The rule is `.claude/rules/content.md` § "Material whose author is in the
 * room": a word is written out. The body is scanned in the parser's text nodes
 * only, so emphasis — whose asterisks the parser consumes as delimiters — never
 * reads as a mask; the frontmatter is scanned whole, YAML having no emphasis.
 */

/* eslint-disable no-console -- stdout is this script's interface: the file,
   line and text of each masked word are the whole report the non-zero exit
   refers to. The rule stays `error` in the app, where a stray log ships to a
   user. */

import fs from 'node:fs';

import {
  findingLines,
  frontmatterSpan,
  lineAt,
  proseSpans,
  publicMarkdownFiles,
} from './lib/public-markdown.ts';

/**
 * A letter, then asterisks (each optionally backslash-escaped), then either a
 * letter — the mask inside a word — or, for two or more, the word's end.
 */
const MASK = /\p{L}(?:(?:\\?\*)+\p{L}|(?:\\?\*){2,})/gu;

function maskedLines(source: string): number[] {
  const frontmatter = frontmatterSpan(source);
  return [...(frontmatter ? [frontmatter] : []), ...proseSpans(source)].flatMap(
    ({ start, end }) =>
      [...source.slice(start, end).matchAll(MASK)].map((match) =>
        lineAt(source, start + match.index),
      ),
  );
}

const findings = publicMarkdownFiles().flatMap((file) => {
  const source = fs.readFileSync(file, 'utf8');
  return findingLines(file, source, maskedLines(source));
});

if (findings.length > 0) {
  console.log(
    `masked-words: ${findings.length} line(s) with a word masked by asterisks — write it out:\n`,
  );
  for (const finding of findings) console.log(finding);
  process.exit(1);
}

console.log('masked-words: clean');
