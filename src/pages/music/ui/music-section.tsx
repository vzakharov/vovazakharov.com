import { Box, Text } from '@mantine/core';

import { loadMessages, type WithLocale } from '@/shared/i18n';
import { Section } from '@/shared/ui';

import { SizeLine } from './fact-line';
import { LaunchButtons } from './launch-buttons';

/** The section's intro, the whole catalogue's size under it, and the buttons that play it. */
export function MusicSection({
  locale,
  size,
}: WithLocale & { size: readonly string[] }) {
  const { intro, shuffleAll, radio } = loadMessages(locale).music;

  return (
    <Section id="music" standalone>
      <Text size="lg" lh={1.625}>
        {intro}
      </Text>

      <SizeLine {...{ size }} mt={-8} />

      <Box>
        <LaunchButtons {...{ shuffleAll, radio }} />
      </Box>
    </Section>
  );
}
