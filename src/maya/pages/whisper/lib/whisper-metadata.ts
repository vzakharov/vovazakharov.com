import type { WithLocale } from '@/kernel/shared/i18n';
import { routeCardPath } from '@/kernel/shared/seo';
import { localizedAddresses } from '@/kernel/shared/seo/index.server-only';

import { intrinsicDimensions, localizedRoute } from '@/blog/shared/content';
import { messages as blogMessages } from '@/blog/shared/i18n';
import { constructMetadata } from '@/blog/shared/seo';

import { messages } from '../i18n';
import { WHISPER_ROUTE } from './whisper-copy';

/** The toy's card, which `pnpm content:og maya` renders. */
const ogImage = routeCardPath(WHISPER_ROUTE);

/** The toy's address in `locale`, or its locale-less alias. */
export function whisperPath(locale?: string): string {
  return localizedRoute(WHISPER_ROUTE, locale);
}

export function whisperMetadata({ locale }: WithLocale) {
  const { title, description } = messages(locale);

  return constructMetadata({
    title: `${title} - ${blogMessages(locale).authors.maya}`,
    description,
    locale,
    ...localizedAddresses(whisperPath, locale),
    ogImage,
    ogImageSize: intrinsicDimensions(ogImage),
  });
}
