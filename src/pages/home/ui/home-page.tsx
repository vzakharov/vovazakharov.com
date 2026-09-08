import { Box, Center, Divider, Group, Stack, Text, Title } from '@mantine/core';
import Image from 'next/image';

import { BUILD_YEAR, PAGE_ROUTES } from '@/shared/config';
import { cssColor, InternalLink, PageShell } from '@/shared/ui';

import { ThemeToggle } from '@/features/switch-theme';

import { ContactSection } from './contact-section';
import { DevSection } from './dev-section';

/** The nouns the hero claims that this page no longer carries a section for. */
const SEE_ALSO = [
  { href: PAGE_ROUTES.writing, label: 'writing' },
  { href: PAGE_ROUTES.music, label: 'music' },
];

export function HomePage() {
  return (
    <PageShell>
      <Stack gap={64}>
        <Group justify="flex-end">
          <ThemeToggle />
        </Group>

        <Box component="section">
          <Stack gap={24} ta="center">
            <Center>
              <Image
                src="/ava.png"
                alt="Vova Zakharov"
                width={150}
                height={150}
                style={{ borderRadius: '50%' }}
                priority
              />
            </Center>
            <Box>
              <Title order={1} mb={12}>
                Vova Zakharov
              </Title>
              <Text
                fz={{ base: 20, sm: 24 }}
                lh={{ base: '28px', sm: '32px' }}
                opacity={0.8}
              >
                Developer, AI tinkerer, word shaker, generative metalhead
              </Text>
              <Text mt={16} opacity={0.7}>
                Helping our future overlords walk since 2020
              </Text>
            </Box>
          </Stack>
        </Box>

        <DevSection />
        <ContactSection />

        <Box component="footer" ta="center">
          <Divider mb={32} color={cssColor('border-hairline')} />
          <Stack gap={8}>
            <Text size="sm" opacity={0.6}>
              See also:{' '}
              {SEE_ALSO.map(({ href, label }, index) => (
                <span key={href}>
                  {index > 0 && ' · '}
                  <InternalLink {...{ href }} inherit>
                    {label}
                  </InternalLink>
                </span>
              ))}
            </Text>
            <Text size="sm" opacity={0.6}>
              © {BUILD_YEAR} Vova Zakharov
            </Text>
          </Stack>
        </Box>
      </Stack>
    </PageShell>
  );
}
