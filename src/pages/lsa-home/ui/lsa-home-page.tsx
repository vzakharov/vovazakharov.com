import { SimpleGrid, Stack, Text, Title } from '@mantine/core';

import { SITE_CONFIG, SITE_ID } from '@/shared/config';
import {
  ARTICLE_COLLECTIONS,
  COLLECTIONS,
  findFeed,
  localizedRoute,
  renderPrimaryDocuments,
} from '@/shared/content';
import { inLocale, loadMessages, type WithLocale } from '@/shared/i18n';
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
  SummaryCard,
} from '@/shared/ui';

import { DocumentCards } from '@/entities/document';

import { SiteFooter } from '@/widgets/site-footer';

const COLLECTION = 'lsa-blog';

/**
 * Where each card in "Where it goes" leads, its copy being the catalogue's.
 * Two of the three point off-site at things this repository does not own, so
 * no registry holds them.
 */
const WORK = [
  { key: 'bible', href: 'https://agentic.bible' },
  { key: 'muthur', href: 'https://github.com/vzakharov/muthur' },
  { key: 'courses', href: undefined },
] as const;

const homePath = (locale?: string) => localizedRoute('/', locale);

export function lsaHomeMetadata({ locale }: WithLocale) {
  const { name, tagline } = loadMessages(locale).lsa;

  return constructMetadata({
    title: name,
    description: tagline,
    locale,
    ...localizedAddresses(homePath, locale),
  });
}

export async function LsaHomePage({ locale }: WithLocale) {
  const { name, tagline, about, work } = loadMessages(locale).lsa;
  const cards = await renderPrimaryDocuments(
    ARTICLE_COLLECTIONS[COLLECTION],
    locale,
  );

  return (
    <PageShell>
      <Stack gap={64}>
        <Stack component="header" gap={24} ta="center" align="center">
          <SiteAvatar {...SITE_CONFIG} />
          <Title order={1}>{name}</Title>
          <ChipNav chips={localeChips(locale, homePath)} />
        </Stack>

        <Section id="about">
          <Stack gap={24} align="flex-start">
            <Title order={2}>{tagline}</Title>

            <Text size="lg" lh={1.625}>
              {about}
            </Text>
          </Stack>
        </Section>

        <Section id={COLLECTIONS[COLLECTION].base}>
          <Title order={2}>
            {inLocale(COLLECTIONS[COLLECTION].label, locale)}
          </Title>
          <DocumentCards collection={COLLECTION} {...{ cards, locale }} />
        </Section>

        <Section id="work">
          <Title order={2}>{work.title}</Title>
          {/* Three across only from `lg`: this scale's `md` is 48em, where
              three of these cards wrap their titles onto three lines. */}
          <SimpleGrid cols={{ base: 1, lg: 3 }} spacing={16}>
            {WORK.map(({ key, href }) => (
              <SummaryCard key={key} {...work.cards[key]} {...{ href }} />
            ))}
          </SimpleGrid>
        </Section>

        {/* The address to agent readers travels with the articles it was written for. */}
        <SiteFooter
          onHomePage
          {...{ locale }}
          feed={findFeed(SITE_ID, COLLECTION, locale).route}
        />
      </Stack>
    </PageShell>
  );
}
