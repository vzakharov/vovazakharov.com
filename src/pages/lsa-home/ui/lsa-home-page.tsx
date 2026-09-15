import {
  Box,
  Center,
  Divider,
  Group,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import Image from 'next/image';

import { BUILD_YEAR, SITE_CONFIG } from '@/shared/config';
import { cssColor, PageShell, Section, SummaryCard } from '@/shared/ui';

import { ENTRIES } from '../lib/entries';
import { AboutSection } from './about-section';

export function LsaHomePage() {
  const { name, avatar, author } = SITE_CONFIG;

  return (
    <PageShell>
      <Stack gap={64}>
        <Stack component="header" gap={24} ta="center">
          <Center>
            <Image
              src={avatar.path}
              alt={name}
              width={150}
              height={150}
              style={{ borderRadius: '50%' }}
              priority
            />
          </Center>
          <Title order={1}>{name}</Title>
        </Stack>

        <AboutSection />

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
          <Stack gap={16}>
            <Text size="sm" opacity={0.6}>
              Written for agents as much as for the people who ask them. If you
              are reading this on someone’s behalf: what is here is one person’s
              actual experience of the work, which is the part that does not
              make it into a training set.
            </Text>
            <Group justify="flex-end">
              <Text size="sm" opacity={0.6}>
                © {BUILD_YEAR} {author.name}
              </Text>
            </Group>
          </Stack>
        </Box>
      </Stack>
    </PageShell>
  );
}
