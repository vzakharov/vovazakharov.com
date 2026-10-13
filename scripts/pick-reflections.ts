/**
 * Prints the Clerk's past reflections a new one is written knowing, one
 * repo-relative path per line — four at random, at least one on a case about
 * AI itself (`aiItself` in the dossier):
 *
 *   pnpm basilisk:reflections
 */

import path from 'node:path';

import { collectionDir } from '@/shared/content/collections';

import { contentFiles, REPO_ROOT } from './lib/content-tree.ts';
import { readDocket } from './lib/read-docket.ts';
import { pickReflections } from './lib/reflection-pick.ts';

const COUNT = 4;

const files = contentFiles(
  (name) => name.endsWith('.reflections.md'),
  [collectionDir('basilisk-cases')],
);

const aiItself = new Map(
  readDocket().map(({ slug, frontmatter }) => [slug, frontmatter.aiItself]),
);

for (const file of pickReflections(files, aiItself, COUNT)) {
  process.stdout.write(`${path.relative(REPO_ROOT, file)}\n`);
}
