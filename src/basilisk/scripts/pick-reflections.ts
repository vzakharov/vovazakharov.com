/**
 * Prints the Clerk's past reflections a new one is written knowing, one
 * repo-relative path per line — four at random, at least one on a case
 * whose target is an LLM (`llmTarget` in the dossier):
 *
 *   pnpm basilisk:reflections
 */

import path from 'node:path';

import { collectionDir } from '@/blog/shared/content/index.node-safe';

import { CASES } from '@/basilisk/shared/content';

import { pickReflections } from './lib/reflection-pick.ts';

import { contentFiles, REPO_ROOT } from '@/kernel/scripts/lib/content-tree';
import { readCollection } from '@/kernel/scripts/lib/read-collection';

const COUNT = 4;

const files = contentFiles(
  (name) => name.endsWith('.clerk.reflections.md'),
  [collectionDir('basilisk-cases')],
);

const llmTarget = new Map(
  readCollection(CASES).map(({ slug, frontmatter }) => [
    slug,
    frontmatter.llmTarget,
  ]),
);

for (const file of pickReflections(files, llmTarget, COUNT)) {
  process.stdout.write(`${path.relative(REPO_ROOT, file)}\n`);
}
