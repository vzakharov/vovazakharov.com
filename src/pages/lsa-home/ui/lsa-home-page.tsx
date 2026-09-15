import {
  Box,
  Divider,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';

import { BUILD_YEAR, SITE_CONFIG } from '@/shared/config';
import { cssColor, PageShell, Section, SummaryCard } from '@/shared/ui';

import { ENTRIES } from '../lib/entries';

export function LsaHomePage() {
  return (
    <PageShell>
      <Stack gap={64}>
        <Stack component="header" gap={24} ta="center">
          <Title order={1}>{SITE_CONFIG.name}</Title>
          <Text opacity={0.7}>{SITE_CONFIG.tagline}</Text>
        </Stack>

        <Section id="writing">
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
          <Group justify="flex-end">
            <Text size="sm" opacity={0.6}>
              © {BUILD_YEAR} {SITE_CONFIG.author.name}
            </Text>
          </Group>
        </Box>
      </Stack>
    </PageShell>
  );
}
