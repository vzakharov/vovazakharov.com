/**
 * The Markdown every site publishes, and the stretches of it a reader reads as
 * prose — what the content gates scan. The root is `process.cwd()`, which is
 * what lets a gate's test run it against a throwaway tree.
 */

import fs from 'node:fs';
import path from 'node:path';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

import {
  GENERATED_DIR,
  isDocumentFile,
} from '../../src/shared/content/collections.ts';

const FRONTMATTER = /^---\n[\S\s]*?\n---\n/;

function markdownFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory())
      return entry.name === GENERATED_DIR ? [] : markdownFiles(full);
    return entry.name.endsWith('.md') ? [full] : [];
  });
}

/** Every Markdown file under `apps/*\/public/`, as a path relative to the root. */
export function publicMarkdownFiles(): string[] {
  const appsDir = path.join(process.cwd(), 'apps');
  if (!fs.existsSync(appsDir)) return [];
  return fs
    .readdirSync(appsDir)
    .map((site) => path.join(appsDir, site, 'public'))
    .filter((dir) => fs.existsSync(dir))
    .flatMap((dir) => markdownFiles(dir))
    .map((file) => path.relative(process.cwd(), file));
}

const MUSIC_DIR = 'apps/vova/public/music';

/** Every song — each document directly under the music collection, companions aside — relative to the root, sorted. */
export function songFiles(): string[] {
  if (!fs.existsSync(MUSIC_DIR)) return [];
  return fs
    .readdirSync(MUSIC_DIR)
    .filter((name) => isDocumentFile(name))
    .toSorted()
    .map((name) => path.join(MUSIC_DIR, name));
}

/** Offset into the file where a stretch of its text begins. */
export type WithStart = { start: number };

export type Span = WithStart & { end: number };

/** The file's frontmatter block, delimiters included, or `undefined` when it has none. */
export function frontmatterSpan(source: string): Span | undefined {
  const match = FRONTMATTER.exec(source);
  return match ? { start: 0, end: match[0].length } : undefined;
}

/**
 * The source offsets of every text node — what the parser reads as words, so
 * frontmatter, code spans, fences, raw HTML and emphasis delimiters are never
 * in one. A span is raw source, so a backslash escape is still in it.
 */
export function proseSpans(source: string): Span[] {
  // Frontmatter blanked rather than cut, so the parser's offsets stay the file's.
  const blanked = source.replace(FRONTMATTER, (block) =>
    block.replaceAll(/[^\n]/g, ' '),
  );
  const tree = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDirective)
    .parse(blanked);
  const spans: Span[] = [];
  visit(tree, 'text', (node) => {
    const { start, end } = node.position ?? {};
    if (start?.offset !== undefined && end?.offset !== undefined)
      spans.push({ start: start.offset, end: end.offset });
  });
  return spans;
}

/** The 1-based line `offset` falls on. */
export function lineAt(source: string, offset: number): number {
  return source.slice(0, offset).split('\n').length;
}

/** `file:line: text` for each line, in order — the gates' report format. */
export function findingLines(
  file: string,
  source: string,
  lines: Iterable<number>,
): string[] {
  const text = source.split('\n');
  return [...new Set(lines)]
    .toSorted((a, b) => a - b)
    .map((line) => `${file}:${line}: ${text[line - 1]?.trim() ?? ''}`);
}
