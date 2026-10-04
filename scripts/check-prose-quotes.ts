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
 *
 * The scan root is `process.cwd()`, which is what lets the test run it against
 * a throwaway tree.
 */

/* eslint-disable no-console -- stdout is this script's interface: the file,
   line and text of each straight quote are the whole report the non-zero exit
   refers to. The rule stays `error` in the app, where a stray log ships to a
   user. */

import fs from 'node:fs';
import path from 'node:path';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';

const APPS_DIR = path.join(process.cwd(), 'apps');

/** The pipeline's own output, which is not authored prose. */
const GENERATED_DIR = 'generated';

/** The typewriter characters prose spells as `“”`, `«»` and `’`. */
const STRAIGHT = new Set(['"', "'"]);

const FRONTMATTER = /^---\n[\S\s]*?\n---\n/;

function markdownFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory())
      return entry.name === GENERATED_DIR ? [] : markdownFiles(full);
    return entry.name.endsWith('.md') ? [full] : [];
  });
}

/** Frontmatter blanked rather than cut, so the parser's line numbers stay the file's. */
function withoutFrontmatter(source: string): string {
  return source.replace(FRONTMATTER, (block) =>
    block.replaceAll(/[^\n]/g, ' '),
  );
}

function straightQuoteLines(source: string): number[] {
  const tree = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDirective)
    .parse(withoutFrontmatter(source));
  const lines = new Set<number>();
  visit(tree, 'text', (node) => {
    const { start, end } = node.position ?? {};
    if (start?.offset === undefined || end?.offset === undefined) return;
    for (let at = start.offset; at < end.offset; at++)
      if (STRAIGHT.has(source[at] ?? ''))
        lines.add(source.slice(0, at).split('\n').length);
  });
  return [...lines].toSorted((a, b) => a - b);
}

const sites = fs.existsSync(APPS_DIR)
  ? fs
      .readdirSync(APPS_DIR)
      .map((site) => path.join(APPS_DIR, site, 'public'))
      .filter((dir) => fs.existsSync(dir))
  : [];

const findings = sites.flatMap((dir) =>
  markdownFiles(dir).flatMap((file) => {
    const source = fs.readFileSync(file, 'utf8');
    const lines = source.split('\n');
    return straightQuoteLines(source).map(
      (line) =>
        `${path.relative(process.cwd(), file)}:${line}: ${lines[line - 1]?.trim() ?? ''}`,
    );
  }),
);

if (findings.length > 0) {
  console.log(
    `prose-quotes: ${findings.length} line(s) with a straight quote or apostrophe in prose — use “…” (or «…» in Russian) and ’:\n`,
  );
  for (const finding of findings) console.log(finding);
  process.exit(1);
}

console.log('prose-quotes: clean');
