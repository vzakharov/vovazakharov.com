import { Anchor } from '@mantine/core';

import {
  type DossierFrontmatter,
  formatDocumentDate,
  type WithFrontmatter,
} from '@/shared/content';

import classes from './dossier.module.scss';

/**
 * What the case file rests on, after the body. Every fact in a dossier comes
 * from one of these, so the list is part of the record rather than a footnote
 * to it — and it prints, the archived copy beside each, for the day the
 * original is gone.
 */
export function DossierSources({
  frontmatter,
}: WithFrontmatter<DossierFrontmatter>) {
  return (
    <section className={classes['sources']} aria-labelledby="dossier-sources">
      <h2 id="dossier-sources" className={classes['sourcesHeading']}>
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
