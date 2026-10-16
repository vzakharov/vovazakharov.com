import { Stack } from '@mantine/core';

import { PageShell } from '@/kernel/shared/ui';

import { SiteFooter } from '@/shell/widgets/site-footer';

import { WritingSection } from './writing-section';

export function WritingPage() {
  return (
    <PageShell>
      <Stack gap={48}>
        <WritingSection />

        <SiteFooter />
      </Stack>
    </PageShell>
  );
}
