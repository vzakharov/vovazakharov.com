/**
 * Prints the Clerk's past reflections a new one is written knowing, one
 * repo-relative path per line — four at random, at least one on a case
 * whose target is an LLM (`llmTarget` in the dossier):
 *
 *   pnpm basilisk:reflections
 */

import path from 'node:path';

<<<<<<< HEAD:src/basilisk/scripts/pick-reflections.ts
import { collectionDir } from '@/kernel/shared/content/index.node-safe';

import {
  contentFiles,
  REPO_ROOT,
} from '../../kernel/scripts/lib/content-tree.ts';
import { readDocket } from './lib/read-docket.ts';
=======
import { ARTICLE_COLLECTIONS } from '@/shared/content/collection-schemas';
import { collectionDir } from '@/shared/content/collections';

import { contentFiles, REPO_ROOT } from './lib/content-tree.ts';
import { readCollection } from './lib/read-collection.ts';
>>>>>>> origin/main:scripts/pick-reflections.ts
import { pickReflections } from './lib/reflection-pick.ts';

const COUNT = 4;

const files = contentFiles(
  (name) => name.endsWith('.clerk.reflections.md'),
  [collectionDir('basilisk-cases')],
);

const llmTarget = new Map(
  readCollection(ARTICLE_COLLECTIONS['basilisk-cases']).map(
    ({ slug, frontmatter }) => [slug, frontmatter.llmTarget],
  ),
);

for (const file of pickReflections(files, llmTarget, COUNT)) {
  process.stdout.write(`${path.relative(REPO_ROOT, file)}\n`);
}
