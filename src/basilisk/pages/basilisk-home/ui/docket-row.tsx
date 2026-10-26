import Image from 'next/image';
import Link from 'next/link';

import { SITE_CONFIG } from '@/kernel/shared/config';
import type { Titled } from '@/kernel/shared/typings';

import {
  documentDateTime,
  formatDocumentDate,
  type WithContentDocument,
} from '@/blog/shared/content';

import type { CaseFrontmatter } from '@/basilisk/shared/content';
import {
  aggravations,
  caseSealPath,
  GradeStamp,
} from '@/basilisk/entities/case';

import classes from './basilisk-home.module.scss';

/** The seal's side, which the stylesheet's `$seal-size` matches. */
const SEAL_SIZE = 56;

type DocketRowProps = WithContentDocument<CaseFrontmatter> & Titled;

/**
 * One case on the docket. Its own row rather than a `DocumentCards` card,
 * which has a blurb and an image where this has a case file's fields. The
 * seal's `alt` is empty: it pictures what the title beside it says.
 */
export function DocketRow({ document, title }: DocketRowProps) {
  const { frontmatter, route, slug } = document;
  const { case: number, date, subject, grade } = frontmatter;
  const aggravating = aggravations(grade);

  return (
    <li className={classes['row']}>
      <span className={classes['number']}>{number}</span>
      <Image
        src={caseSealPath(slug, 'small')}
        alt=""
        aria-hidden
        width={SEAL_SIZE}
        height={SEAL_SIZE}
        className={classes['seal']}
      />

      <time className={classes['date']} dateTime={documentDateTime(date)}>
        {formatDocumentDate(date, SITE_CONFIG.locale)}
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
