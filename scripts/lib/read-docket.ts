/**
 * Every case file, parsed through the schema the site builds with. Reaching
 * `shared/content` needs the `react-server` condition the `content:og:<site>`
 * entries run under, which is what resolves `server-only` to its empty module.
 */

import matter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';

import { caseFrontmatterSchema } from '@/shared/content/basilisk-frontmatter';
import { collectionDir, isDocumentFile } from '@/shared/content/collections';

import { contentFiles } from './content-tree.ts';
import { caseTitle, type DocketCase } from './docket.ts';

export function readDocket(): DocketCase[] {
  return contentFiles(isDocumentFile, [collectionDir('basilisk-cases')]).map(
    (file) => {
      const { data, content } = matter(fs.readFileSync(file, 'utf8'));
      const frontmatter = caseFrontmatterSchema.safeParse(data);

      if (!frontmatter.success) {
        throw new Error(`Invalid frontmatter in ${file}`, {
          cause: frontmatter.error,
        });
      }

      return {
        slug: path.basename(file, '.md'),
        title: caseTitle(content, file),
        frontmatter: frontmatter.data,
      };
    },
  );
}
