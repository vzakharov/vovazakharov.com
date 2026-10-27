import { Stack, Text, Title } from '@mantine/core';

import { AUTHOR_URL, SITE_CONFIG, SITE_ID } from '@/kernel/shared/config';
import { fillSlots, inLocale, type WithLocale } from '@/kernel/shared/i18n';
import { localizedAddresses } from '@/kernel/shared/seo/index.server-only';

import {
  ChipNav,
  localeChips,
  PageShell,
  Section,
  SiteAvatar,
  TextLink,
} from '@/shell/shared/ui';
import { SiteFooter } from '@/shell/widgets/site-footer';

import {
  articleCollection,
  COLLECTIONS,
  findFeed,
  localizedRoute,
  renderPrimaryDocuments,
} from '@/blog/shared/content';
import { messages as blogMessages } from '@/blog/shared/i18n';
import { constructMetadata } from '@/blog/shared/seo';
import { DocumentCards } from '@/blog/entities/document';

import { homeMessages } from '../i18n';

const COLLECTION = 'maya-blog';

const homePath = (locale?: string) => localizedRoute('/', locale);

export function mayaHomeMetadata({ locale }: WithLocale) {
  const { tagline } = homeMessages(locale);

  return constructMetadata({
    title: blogMessages(locale).authors.maya,
    description: tagline,
    locale,
    ...localizedAddresses(homePath, locale),
  });
}

export async function MayaHomePage({ locale }: WithLocale) {
  const name = blogMessages(locale).authors.maya;
  const { tagline, intro, byline, band } = homeMessages(locale);
  const cards = await renderPrimaryDocuments(
    articleCollection(COLLECTION),
    locale,
  );

  return (
    <PageShell>
      <Stack gap={64}>
        <Stack component="header" gap={24} ta="center" align="center">
          <SiteAvatar {...SITE_CONFIG} />
          <Title order={1}>{name}</Title>
          <Text size="lg">{tagline}</Text>
          <ChipNav chips={localeChips(locale, homePath)} />
        </Stack>

        <Text size="lg" lh={1.625}>
          {intro}
        </Text>

        <Section id={COLLECTIONS[COLLECTION].base}>
          <Title order={2}>
            {inLocale(COLLECTIONS[COLLECTION].label, locale)}
          </Title>
          <DocumentCards collection={COLLECTION} {...{ cards, locale }} />
        </Section>

        <SiteFooter
          onHomePage
          {...{ locale }}
          feed={findFeed(SITE_ID, COLLECTION, locale).route}
          byline={fillSlots(byline, {
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
          })}
        />
      </Stack>
    </PageShell>
  );
}
