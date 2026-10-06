import { formatDocumentDate, type Source } from '@/shared/content';
import { mentionsPrintRasterDomain } from '@/shared/lib/print-raster';
import { TextLink } from '@/shared/ui';

import classes from './source-list.module.scss';

/** Absent where an article rests on nothing outside itself, and then nothing renders. */
type SourceListProps = { sources?: readonly Source[] };

/**
 * What an article rests on, after the body. It prints with the article, each
 * archived copy beside it for the day the original is gone. An entry citing
 * a domain in `PRINT_RASTER_DOMAINS` prints whole as an image.
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
          <li
            key={url}
            className={
              [url, archive ?? '', outlet].some((text) =>
                mentionsPrintRasterDomain(text),
              )
                ? 'print-raster'
                : undefined
            }
          >
            {author === undefined ? '' : `${author}, `}
            <TextLink href={url}>{title}</TextLink>
            {archive !== undefined && (
              <>
                {' '}
                (<TextLink href={archive}>archived</TextLink>)
              </>
            )}
            , {outlet},{' '}
            {typeof date === 'number' ? date : formatDocumentDate(date)}
          </li>
        ))}
      </ol>
    </section>
  );
}
