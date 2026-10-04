import { Anchor } from '@mantine/core';

import {
  type CaseFrontmatter,
  formatDocumentDate,
  type WithFrontmatter,
} from '@/shared/content';

import classes from './case.module.scss';

/**
 * What the case file rests on, after the body. Part of the record, so it
 * prints, each archived copy beside it for the day the original is gone.
 */
export function CaseSources({ frontmatter }: WithFrontmatter<CaseFrontmatter>) {
  return (
    <section className={classes['sources']} aria-labelledby="case-sources">
      <h2 id="case-sources" className={classes['sourcesHeading']}>
        Sources
      </h2>
      <ol className={classes['sourcesList']}>
        {frontmatter.sources.map(
          ({ title, outlet, author, date, url, archive }) => (
            <li key={url}>
              {author === undefined ? '' : `${author}, `}
              <Anchor href={url}>{title}</Anchor>, {outlet},{' '}
              {formatDocumentDate(date)}
              {archive !== undefined && (
                <>
                  {' '}
                  — <Anchor href={archive}>archived</Anchor>
                </>
              )}
            </li>
          ),
        )}
      </ol>
    </section>
  );
}
