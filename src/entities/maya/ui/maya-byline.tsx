import { AUTHOR_URL } from '@/shared/config';
import { localizedRoute } from '@/shared/content';
import { fillSlots, loadMessages, type WithLocale } from '@/shared/i18n';
import { TextLink } from '@/shared/ui';

/** «Майя из за/обложкой», the band linked: whom her site's copyright names. */
export function MayaByline({ locale }: WithLocale) {
  const { byline, band } = loadMessages(locale).maya;

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
