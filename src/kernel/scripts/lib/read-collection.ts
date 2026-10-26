/**
 * A collection's documents, parsed through the schema the site builds with.
 * Reaching `shared/content` needs the `react-server` condition the
 * `content:og` entry runs under, which is what resolves `server-only`
 * to its empty module. Not `listDocuments`: it resolves each document's card,
 * so it throws before the first render.
 */

import matter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';

import type {
  BaseFrontmatter,
  Collection,
  WithFrontmatter,
} from '@/kernel/shared/content';
import {
  collectionDir,
  isDocumentFile,
  type Slugged,
} from '@/kernel/shared/content/index.node-safe';
import type { Titled } from '@/kernel/shared/typings';

import { contentFiles } from './content-tree.ts';
import { headingTitle } from './heading-title.ts';

export type CollectionEntry<F extends BaseFrontmatter> = Slugged &
  Titled &
  WithFrontmatter<F>;

export function readCollection<F extends BaseFrontmatter>({
  id,
  schema,
}: Collection<F>): Array<CollectionEntry<F>> {
  return contentFiles(isDocumentFile, [collectionDir(id)]).map((file) => {
    const { data, content } = matter(fs.readFileSync(file, 'utf8'));
    const frontmatter = parseFrontmatter(schema, data, file);

    return {
      slug: path.basename(file, '.md'),
      title: headingTitle(content, file),
      frontmatter,
    };
  });
}

function parseFrontmatter<F extends BaseFrontmatter>(
  schema: Collection<F>['schema'],
  data: unknown,
  file: string,
): F {
  try {
    return schema.parse(data);
  } catch (error) {
    throw new Error(`Invalid frontmatter in ${file}`, {
      cause: error instanceof Error ? error : new Error(String(error)),
    });
  }
}
