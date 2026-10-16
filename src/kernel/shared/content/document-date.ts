import 'server-only';

import { byLocale, type Locale } from '@/shared/i18n';

/** A date-only frontmatter value parses as UTC midnight; formatting it in the
 * build machine's zone would shift it a day. */
const UTC = { timeZone: 'UTC' } as const;

const DOCUMENT_DATE = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  ...UTC,
});

/**
 * Month and year, in the reader's language. What a song is dated to: the day a
 * recording carries is the day its project reached git, which is not the day
 * anything happened — where the author remembers the real one, he remembers a
 * month.
 */
const DOCUMENT_MONTH = byLocale(
  (locale) =>
    new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : locale, {
      month: 'long',
      year: 'numeric',
      ...UTC,
    }),
);

/** How every collection dates a document, so two of them cannot disagree. */
export function formatDocumentDate(date: Date): string {
  return DOCUMENT_DATE.format(date);
}

export function formatDocumentMonth(date: Date, locale: Locale): string {
  return DOCUMENT_MONTH[locale].format(date);
}

/** The `datetime` a `<time>` carries beside it. */
export function documentDateTime(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** The same, to the precision `formatDocumentMonth` shows. */
export function documentMonth(date: Date): string {
  return date.toISOString().slice(0, 7);
}
