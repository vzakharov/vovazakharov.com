import { SITE_CONFIG } from '@/shared/config';
import { loadMessages, type Locale } from '@/shared/i18n';
import {
  constructMetadata,
  localizedAddresses,
} from '@/shared/seo/index.server-only';

import { everythingPath, musicPath } from './music-urls';

/**
 * The index, in one language, deferring to the addressed one as the CV's rungs
 * do. The whole catalogue is kept out of search, as the hidden songs on it are.
 */
export function generateMusicMetadata(locale: Locale, everything = false) {
  const { metaTitle, metaDescription } = loadMessages(locale).music;
  const path = everything ? everythingPath : musicPath;

  return constructMetadata({
    title: `${metaTitle} - ${SITE_CONFIG.name}`,
    description: metaDescription,
    path: path(locale),
    ...localizedAddresses(path, locale),
    hidden: everything,
  });
}
