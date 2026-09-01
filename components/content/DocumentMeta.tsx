import type { Frontmatter } from '@/lib/content/frontmatter';

const DATE_FORMAT = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  // The build machine's zone is nobody's business; a date-only frontmatter
  // value parses as UTC midnight and must format back as the same day.
  timeZone: 'UTC',
});

export interface DocumentMetaProps {
  frontmatter: Frontmatter;
  readingMinutes: number;
  className?: string;
}

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
      {frontmatter.part && (
        <>
          <span aria-hidden>·</span>
          <span>Part {frontmatter.part}</span>
        </>
      )}
    </p>
  );
}
