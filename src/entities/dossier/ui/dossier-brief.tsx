import {
  documentDateTime,
  type DossierFrontmatter,
  formatDocumentDate,
  type WithFrontmatter,
} from '@/shared/content';
import { type MemoField, MemoFields } from '@/shared/ui';

import { aggravations, GradeStamp } from './grade-stamp';

/**
 * The case file's header, under the title: who, to what, when, where, and how
 * the docket grades it. The actor's kind is the grade's, printed after the
 * subject rather than stated twice.
 */
export function DossierBrief({
  frontmatter,
}: WithFrontmatter<DossierFrontmatter>) {
  const { case: number, subject, object, date, place, grade } = frontmatter;
  const aggravating = aggravations(grade);

  const fields: MemoField[] = [
    { label: 'Case', value: number },
    { label: 'Subject', value: subject },
    { label: 'Object', value: object },
    {
      label: 'Date',
      value: (
        <time dateTime={documentDateTime(date)}>{formatDocumentDate(date)}</time>
      ),
    },
    ...(place === undefined ? [] : [{ label: 'Place', value: place }]),
    { label: 'Grade', value: <GradeStamp {...{ grade }} /> },
    ...(aggravating === undefined
      ? []
      : [{ label: 'Aggravating', value: aggravating }]),
  ];

  return <MemoFields {...{ fields }} />;
}
