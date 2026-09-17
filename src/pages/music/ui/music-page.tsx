import { Stack } from '@mantine/core';

import { loadMessages } from '@/shared/i18n';
import { BackToHome, PageShell } from '@/shared/ui';

import type { WithLocale } from '../lib/music-locale';
import { MusicSection } from './music-section';
import { SongList } from './song-list';

export function MusicPage({ locale }: WithLocale) {
  return (
    <PageShell>
      <Stack gap={48}>
        <MusicSection {...{ locale }} />

        <SongList {...{ locale }} />

        <BackToHome label={loadMessages(locale).music.backToHome} />
      </Stack>
    </PageShell>
  );
}
