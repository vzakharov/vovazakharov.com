import 'server-only';

import { byLocale, type Locale } from '@/shared/i18n';

import { UTC } from './document-date-format';

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
