import { Stack } from '@mantine/core';

import { BackToHome, PageShell } from '@/shared/ui';

import { MusicSection } from './music-section';

export function MusicPage() {
  return (
    <PageShell>
      <Stack gap={48}>
        <MusicSection />

        <BackToHome />
      </Stack>
    </PageShell>
  );
}
