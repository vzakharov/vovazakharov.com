import Link from 'next/link';

import {
  documentDateTime,
  type DossierFrontmatter,
  formatDocumentDate,
  type WithContentDocument,
} from '@/shared/content';
import type { Titled } from '@/shared/typings';

import { aggravations, GradeStamp } from '@/entities/dossier';

import classes from './basilisk-home.module.scss';

type DocketRowProps = WithContentDocument<DossierFrontmatter> & Titled;

/**
 * One case on the docket. Its own row rather than a `DocumentCards` card,
 * which has a blurb and an image where this has a case file's fields.
 */
export function DocketRow({ document, title }: DocketRowProps) {
  const { frontmatter, route } = document;
  const { case: number, date, subject, grade } = frontmatter;
  const aggravating = aggravations(grade);

  return (
    <li className={classes['row']}>
      <span className={classes['number']}>{number}</span>
      <time className={classes['date']} dateTime={documentDateTime(date)}>
        {formatDocumentDate(date)}
      </time>
      <span className={classes['subject']}>{subject}</span>
      <Link href={route} className={classes['title']}>
        {title}
      </Link>
      <span className={classes['grade']}>
        <GradeStamp {...{ grade }} />
        {aggravating !== undefined && ` · ${aggravating}`}
      </span>
    </li>
  );
}
