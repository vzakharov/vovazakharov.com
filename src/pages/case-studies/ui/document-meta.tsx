import { Group } from '@mantine/core';

import {
  type CaseStudyFrontmatter,
  documentDateTime,
  formatDocumentDate,
  type WithFrontmatter,
  type WithReadingMinutes,
} from '@/shared/content';
import { cx } from '@/shared/lib/class-names';
import type { WithOptionalClassName } from '@/shared/typings';

import classes from './case-studies.module.scss';

export type DocumentMetaProps = WithFrontmatter<CaseStudyFrontmatter> &
  WithReadingMinutes &
  WithOptionalClassName;

/** A document's byline — the same one on an index card and above the article. */
export function DocumentMeta({
  frontmatter,
  readingMinutes,
  className,
}: DocumentMetaProps) {
  return (
    <Group
      component="p"
      gap={12}
      wrap="wrap"
      fz="sm"
      opacity={0.7}
      className={cx(classes['meta'], className)}
    >
      <time dateTime={documentDateTime(frontmatter.date)}>
        {formatDocumentDate(frontmatter.date)}
      </time>
      <span aria-hidden>·</span>
      <span>{readingMinutes} min read</span>
      {frontmatter.part !== undefined && (
        <>
          <span aria-hidden>·</span>
          <span>Part {frontmatter.part}</span>
        </>
      )}
    </Group>
  );
}
