import { Box, Stack, Text } from '@mantine/core';

import { MUSIC_ORGANIZATION, MUSIC_ORGANIZATION_URL } from '@/shared/config';
import { loadMessages, type WithLocale } from '@/shared/i18n';
import { Section, TextLink } from '@/shared/ui';

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
          <TextLink href="https://soundcloud.com/vzkrv" newTab>
            SoundCloud
          </TextLink>{' '}
          {and}{' '}
          <TextLink href="https://suno.com/@vova" newTab>
            Suno
          </TextLink>
        </Text>
        <Text size="sm" opacity={0.7}>
          {openSource}{' '}
          <TextLink href={MUSIC_ORGANIZATION_URL} newTab>
            github.com/{MUSIC_ORGANIZATION}
          </TextLink>
        </Text>
      </Stack>
    </Section>
  );
}
