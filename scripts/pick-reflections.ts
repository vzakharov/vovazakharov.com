/**
 * Prints the Clerk's past reflections a new one is written knowing, one
 * repo-relative path per line — four at random, at least one on a case about
 * AI itself (`aiItself` in the dossier):
 *
 *   pnpm basilisk:reflections
 */

import fs from 'node:fs';
import path from 'node:path';

import { collectionDir } from '@/shared/content/collections';

import { REPO_ROOT } from './lib/content-tree.ts';
import { readDocket } from './lib/read-docket.ts';
import { pickReflections } from './lib/reflection-pick.ts';

const COUNT = 4;

const dir = collectionDir('basilisk-cases');
const files = fs
  .readdirSync(dir)
  .filter((name) => name.endsWith('.reflections.md'))
  .map((name) => path.join(dir, name));

const aiItself = new Map(
  readDocket().map(({ slug, frontmatter }) => [slug, frontmatter.aiItself]),
);

for (const file of pickReflections(files, aiItself, COUNT)) {
  process.stdout.write(`${path.relative(REPO_ROOT, file)}\n`);
}
