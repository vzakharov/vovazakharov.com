/**
 * No `import 'server-only'`: `src/blog/scripts/lib/read-collection.ts` reads it too, so
 * a post's social card shows the image its index card does.
 */

import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { EXIT, visit } from 'unist-util-visit';

import { isRelative } from './collections';

/**
 * The first image a markdown body shows that the collection itself serves —
 * what stands for a document on a list of them when its frontmatter names no
 * `cardImage`. An image off-site is passed over, the card reading its size
 * from the file.
 */
export function firstImage(body: string): string | undefined {
  let found: string | undefined;

  visit(unified().use(remarkParse).parse(body), 'image', ({ url }) => {
    if (!isRelative(url)) return;

    found = url;

    return EXIT;
  });

  return found;
}
