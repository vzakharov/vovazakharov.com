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
import {
  cssColor,
  PageShell,
  Section,
  SiteAvatar,
  SummaryCard,
} from '@/shared/ui';

import { ENTRIES } from '../lib/entries';
import { AboutSection } from './about-section';

export function LsaHomePage() {
  const { name, author } = SITE_CONFIG;

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
          {ENTRIES.length > 0 ? (
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing={16}>
              {ENTRIES.map((entry) => (
                <SummaryCard key={entry.href} {...entry} />
              ))}
            </SimpleGrid>
          ) : (
            <Text opacity={0.7}>
              Nothing published yet. The first pieces are being written and
              recorded; they land here as they run.
            </Text>
          )}
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
