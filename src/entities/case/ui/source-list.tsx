import { Anchor } from '@mantine/core';

import { formatDocumentDate, type Source } from '@/shared/content';

import classes from './case.module.scss';

/** Absent where an article rests on nothing outside itself, and then nothing renders. */
type SourceListProps = { sources?: readonly Source[] };

/**
 * What an article rests on, after the body. Part of the record, so it prints,
 * each archived copy beside it for the day the original is gone.
 */
export function SourceList({ sources }: SourceListProps) {
  if (sources === undefined) return null;

  return (
    <section className={classes['sources']} aria-labelledby="sources">
      <h2 id="sources" className={classes['sourcesHeading']}>
        Sources
      </h2>
      <ol className={classes['sourcesList']}>
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
