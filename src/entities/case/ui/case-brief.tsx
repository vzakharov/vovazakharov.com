import Image from 'next/image';

import {
  type CaseFrontmatter,
  documentDateTime,
  formatDocumentDate,
  type Slugged,
  type WithFrontmatter,
} from '@/shared/content';
import { type MemoField, MemoFields } from '@/shared/ui';

import { caseSealPath } from '../lib/case-seal';
import classes from './case.module.scss';
import { aggravations, GradeStamp } from './grade-stamp';

/** The seal's intrinsic side; the stylesheet sets the size it shows at. */
const SEAL_SIZE = 176;

function dateValue(date: Date) {
  return (
    <time dateTime={documentDateTime(date)}>{formatDocumentDate(date)}</time>
  );
}

/**
 * The case file's header, under the title, with the case's seal beside it. The
 * actor's kind is printed once, in the grade stamp; the seal's `alt` is empty,
 * since it pictures what the title above it says.
 */
export function CaseBrief({
  frontmatter,
  slug,
}: WithFrontmatter<CaseFrontmatter> & Slugged) {
  const {
    case: number,
    subject,
    object,
    date,
    filed,
    place,
    grade,
  } = frontmatter;
  const aggravating = aggravations(grade);

  const fields: MemoField[] = [
    { label: 'Case', value: number },
    { label: 'Subject', value: subject },
    { label: 'Object', value: object },
    { label: 'Date', value: dateValue(date) },
    ...(place === undefined ? [] : [{ label: 'Place', value: place }]),
    { label: 'Filed', value: dateValue(filed) },
    { label: 'Grade', value: <GradeStamp {...{ grade }} /> },
    ...(aggravating === undefined
      ? []
      : [{ label: 'Aggravating', value: aggravating }]),
  ];

  return (
    <div className={classes['brief']}>
      <MemoFields {...{ fields }} />
      <Image
        src={caseSealPath(slug, 'lettered')}
        alt=""
        aria-hidden
        width={SEAL_SIZE}
        height={SEAL_SIZE}
        className={classes['seal']}
      />
    </div>
  );
}
