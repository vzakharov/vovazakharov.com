#!/usr/bin/env node

/**
 * Fails on a word masked with asterisks — `f*ck`, `f\*\*k`, `х\*й`, `s***` — in
 * a song, every Markdown file directly under `apps/vova/public/music/`:
 *
 *   pnpm check:masked-words
 *
 * The rule is `.claude/rules/songs.md` § "Material whose author is in the
 * room": a word is written out. The body is scanned in the parser's text nodes
 * only, so emphasis — whose asterisks the parser consumes as delimiters — never
 * reads as a mask; the frontmatter is scanned whole, YAML having no emphasis.
 *
 * A mask the recording itself carries — a word bleeped on the track — is the
 * song's, not the transcriber's, and stays. The song says so in its
 * frontmatter, the word as it is written (escapes dropped) keyed to why:
 *
 *   masked:
 *     'про**ли': 'Bleeped on the recording too, as a creative choice.'
 *
 * which exempts that word wherever the file writes it, its own key included.
 */

/* eslint-disable no-console -- stdout is this script's interface: the file,
   line and text of each masked word are the whole report the non-zero exit
   refers to. The rule stays `error` in the app, where a stray log ships to a
   user. */

import matter from 'gray-matter';
import fs from 'node:fs';
import { z } from 'zod';

import {
  findingLines,
  frontmatterSpan,
  lineAt,
  proseSpans,
  songFiles,
} from './lib/public-markdown.ts';

/**
 * A letter, then asterisks (each optionally backslash-escaped), then either a
 * letter — the mask inside a word — or, for two or more, the word's end.
 */
const MASK = /\p{L}(?:(?:\\?\*)+\p{L}|(?:\\?\*){2,})/gu;

/** The whole word a mask sits in: letters, asterisks and their escapes. */
const WORD_CHAR = /[\p{L}*\\]/u;

/** Each word the recording masks, keyed to the reason it stays masked. */
const exemptionsSchema = z.object({
  masked: z.record(z.string().min(1), z.string().trim().min(1)).default({}),
});

function wordAround(text: string, from: number, to: number): string {
  let start = from;
  let end = to;
  while (start > 0 && WORD_CHAR.test(text.charAt(start - 1))) start -= 1;
  while (end < text.length && WORD_CHAR.test(text.charAt(end))) end += 1;
  return text.slice(start, end).replaceAll(String.raw`\*`, '*');
}

function maskedLines(source: string, exempt: ReadonlySet<string>): number[] {
  const frontmatter = frontmatterSpan(source);
  return [...(frontmatter ? [frontmatter] : []), ...proseSpans(source)].flatMap(
    ({ start, end }) => {
      const text = source.slice(start, end);
      return [...text.matchAll(MASK)]
        .filter(
          (match) =>
            !exempt.has(
              wordAround(text, match.index, match.index + match[0].length),
            ),
        )
        .map((match) => lineAt(source, start + match.index));
    },
  );
}

const findings = songFiles().flatMap((file) => {
  const source = fs.readFileSync(file, 'utf8');
  const parsed = exemptionsSchema.safeParse(matter(source).data);
  if (!parsed.success)
    throw new Error(
      `${file}: \`masked\` maps each word to the reason it stays masked`,
      { cause: parsed.error },
    );
  return findingLines(
    file,
    source,
    maskedLines(source, new Set(Object.keys(parsed.data.masked))),
  );
});

if (findings.length > 0) {
  console.log(
    `masked-words: ${findings.length} line(s) with a word masked by asterisks — write it out:\n`,
  );
  for (const finding of findings) console.log(finding);
  process.exit(1);
}

console.log('masked-words: clean');
