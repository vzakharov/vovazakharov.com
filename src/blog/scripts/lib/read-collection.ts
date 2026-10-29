/**
 * A collection's documents, parsed through the schema the site builds with.
 * A schema's module is `server-only`, so a caller runs under the
 * `react-server` condition, which resolves that to its empty module. Not
 * `listDocuments`: it resolves each document's card, so it throws before the
 * first render.
 */

import matter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';

import { asError } from '@/kernel/shared/lib/error-class';
import type { Titled } from '@/kernel/shared/typings';

import {
  type BaseFrontmatter,
  type Collection,
  firstImage,
  translatedData,
  type WithFrontmatter,
} from '@/blog/shared/content';
import {
  collectionDir,
  isDocumentFile,
  isTranslated,
  type Slugged,
  splitLocale,
  translationOf,
} from '@/blog/shared/content/index.node-safe';

import { contentFiles } from './content-tree.ts';
import { headingTitle } from './heading-title.ts';

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
  const translated = isTranslated(id);
  const isRead = (fileName: string) =>
    isDocumentFile(fileName) &&
    !(translated && translationOf(fileName) !== undefined);

  return contentFiles(isRead, [collectionDir(id)]).map((file) => {
    const { data, content } = matter(fs.readFileSync(file, 'utf8'));
    const frontmatter = parseFrontmatter(
      schema,
      translated
        ? translatedData(path.dirname(file), path.basename(file), data)
        : data,
      file,
    );

    const name = path.basename(file, '.md');

    return {
      slug: translated ? splitLocale(name).stem : name,
      title: headingTitle(content, file),
      frontmatter,
      cardImage: frontmatter.cardImage ?? firstImage(content),
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
      cause: asError(error),
    });
  }
}
