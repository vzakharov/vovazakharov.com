import 'server-only';

import { SITE_CONFIG } from '@/kernel/shared/config';
import type { Locale, WithLocale } from '@/kernel/shared/i18n';
import { localizedAddresses } from '@/kernel/shared/seo/index.server-only';

import { constructMetadata } from '@/blog/shared/seo';

import { pictureCard } from '@/music/shared/catalogue';
import { messages } from '@/music/shared/i18n';

/**
 * A catalogue page, in one language, deferring to the addressed one as the
 * CV's rungs do.
 */
export function catalogueMetadata(
  { locale }: WithLocale,
  title: string,
  ogTitle: string,
  description: string,
  path: (locale?: Locale) => string,
  picture?: string,
) {
  return constructMetadata({
    title: `${title} - ${SITE_CONFIG.name}`,
    ogTitle,
    description,
    path: path(locale),
    ...localizedAddresses(path, locale),
    ...pictureCard(picture),
  });
}

/** What a music page's unfurl is titled, naming what it plays. */
export function listenTitle(name: string, locale: Locale): string {
  return messages(locale).ogTitle.replace('{name}', name);
}
