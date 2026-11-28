import { AUTHOR_URL } from '@/kernel/shared/config';
import { fillSlots, type WithLocale } from '@/kernel/shared/i18n';

import { TextLink } from '@/shell/shared/ui';

import { localizedRoute } from '@/blog/shared/content';

import { messages } from '../config/i18n';

/** «Майя из за/обложкой», the band linked: whom her site's copyright names. */
export function MayaByline({ locale }: WithLocale) {
  const { byline, band } = messages(locale);

  return fillSlots(byline, {
    band: (
      <TextLink
        href={localizedRoute(
          `${AUTHOR_URL}/music/artists/za-oblozhkoy`,
          locale,
        )}
      >
        {band}
      </TextLink>
    ),
  });
}
