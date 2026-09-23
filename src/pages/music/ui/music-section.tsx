import { Anchor, Box, Stack, Text } from '@mantine/core';

import { MUSIC_ORGANIZATION, MUSIC_ORGANIZATION_URL } from '@/shared/config';
import { loadMessages, type WithLocale } from '@/shared/i18n';
import { Section } from '@/shared/ui';

export function MusicSection({ locale }: WithLocale) {
  const { intro, alsoOn, and, openSource } = loadMessages(locale).music;

  return (
    <Section id="music" standalone>
      <Box>
        <Text size="lg" lh={1.625} fs="italic" mb={16}>
          {intro.quote}
        </Text>
        <Text size="lg" lh={1.625}>
          {intro.body}
        </Text>
      </Box>

      <Stack gap={8}>
        <Text size="sm" opacity={0.7}>
          {alsoOn}{' '}
          <Anchor
            href="https://soundcloud.com/vzkrv"
            target="_blank"
            rel="noopener noreferrer"
            inherit
          >
            SoundCloud
          </Anchor>{' '}
          {and}{' '}
          <Anchor
            href="https://suno.com/@vova"
            target="_blank"
            rel="noopener noreferrer"
            inherit
          >
            Suno
          </Anchor>
        </Text>
        <Text size="sm" opacity={0.7}>
          {openSource}{' '}
          <Anchor
            href={MUSIC_ORGANIZATION_URL}
            target="_blank"
            rel="noopener noreferrer"
            inherit
          >
            github.com/{MUSIC_ORGANIZATION}
          </Anchor>
        </Text>
      </Stack>
    </Section>
  );
}
