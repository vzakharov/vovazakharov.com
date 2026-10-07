import { Stack } from '@mantine/core';

import { PageShell } from '@/shared/ui';

import { SiteFooter } from '@/widgets/site-footer';

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
