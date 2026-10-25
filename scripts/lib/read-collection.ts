/**
 * A collection's documents, parsed through the schema the site builds with.
 * Reaching `shared/content` needs the `react-server` condition the
 * `content:og:<site>` entries run under, which is what resolves `server-only`
 * to its empty module. Not `listDocuments`: it resolves each document's card,
 * so it throws before the first render.
 */

import matter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';

import {
  collectionDir,
  isDocumentFile,
  type Slugged,
} from '@/shared/content/collections';
import type {
  BaseFrontmatter,
  Collection,
  FrontmatterReader,
  WithFrontmatter,
} from '@/shared/content/frontmatter';
import type { Titled } from '@/shared/typings';

import { contentFiles } from './content-tree.ts';
import { headingTitle } from './docket.ts';

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

function parseFrontmatter<F>(
  schema: FrontmatterReader<F>,
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
