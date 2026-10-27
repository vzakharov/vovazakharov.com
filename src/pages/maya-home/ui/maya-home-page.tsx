import { Stack, Text, Title } from '@mantine/core';

import {
  AUTHOR_URL,
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
  TextLink,
} from '@/shared/ui';

import { MayaByline, plateNumber } from '@/entities/maya';

import { SiteFooter } from '@/widgets/site-footer';

import { Frontispiece } from './frontispiece';
import { type Plate, Plates } from './plates';
import { Shelf } from './shelf';

const COLLECTION = 'maya-blog';

/** The album whose cover her portrait is cut from. */
const PORTRAIT_ALBUM = 'wings';

const homePath = (locale?: string) => localizedRoute('/', locale);

/** A toy is drawn, as every entry is, so one without its drawing fails the build. */
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
      slug,
      frontmatter: { description, date },
      cardImage,
      fileName,
    } = document;

    if (cardImage === undefined) {
      throw new Error(`${fileName} has no drawing for its plate.`);
    }

    return {
      href: route,
      title,
      description,
      date,
      number: plateNumber(slug, locale),
      image: cardImage,
    };
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
  const { title, tagline } = loadMessages(locale).maya;

  return constructMetadata({
    title,
    description: tagline,
    locale,
    ...localizedAddresses(homePath, locale),
  });
}

export async function MayaHomePage({ locale }: WithLocale) {
  const {
    name,
    title,
    subtitle,
    tagline,
    intro,
    toys,
    frontispiece,
    portraitAlbum,
  } = loadMessages(locale).maya;

  return (
    <PageShell>
      <Stack gap={64}>
        <Frontispiece
          {...{ name, title, subtitle, tagline }}
          caption={fillSlots(frontispiece, {
            album: (
              <TextLink
                href={localizedRoute(
                  `${AUTHOR_URL}/music/albums/${PORTRAIT_ALBUM}`,
                  locale,
                )}
              >
                {portraitAlbum}
              </TextLink>
            ),
          })}
        >
          <Text size="lg" lh={1.625}>
            {intro}
          </Text>
          <ChipNav chips={localeChips(locale, homePath)} />
        </Frontispiece>

        {/* Toys first: they are few and stay, where entries keep coming. */}
        <Section id="toys">
          <Shelf label={toys} toys={toyPlates(locale)} />
        </Section>

        <Section id={COLLECTIONS[COLLECTION].base}>
          <Title order={2}>
            {inLocale(COLLECTIONS[COLLECTION].label, locale)}
          </Title>
          <Plates plates={await entryPlates(locale)} {...{ locale }} />
        </Section>

        <SiteFooter
          onHomePage
          {...{ locale }}
          feed={findFeed(SITE_ID, COLLECTION, locale).route}
          byline={<MayaByline {...{ locale }} />}
        />
      </Stack>
    </PageShell>
  );
}
