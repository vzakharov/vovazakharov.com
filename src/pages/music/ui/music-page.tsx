import { Group, Stack } from '@mantine/core';

import { BackToHome, PageShell } from '@/shared/ui';

import { ThemeToggle } from '@/features/switch-theme';

import { MusicSection } from './music-section';

export function MusicPage() {
  return (
    <PageShell>
      <Stack gap={48}>
        <Group justify="flex-end">
          <ThemeToggle />
        </Group>

        <MusicSection />

        <BackToHome />
      </Stack>
    </PageShell>
  );
}
