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
  COLLECTIONS,
  isDocumentFile,
  type Slugged,
} from '@/shared/content/collections';
import type {
  BaseFrontmatter,
  Collection,
  FrontmatterReader,
  WithFrontmatter,
} from '@/shared/content/frontmatter';
import { firstImage } from '@/shared/content/first-image';
import { splitLocale, translatedData } from '@/shared/content/translations';
import type { Titled } from '@/shared/typings';

import { contentFiles } from './content-tree.ts';
import { headingTitle } from './docket.ts';

export type CollectionEntry<F extends BaseFrontmatter> = Slugged &
  Titled &
  WithFrontmatter<F> & {
    /** What stands for it on a list: `cardImage`, else the body's first image. */
    cardImage?: string;
  };

/**
 * A translated collection is read in its default language, the one its cards
 * print: each original is skipped for the translation beside it.
 */
export function readCollection<F extends BaseFrontmatter>({
  id,
  schema,
}: Collection<F>): Array<CollectionEntry<F>> {
  const translated = COLLECTIONS[id].localized === 'translated';
  const isRead = (fileName: string) =>
    isDocumentFile(fileName) &&
    !(translated && splitLocale(path.basename(fileName, '.md')).locale);

  return contentFiles(isRead, [collectionDir(id)]).map((file) => {
    const { data, content } = matter(fs.readFileSync(file, 'utf8'));
    const frontmatter = parseFrontmatter(
      schema,
      translated
        ? translatedData(path.dirname(file), path.basename(file), data)
        : data,
      file,
    );

    return {
      slug: path.basename(file, '.md'),
      title: headingTitle(content, file),
      frontmatter,
      cardImage: frontmatter.cardImage ?? firstImage(content),
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
