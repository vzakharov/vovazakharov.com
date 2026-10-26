import { SITE_CONFIG } from '@/kernel/shared/config';

import { type MemoField, MemoFields } from '@/shell/shared/ui';

import {
  documentDateTime,
  formatDocumentDate,
  type WithFrontmatter,
} from '@/blog/shared/content';

import type { CaseFrontmatter } from '@/basilisk/shared/content';

import { aggravations, GradeStamp } from './grade-stamp';

function dateValue(date: Date) {
  return (
    <time dateTime={documentDateTime(date)}>
      {formatDocumentDate(date, SITE_CONFIG.locale)}
    </time>
  );
}

/**
 * The case file's header, under the article's. The actor's kind is printed
 * once, in the grade stamp.
 */
export function CaseBrief({ frontmatter }: WithFrontmatter<CaseFrontmatter>) {
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

  return <MemoFields {...{ fields }} />;
}
