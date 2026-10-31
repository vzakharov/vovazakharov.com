import type { WithLocale } from '@/kernel/shared/i18n';
import { routeCardPath } from '@/kernel/shared/seo';
import { localizedAddresses } from '@/kernel/shared/seo/index.server-only';

import { intrinsicDimensions, localizedRoute } from '@/blog/shared/content';
import { constructMetadata } from '@/blog/shared/seo';

import { messages, WHISPER_ROUTE } from '@/maya/entities/maya';

/** The toy's card, which `pnpm content:og maya` renders. */
const ogImage = routeCardPath(WHISPER_ROUTE);

/** The toy's address in `locale`, or its locale-less alias. */
export function whisperPath(locale?: string): string {
  return localizedRoute(WHISPER_ROUTE, locale);
}

export function whisperMetadata({ locale }: WithLocale) {
  const {
    title: siteTitle,
    whisper: { title, description },
  } = messages(locale);

  return constructMetadata({
    title: `${title} - ${siteTitle}`,
    description,
    locale,
    ...localizedAddresses(whisperPath, locale),
    ogImage,
    ogImageSize: intrinsicDimensions(ogImage),
  });
}
