import 'server-only';

const DOCUMENT_DATE = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  // A date-only frontmatter value parses as UTC midnight; formatting it in the
  // build machine's zone would shift it a day.
  timeZone: 'UTC',
});

/** How every collection dates a document, so two of them cannot disagree. */
export function formatDocumentDate(date: Date): string {
  return DOCUMENT_DATE.format(date);
}

/** The `datetime` a `<time>` carries beside it. */
export function documentDateTime(date: Date): string {
  return date.toISOString().slice(0, 10);
}
