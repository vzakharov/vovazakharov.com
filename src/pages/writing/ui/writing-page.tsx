import { Stack } from '@mantine/core';

import { BackToHome, PageShell } from '@/shared/ui';

import { SiteFooter } from '@/widgets/site-footer';

import { WritingSection } from './writing-section';

export function WritingPage() {
  return (
    <PageShell>
      <Stack gap={48}>
        <WritingSection />

        <SiteFooter>
          <BackToHome />
        </SiteFooter>
      </Stack>
    </PageShell>
  );
}
