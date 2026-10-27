import { Stack, Text, Title } from '@mantine/core';

import { AUTHOR_URL, SITE_ID } from '@/kernel/shared/config';
import {
  fillSlots,
  inLocale,
  type Locale,
  type WithLocale,
} from '@/kernel/shared/i18n';
import { localizedAddresses } from '@/kernel/shared/seo/index.server-only';

import {
  ChipNav,
  localeChips,
  PageShell,
  Section,
  TextLink,
} from '@/shell/shared/ui';
import { SiteFooter } from '@/shell/widgets/site-footer';

import {
  articleCollection,
  COLLECTIONS,
  findFeed,
  intrinsicDimensions,
  localizedRoute,
  renderPrimaryDocuments,
} from '@/blog/shared/content';
import { messages as blogMessages } from '@/blog/shared/i18n';
import { constructMetadata } from '@/blog/shared/seo';

import { WHISPER_DRAWING, WHISPER_ROUTE } from '@/maya/shared/config';
import { messages as mayaMessages } from '@/maya/shared/i18n';
import { MayaByline, plateNumber } from '@/maya/entities/maya';

import { messages } from '../i18n';
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
    articleCollection(COLLECTION),
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
  const { title, description } = mayaMessages(locale).whisper;

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
  const { tagline } = messages(locale);
  const { title } = mayaMessages(locale);

  return constructMetadata({
    title,
    description: tagline,
    locale,
    ...localizedAddresses(homePath, locale),
  });
}

export async function MayaHomePage({ locale }: WithLocale) {
  const name = blogMessages(locale).authors.maya;
  const { title } = mayaMessages(locale);
  const { subtitle, tagline, intro, toys, frontispiece, portraitAlbum } =
    messages(locale);

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
