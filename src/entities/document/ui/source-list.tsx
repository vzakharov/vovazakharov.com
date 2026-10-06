import { formatDocumentDate, type Source } from '@/shared/content';
import {
  mentionsPrintRasterDomain,
  PRINT_RASTER_CLASS,
} from '@/shared/lib/print-raster';
import { TextLink } from '@/shared/ui';

import classes from './source-list.module.scss';

/** Absent where an article rests on nothing outside itself, and then nothing renders. */
type SourceListProps = { sources?: readonly Source[] };

/**
 * What an article rests on, after the body. It prints with the article, each
 * archived copy beside it for the day the original is gone. An entry citing
 * a domain in `PRINT_RASTER_DOMAINS` prints as an image, which carries no
 * link, so print adds a line sending the reader to the online version.
 */
export function SourceList({ sources }: SourceListProps) {
  if (sources === undefined) return null;

  return (
    <section className={classes['sources']} aria-labelledby="sources">
      <h2 id="sources" className={classes['heading']}>
        Sources
      </h2>
      <ol className={classes['list']}>
        {sources.map(({ title, outlet, author, date, url, archive }) => {
          const raster = [url, archive ?? '', outlet].some((text) =>
            mentionsPrintRasterDomain(text),
          );

          return (
            <li key={url}>
              <div className={raster ? PRINT_RASTER_CLASS : undefined}>
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
              </div>
              {raster && (
                // TODO: localize with `content-video.tsx`'s printed note.
                <div className="print-only">
                  <em>Links to this source open from the online version.</em>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
