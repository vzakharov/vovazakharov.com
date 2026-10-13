import { Box, Text } from '@mantine/core';

import { loadMessages, type WithLocale } from '@/shared/i18n';
import { Section } from '@/shared/ui';

import { LaunchButtons } from './launch-buttons';

export function MusicSection({ locale }: WithLocale) {
  const { intro, shuffleAll, radio } = loadMessages(locale).music;

  return (
    <Section id="music" standalone>
      <Text size="lg" lh={1.625}>
        {intro}
      </Text>

      <Box>
        <LaunchButtons {...{ shuffleAll, radio }} />
      </Box>
    </Section>
  );
}
