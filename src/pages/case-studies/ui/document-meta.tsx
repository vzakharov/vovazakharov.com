import type { WithFrontmatter, WithReadingMinutes } from '@/shared/content';
import type { WithOptionalClassName } from '@/shared/typings';

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
  className = '',
}: DocumentMetaProps) {
  return (
    <p
      className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-sm opacity-70 ${className}`}
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
    </p>
  );
}
