#!/usr/bin/env node

/**
 * Fails on punctuation typed for the wrong medium, both ways round:
 *
 *   pnpm check:typography
 *
 * - **Served prose** — every Markdown file under `apps/*\/public/` — is typeset:
 *   a straight quote or apostrophe, or `--`, fails it. Prose is what the
 *   Markdown parser reads as text, so frontmatter, code spans, fences and raw
 *   HTML are left alone — a quote there is syntax, not punctuation.
 * - **A channel post** — the `text` fence of a draft under `writing/*\/drafts/`,
 *   pasted as written — follows its channel: a keyboard channel's fails on a
 *   `—` or a curly quote, any other channel's on what served prose fails on.
 *   The draft's prose around the fence is ordinary Markdown and is not read.
 *
 * The rules are `.claude/rules/content.md` § "Dashes" and § "Punctuation around
 * quotes", and `writing/CLAUDE.md` § "Voice".
 */

/* eslint-disable no-console -- stdout is this script's interface: the file,
   line and text of each finding are the whole report the non-zero exit
   refers to. The rule stays `error` in the app, where a stray log ships to a
   user. */

import fs from 'node:fs';
import path from 'node:path';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

import {
  findingLines,
  lineAt,
  proseSpans,
  publicMarkdownFiles,
  type Span,
} from './lib/public-markdown.ts';

/**
 * The channels whose posts are typed as a keyboard types them —
 * `writing/CLAUDE.md` § "Voice" says which and why. Every other channel is
 * typeset.
 */
const KEYBOARD_CHANNELS = new Set(['linkedin']);

/** Every draft under `writing/<channel>/drafts/` for the channels `keyboard` selects, relative to the root. */
function draftFiles(keyboard: boolean): string[] {
  const writingDir = path.join(process.cwd(), 'writing');
  if (!fs.existsSync(writingDir)) return [];
  return fs
    .readdirSync(writingDir)
    .filter((channel) => KEYBOARD_CHANNELS.has(channel) === keyboard)
    .map((channel) => path.join('writing', channel, 'drafts'))
    .filter((dir) => fs.existsSync(dir))
    .flatMap((dir) =>
      fs
        .readdirSync(dir)
        .filter((name) => name.endsWith('.md'))
        .map((name) => path.join(dir, name)),
    );
}

/** The source offsets of each `text` fence — a draft's post text, fence lines included. */
function postTextSpans(source: string): Span[] {
  const spans: Span[] = [];
  visit(unified().use(remarkParse).parse(source), 'code', (node) => {
    const { start, end } = node.position ?? {};
    if (
      node.lang === 'text' &&
      start?.offset !== undefined &&
      end?.offset !== undefined
    )
      spans.push({ start: start.offset, end: end.offset });
  });
  return spans;
}

type Rule = {
  /** What the finding is and what to type instead. */
  hint: string;
  files: () => string[];
  spans: (source: string) => Span[];
  pattern: RegExp;
};

const RULES: Rule[] = [
  {
    hint: 'a straight quote or apostrophe in served prose — use “…” (or «…» in Russian) and ’',
    files: publicMarkdownFiles,
    spans: proseSpans,
    pattern: /["']/g,
  },
  {
    hint: 'two hyphens in served prose — use —',
    files: publicMarkdownFiles,
    spans: proseSpans,
    pattern: /--/g,
  },
  {
    hint: 'keyboard punctuation in a typeset channel’s post — use —, “…” (or «…» in Russian) and ’',
    files: () => draftFiles(false),
    spans: postTextSpans,
    pattern: /--|["']/g,
  },
  {
    hint: 'typeset punctuation in a keyboard channel’s post — type --, " and \'',
    files: () => draftFiles(true),
    spans: postTextSpans,
    pattern: /[«»—‘’“”]/g,
  },
];

function hitLines(source: string, spans: Span[], pattern: RegExp): number[] {
  return spans.flatMap(({ start, end }) =>
    [...source.slice(start, end).matchAll(pattern)].map((match) =>
      lineAt(source, start + match.index),
    ),
  );
}

const reports = RULES.map(({ hint, files, spans, pattern }) => ({
  hint,
  findings: files().flatMap((file) => {
    const source = fs.readFileSync(file, 'utf8');
    return findingLines(file, source, hitLines(source, spans(source), pattern));
  }),
})).filter(({ findings }) => findings.length > 0);

if (reports.length > 0) {
  for (const { hint, findings } of reports) {
    console.log(`typography: ${findings.length} line(s) with ${hint}:\n`);
    for (const finding of findings) console.log(finding);
    console.log();
  }
  process.exit(1);
}

console.log('typography: clean');
