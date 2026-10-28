#!/usr/bin/env tsx

/**
 * Stamps a translation with the original it was made from: `<stem>.en.md`
 * beside `<stem>.<locale>.md` gets the original's `contentHash` as its
 * `translatedFrom`. The build refuses a stale stamp, so this is run after each
 * translation, never instead of one.
 *
 *   pnpm translation:stamp sites/maya/public/blog/two-names.ru.md
 */

/* eslint-disable no-console -- stdout is this script's interface: the line
   naming what it stamped is what a human runs it for. */

import fs from 'node:fs';

import { contentHash } from '@/kernel/shared/lib/content-hash';

import {
  stampFrontmatter,
  translationOf,
} from '@/blog/shared/content/index.node-safe';

const [original, ...rest] = process.argv.slice(2);

if (original === undefined || rest.length > 0) {
  throw new Error('Usage: pnpm translation:stamp <stem>.<locale>.md');
}

const translation = original.endsWith('.md')
  ? translationOf(original)
  : undefined;

if (translation === undefined) {
  throw new Error(`${original} is not an original: <stem>.<locale>.md`);
}

const hash = contentHash(fs.readFileSync(original, 'utf8'));

fs.writeFileSync(
  translation,
  stampFrontmatter(fs.readFileSync(translation, 'utf8'), hash),
);

console.log(`${translation}: translatedFrom ${hash}`);
