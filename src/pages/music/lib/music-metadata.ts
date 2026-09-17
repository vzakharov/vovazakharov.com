import { SITE_CONFIG } from '@/shared/config';
import { type Locale, loadMessages, LOCALES, routing } from '@/shared/i18n';
import { constructMetadata } from '@/shared/seo';

import { musicPath } from './music-urls';

/** The index, in one language, deferring to the addressed one as the CV's rungs do. */
export function generateMusicMetadata(locale: Locale) {
  const { metaTitle, metaDescription } = loadMessages(locale).music;

  return constructMetadata({
    title: `${metaTitle} - ${SITE_CONFIG.name}`,
    description: metaDescription,
    path: musicPath(locale),
    canonical: musicPath(locale),
    languages: {
      ...Object.fromEntries(
        LOCALES.map((alternate) => [alternate, musicPath(alternate)]),
      ),
      'x-default': musicPath(routing.defaultLocale),
    },
  });
}
