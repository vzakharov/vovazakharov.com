import { Group } from '@mantine/core';

import type { WithFrontmatter, WithReadingMinutes } from '@/shared/content';
import { cx } from '@/shared/lib/class-names';
import type { WithOptionalClassName } from '@/shared/typings';

import classes from './case-studies.module.scss';

const DATE_FORMAT = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  // A date-only frontmatter value parses as UTC midnight; formatting it in the
  // build machine's zone would shift it a day.
  timeZone: 'UTC',
});

export type DocumentMetaProps = WithFrontmatter &
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
      <time dateTime={frontmatter.date.toISOString().slice(0, 10)}>
        {DATE_FORMAT.format(frontmatter.date)}
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
