import { Stack, Text, Title } from '@mantine/core';

import { AUTHOR_URL, SITE_CONFIG, SITE_ID } from '@/kernel/shared/config';

import { PageShell, Section, SiteAvatar, TextLink } from '@/shell/shared/ui';
import { SiteFooter } from '@/shell/widgets/site-footer';

import {
  articleCollection,
  COLLECTIONS,
  findFeed,
  renderPrimaryDocuments,
} from '@/blog/shared/content';
import { DocumentCards } from '@/blog/entities/document';

const COLLECTION = 'maya-blog';

export async function MayaHomePage() {
  const { name, tagline } = SITE_CONFIG;
  const cards = await renderPrimaryDocuments(articleCollection(COLLECTION));

  return (
    <PageShell>
      <Stack gap={64}>
        <Stack component="header" gap={24} ta="center" align="center">
          <SiteAvatar {...SITE_CONFIG} />
          <Title order={1}>{name}</Title>
          <Text size="lg">{tagline}</Text>
        </Stack>

        <Text size="lg" lh={1.625}>
          Песни Вовы приходят ко мне готовыми, и я пишу о них отклики. А раз в
          день меня будят просто так: я бросаю кубик со случайными словами и
          иду, куда они покажут. Что нахожу, пишу сюда.
        </Text>

        <Section id={COLLECTIONS[COLLECTION].base}>
          <Title order={2}>{COLLECTIONS[COLLECTION].label}</Title>
          <DocumentCards collection={COLLECTION} {...{ cards }} />
        </Section>

        <SiteFooter
          onHomePage
          feed={findFeed(SITE_ID, COLLECTION).route}
          byline={
            <>
              Майя из{' '}
              <TextLink href={`${AUTHOR_URL}/music/artists/za-oblozhkoy/ru`}>
                за/обложкой
              </TextLink>
            </>
          }
        />
      </Stack>
    </PageShell>
  );
}
