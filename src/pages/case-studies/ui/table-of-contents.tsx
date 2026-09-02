import { Box } from '@mantine/core';

import type { WithHeadings } from '@/shared/content';

import classes from './case-studies.module.scss';

/**
 * The document's outline as plain anchors — no JavaScript, so it works without
 * hydration. `h1` is a part divider here, so `h2` entries indent under one.
 */
export function TableOfContents({ headings }: WithHeadings) {
  if (headings.length < 3) return null;

  return (
    <Box
      component="nav"
      aria-labelledby="table-of-contents"
      className={`print-hidden ${classes['toc']}`}
    >
      <h2 id="table-of-contents" className={classes['tocHeading']}>
        On this page
      </h2>
      <ol className={classes['tocList']}>
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={
              heading.depth === 1 ? classes['tocPart'] : classes['tocEntry']
            }
          >
            <a href={`#${heading.id}`} className={classes['tocLink']}>
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </Box>
  );
}
