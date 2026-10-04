/**
 * No `import 'server-only'`, unlike most of `shared/content/`: basilisk.fyi's
 * social card dates its last case under `tsx`, as the docket row dates it.
 */

/** A date-only frontmatter value parses as UTC midnight; formatting it in the
 * build machine's zone would shift it a day. */
export const UTC = { timeZone: 'UTC' } as const;

const DOCUMENT_DATE = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  ...UTC,
});

/** How every collection dates a document, so two of them cannot disagree. */
export function formatDocumentDate(date: Date): string {
  return DOCUMENT_DATE.format(date);
}
