#!/usr/bin/env node

/**
 * Stamps a translation with the original it was made from: `<stem>.md` beside
 * `<stem>.<locale>.md` gets the original's `contentHash` as its
 * `translatedFrom`. The build refuses a stale stamp, so this is run after each
 * translation, never instead of one.
 *
 *   pnpm translation:stamp apps/maya/public/blog/two-names.ru.md
 *
 * Bare Node runs this file, relying on its type stripping, so every relative
 * import carries its `.ts` extension.
 */

/* eslint-disable no-console -- stdout is this script's interface: the line
   naming what it stamped is what a human runs it for. */

import fs from 'node:fs';

import { contentHash } from '../src/shared/content/content-hash.ts';
import { translationOf } from '../src/shared/content/locale-suffix.ts';
import { stampFrontmatter } from '../src/shared/content/translation-stamp.ts';

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
