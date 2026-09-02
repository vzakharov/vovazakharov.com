import {
  Anchor,
  Box,
  Center,
  Container,
  Divider,
  Group,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import Image from 'next/image';

import { cssColor, InternalLink } from '@/shared/ui';

import { ThemeToggle } from '@/features/switch-theme';

import { ContactSection } from './contact-section';
import { DevSection } from './dev-section';
import { MusicSection } from './music-section';
import { WritingSection } from './writing-section';

// A static export evaluates this at build time, so the footer year is the
// year the site was last deployed.
const BUILD_YEAR = new Date().getFullYear();

export function HomePage() {
  return (
    <Box mih="100vh" p={{ base: 32, sm: 80 }} pb={80}>
      <Container size={896} px={0}>
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

          <Box component="nav">
            <Group justify="center" gap={24}>
              <Text size="lg" component="span">
                <Anchor href="#dev" underline="hover" inherit>
                  dev
                </Anchor>
                &nbsp;(
                <InternalLink href="/cv" underline="hover" inherit>
                  cv
                </InternalLink>
                )
              </Text>
              <Anchor href="#music" size="lg" underline="hover">
                music
              </Anchor>
              <Anchor href="#writing" size="lg" underline="hover">
                writing
              </Anchor>
              <Anchor href="#contact" size="lg" underline="hover">
                contact
              </Anchor>
            </Group>
          </Box>

          <DevSection />
          <MusicSection />
          <WritingSection />
          <ContactSection />

          <Box component="footer" ta="center">
            <Divider mb={32} color={cssColor('border-hairline')} />
            <Text size="sm" opacity={0.6}>
              © {BUILD_YEAR} Vova Zakharov. Built with Next.js.
            </Text>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
