import { WHISPER_ROUTE } from '@/shared/config';
import { intrinsicDimensions, localizedRoute } from '@/shared/content';
import { loadMessages, type WithLocale } from '@/shared/i18n';
import { routeCardPath } from '@/shared/seo';
import {
  constructMetadata,
  localizedAddresses,
} from '@/shared/seo/index.server-only';

/** The toy's card, which `pnpm content:og:maya` renders. */
const ogImage = routeCardPath(WHISPER_ROUTE);

/** The toy's address in `locale`, or its locale-less alias. */
export function whisperPath(locale?: string): string {
  return localizedRoute(WHISPER_ROUTE, locale);
}

export function whisperMetadata({ locale }: WithLocale) {
  const { title, description } = loadMessages(locale).whisper;

  return constructMetadata({
    title: `${title} - ${loadMessages(locale).maya.title}`,
    description,
    locale,
    ...localizedAddresses(whisperPath, locale),
    ogImage,
    ogImageSize: intrinsicDimensions(ogImage),
  });
}
