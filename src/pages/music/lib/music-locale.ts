import { DEFAULT_LOCALE, isLocale, type Locale } from '@/shared/i18n';

/**
 * Which language a music URL is in. The player bar is mounted by the layout,
 * which sits above the segment that names the language, so the address is the
 * only thing that can tell it — and the address always can, the locale being
 * the last segment of every song and index page.
 */
export function pathLocale(pathname: string): Locale {
  const last = pathname.split('/').filter(Boolean).at(-1) ?? '';

  return isLocale(last) ? last : DEFAULT_LOCALE;
}

/** The language a music page renders in, which its route names. */
export type WithLocale = { locale: Locale };
