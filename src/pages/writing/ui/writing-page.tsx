import { Stack } from '@mantine/core';

import { BackToHome, PageShell } from '@/shared/ui';

import { WritingSection } from './writing-section';

export function WritingPage() {
  return (
    <PageShell>
      <Stack gap={48}>
        <WritingSection />

        <BackToHome />
      </Stack>
    </PageShell>
  );
}
