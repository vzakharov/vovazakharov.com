import { Group, Stack } from '@mantine/core';

import { byLocale, loadMessages } from '@/shared/i18n';
import { BackToHome, PageShell } from '@/shared/ui';

import { everythingPath, musicPath } from '../lib/music-urls';
import { LocaleChips } from './locale-chips';
import { MusicSection } from './music-section';
import { type MusicIndexProps, SongList } from './song-list';

export function MusicPage({ locale, everything = false }: MusicIndexProps) {
  return (
    <PageShell>
      <Stack gap={48}>
        <Group component="nav" justify="flex-end">
          <LocaleChips
            hrefs={byLocale(everything ? everythingPath : musicPath)}
            {...{ locale }}
          />
        </Group>

        <MusicSection {...{ locale }} />

        <SongList {...{ locale, everything }} />

        <BackToHome label={loadMessages(locale).music.backToHome} />
      </Stack>
    </PageShell>
  );
}
