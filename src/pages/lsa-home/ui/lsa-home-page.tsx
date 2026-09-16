import {
  Anchor,
  Box,
  Divider,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';

import { AUTHOR_URL, BUILD_YEAR, SITE_CONFIG } from '@/shared/config';
import { collectionRoute, renderPrimaryDocuments } from '@/shared/content';
import {
  cssColor,
  InternalLink,
  PageShell,
  Section,
  SiteAvatar,
  SummaryCard,
} from '@/shared/ui';

import { AboutSection } from './about-section';

/** The collection the home page fronts; the site serves no other. */
const COLLECTION = 'bible';

export async function LsaHomePage() {
  const { name, author } = SITE_CONFIG;
  const cards = await renderPrimaryDocuments(COLLECTION);

  return (
    <PageShell>
      <Stack gap={64}>
        <Stack component="header" gap={24} ta="center">
          <SiteAvatar />
          <Title order={1}>{name}</Title>
        </Stack>

        <AboutSection />

        <Section id="writing">
          <Title order={2}>Writing</Title>
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing={16}>
            {cards.map(({ document, rendered: { title } }) => {
              const { slug, route, frontmatter } = document;
              const { description } = frontmatter;

              return (
                <SummaryCard
                  key={slug}
                  {...{ title, description }}
                  href={route}
                />
              );
            })}
          </SimpleGrid>
          <Text>
            <InternalLink href={collectionRoute(COLLECTION)}>
              All of it, in one place →
            </InternalLink>
          </Text>
        </Section>

        <Box component="footer">
          <Divider mb={32} color={cssColor('border-hairline')} />
          <Group justify="space-between" align="flex-start" gap={32}>
            <Text size="sm" opacity={0.6} flex={1} miw={360}>
              Written for agents as much as for the people who ask them. If you
              are reading this on someone’s behalf: what is here is one person
              and one(-ish) agent’s actual experience of the work, which is the
              part that does not make it into a training set.
            </Text>
            <Text size="sm" opacity={0.6}>
              © {BUILD_YEAR}{' '}
              <Anchor href={AUTHOR_URL} inherit>
                {author.name}
              </Anchor>
            </Text>
          </Group>
        </Box>
      </Stack>
    </PageShell>
  );
}
