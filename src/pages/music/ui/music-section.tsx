import { Box, Text } from '@mantine/core';

import { loadMessages, type WithLocale } from '@/shared/i18n';
import { Section } from '@/shared/ui';

import { SizeLine } from './fact-line';
import { ShuffleAllButton } from './shuffle-all-button';

/** The section's intro, the whole catalogue's size under it, and the button that plays it all. */
export function MusicSection({
  locale,
  size,
}: WithLocale & { size: readonly string[] }) {
  const { intro, shuffleAll } = loadMessages(locale).music;

  return (
    <Section id="music" standalone>
      <Text size="lg" lh={1.625}>
        {intro}
      </Text>

      <SizeLine {...{ size }} mt={-8} />

      <Box>
        <ShuffleAllButton label={shuffleAll} />
      </Box>
    </Section>
  );
}
