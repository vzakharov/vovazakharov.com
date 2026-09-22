import { SITE_CONFIG } from '@/shared/config';
import { loadMessages, type Locale } from '@/shared/i18n';
import {
  constructMetadata,
  localizedAddresses,
} from '@/shared/seo/index.server-only';

import { musicPath } from './music-urls';

/** The index, in one language, deferring to the addressed one as the CV's rungs do. */
export function generateMusicMetadata(locale: Locale) {
  const { metaTitle, metaDescription } = loadMessages(locale).music;

  return constructMetadata({
    title: `${metaTitle} - ${SITE_CONFIG.name}`,
    description: metaDescription,
    path: musicPath(locale),
    ...localizedAddresses(musicPath, locale),
  });
}
