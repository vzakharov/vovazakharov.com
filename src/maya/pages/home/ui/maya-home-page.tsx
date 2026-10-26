import { Stack, Text, Title } from '@mantine/core';

import { AUTHOR_URL, SITE_CONFIG, SITE_ID } from '@/kernel/shared/config';

import { PageShell, Section, SiteAvatar, TextLink } from '@/shell/shared/ui';
import { SiteFooter } from '@/shell/widgets/site-footer';

import {
  articleCollection,
  COLLECTIONS,
  findFeed,
  localizedRoute,
  renderPrimaryDocuments,
<<<<<<< HEAD:src/maya/pages/home/ui/maya-home-page.tsx
} from '@/blog/shared/content';
import { DocumentCards } from '@/blog/entities/document';

const COLLECTION = 'maya-blog';

export async function MayaHomePage() {
  const { name, tagline } = SITE_CONFIG;
  const cards = await renderPrimaryDocuments(articleCollection(COLLECTION));
=======
} from '@/shared/content';
import {
  fillSlots,
  inLocale,
  loadMessages,
  type WithLocale,
} from '@/shared/i18n';
import {
  constructMetadata,
  localizedAddresses,
} from '@/shared/seo/index.server-only';
import {
  ChipNav,
  localeChips,
  PageShell,
  Section,
  SiteAvatar,
  TextLink,
} from '@/shared/ui';

import { DocumentCards } from '@/entities/document';

import { SiteFooter } from '@/widgets/site-footer';

const COLLECTION = 'maya-blog';

const homePath = (locale?: string) => localizedRoute('/', locale);

export function mayaHomeMetadata({ locale }: WithLocale) {
  const { name, tagline } = loadMessages(locale).maya;

  return constructMetadata({
    title: name,
    description: tagline,
    locale,
    ...localizedAddresses(homePath, locale),
  });
}

export async function MayaHomePage({ locale }: WithLocale) {
  const { name, tagline, intro, byline, band } = loadMessages(locale).maya;
  const cards = await renderPrimaryDocuments(
    ARTICLE_COLLECTIONS[COLLECTION],
    locale,
  );
>>>>>>> origin/main:src/pages/maya-home/ui/maya-home-page.tsx

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
