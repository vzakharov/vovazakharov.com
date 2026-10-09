import { Box, Text } from '@mantine/core';

import { loadMessages, type WithLocale } from '@/shared/i18n';
import { Section } from '@/shared/ui';

import { ShuffleAllButton } from './shuffle-all-button';

export function MusicSection({ locale }: WithLocale) {
  const { intro, shuffleAll } = loadMessages(locale).music;

  return (
    <Section id="music" standalone>
      <Text size="lg" lh={1.625}>
        {intro}
      </Text>

      <Box>
        <ShuffleAllButton label={shuffleAll} />
      </Box>
    </Section>
  );
}
