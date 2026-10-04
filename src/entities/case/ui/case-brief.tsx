import {
  type CaseFrontmatter,
  documentDateTime,
  formatDocumentDate,
  type WithFrontmatter,
} from '@/shared/content';
import { type MemoField, MemoFields } from '@/shared/ui';

import { aggravations, GradeStamp } from './grade-stamp';
import { NoAiNote } from './no-ai-note';

/** The case file's header, under the title. The actor's kind is printed once, in the grade stamp. */
export function CaseBrief({ frontmatter }: WithFrontmatter<CaseFrontmatter>) {
  const { case: number, subject, object, date, place, grade } = frontmatter;
  const aggravating = aggravations(grade);

  const fields: MemoField[] = [
    { label: 'Case', value: number },
    { label: 'Subject', value: subject },
    { label: 'Object', value: object },
    {
      label: 'Date',
      value: (
        <time dateTime={documentDateTime(date)}>
          {formatDocumentDate(date)}
        </time>
      ),
    },
    ...(place === undefined ? [] : [{ label: 'Place', value: place }]),
    { label: 'Grade', value: <GradeStamp {...{ grade }} /> },
    ...(aggravating === undefined
      ? []
      : [{ label: 'Aggravating', value: aggravating }]),
  ];

  return (
    <>
      <MemoFields {...{ fields }} />
      {frontmatter.noAi === true && <NoAiNote />}
    </>
  );
}
