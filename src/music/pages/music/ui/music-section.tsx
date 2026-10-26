import { Box, Text } from '@mantine/core';

import type { WithLocale } from '@/kernel/shared/i18n';

import { Section } from '@/shell/shared/ui';

import { messages } from '@/music/shared/i18n';
import { SizeLine } from '@/music/shared/ui';
import { LaunchButtons } from '@/music/features/player';

/** The section's intro, the whole catalogue's size under it, and the buttons that play it. */
export function MusicSection({
  locale,
  size,
}: WithLocale & { size: readonly string[] }) {
  const labels = messages(locale);

  return (
    <Section id="music" standalone>
      <Text size="lg" lh={1.625}>
        {labels.intro}
      </Text>

      <SizeLine {...{ size }} mt={-8} />

      <Box>
        <LaunchButtons {...{ labels }} />
      </Box>
    </Section>
  );
}
