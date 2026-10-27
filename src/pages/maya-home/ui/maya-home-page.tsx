import { Stack, Text, Title } from '@mantine/core';

import {
  AUTHOR_URL,
  SITE_CONFIG,
  SITE_ID,
  WHISPER_DRAWING,
  WHISPER_ROUTE,
} from '@/shared/config';
import {
  ARTICLE_COLLECTIONS,
  COLLECTIONS,
  findFeed,
  intrinsicDimensions,
  localizedRoute,
  renderPrimaryDocuments,
} from '@/shared/content';
import {
  fillSlots,
  inLocale,
  loadMessages,
  type Locale,
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

import { SiteFooter } from '@/widgets/site-footer';

import { type Plate, Plates } from './plates';

const COLLECTION = 'maya-blog';

const homePath = (locale?: string) => localizedRoute('/', locale);

/** Every entry and toy is drawn, so a plate without its drawing fails the build. */
function drawn(src: string, owner: string): Plate['image'] {
  const size = intrinsicDimensions(src);

  if (size === undefined) {
    throw new Error(`${owner} has no readable drawing at ${src}.`);
  }

  return { src, ...size };
}

async function entryPlates(locale: Locale): Promise<Plate[]> {
  const cards = await renderPrimaryDocuments(
    ARTICLE_COLLECTIONS[COLLECTION],
    locale,
  );

  return cards.map(({ document, rendered: { title } }) => {
    const {
      route,
      frontmatter: { description, date },
      cardImage,
      fileName,
    } = document;

    if (cardImage === undefined) {
      throw new Error(`${fileName} has no drawing for its plate.`);
    }

    return { href: route, title, description, date, image: cardImage };
  });
}

function toyPlates(locale: Locale): Plate[] {
  const { title, description } = loadMessages(locale).whisper;

  return [
    {
      href: localizedRoute(WHISPER_ROUTE, locale),
      title,
      description,
      image: drawn(WHISPER_DRAWING, WHISPER_ROUTE),
    },
  ];
}

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
  const { name, tagline, intro, byline, band, plate, toys } =
    loadMessages(locale).maya;

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
          <Plates
            plates={await entryPlates(locale)}
            numbered={plate}
            {...{ locale }}
          />
        </Section>

        <Section id="toys">
          <Title order={2}>{toys}</Title>
          <Plates plates={toyPlates(locale)} {...{ locale }} />
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
