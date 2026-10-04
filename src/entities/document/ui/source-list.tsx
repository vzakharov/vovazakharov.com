import { Anchor } from '@mantine/core';

import { formatDocumentDate, type Source } from '@/shared/content';

import classes from './source-list.module.scss';

/** Absent where an article rests on nothing outside itself, and then nothing renders. */
type SourceListProps = { sources?: readonly Source[] };

/**
 * What an article rests on, after the body. It prints with the article, each
 * archived copy beside it for the day the original is gone.
 */
export function SourceList({ sources }: SourceListProps) {
  if (sources === undefined) return null;

  return (
    <section className={classes['sources']} aria-labelledby="sources">
      <h2 id="sources" className={classes['heading']}>
        Sources
      </h2>
      <ol className={classes['list']}>
        {sources.map(({ title, outlet, author, date, url, archive }) => (
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
        ))}
      </ol>
    </section>
  );
}
