import { intrinsicDimensions, localizedRoute } from '@/shared/content';
import { loadMessages, type WithLocale } from '@/shared/i18n';
import { routeCardPath } from '@/shared/seo';
import {
  constructMetadata,
  localizedAddresses,
} from '@/shared/seo/index.server-only';

import { WHISPER_ROUTE } from './whisper-copy';

/** Its card, `pnpm content:og:maya` renders at the route plus the card suffix. */
const ogImage = routeCardPath(WHISPER_ROUTE);

/** The toy's address in `locale`, or its locale-less alias. */
export function whisperPath(locale?: string): string {
  return localizedRoute(WHISPER_ROUTE, locale);
}

export function whisperMetadata({ locale }: WithLocale) {
  const { title, description } = loadMessages(locale).whisper;

  return constructMetadata({
    title: `${title} - ${loadMessages(locale).maya.name}`,
    description,
    locale,
    ...localizedAddresses(whisperPath, locale),
    ogImage,
    ogImageSize: intrinsicDimensions(ogImage),
  });
}
