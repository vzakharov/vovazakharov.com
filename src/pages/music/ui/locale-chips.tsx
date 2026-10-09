import { type Locale, LOCALES, type WithLocale } from '@/shared/i18n';
import { type Chip, ChipNav } from '@/shared/ui';

export type LocaleChipsProps = WithLocale & {
  /** Where this same page is served in each language. */
  hrefs: Record<Locale, string>;
};

/**
 * The switch between a page's two languages. A server component, unlike the
 * CV's: a music page's locale is a segment of its own route, so it is known
 * without asking the client which language it is in.
 */
export function LocaleChips({ locale, hrefs }: LocaleChipsProps) {
  const chips = LOCALES.map(
    (alternate): Chip => ({
      label: alternate.toUpperCase(),
      href: hrefs[alternate],
      hrefLang: alternate,
      current: alternate === locale,
    }),
  );

  return <ChipNav {...{ chips }} />;
}
