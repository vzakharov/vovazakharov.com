import { Group, Stack } from '@mantine/core';

import { BackToHome, PageShell } from '@/shared/ui';

import { ThemeToggle } from '@/features/switch-theme';

import { WritingSection } from './writing-section';

export function WritingPage() {
  return (
    <PageShell>
      <Stack gap={48}>
        <Group justify="flex-end">
          <ThemeToggle />
        </Group>

        <WritingSection />

        <BackToHome />
      </Stack>
    </PageShell>
  );
}
