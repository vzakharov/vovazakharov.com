import { preload } from 'react-dom';

import type { WithLocale } from '@/shared/i18n';

/**
 * The font files every page in a language uses beyond the Latin ones, which
 * the root layout preloads everywhere. `pnpm check:font-preloads` holds each
 * list to what the built pages actually use.
 */
const LOCALE_FONTS: Record<WithLocale['locale'], string[]> = {
  en: [],
  ru: [
    new URL('fonts/merriweather-cyrillic-400-normal.woff2', import.meta.url)
      .href,
    new URL('fonts/merriweather-cyrillic-700-normal.woff2', import.meta.url)
      .href,
  ],
};

/**
 * Starts the page's own-language font files downloading with the HTML, rather
 * than once the stylesheet shows the browser text that needs them. Every page
 * rendered in a locale carries one.
 */
export function LocaleFonts({ locale }: WithLocale) {
  for (const href of LOCALE_FONTS[locale]) {
    preload(href, { as: 'font', type: 'font/woff2', crossOrigin: 'anonymous' });
  }

  return null;
}
