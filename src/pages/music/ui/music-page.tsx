import { Group, Stack } from '@mantine/core';

import { SITE_ID } from '@/shared/config';
import { findFeed } from '@/shared/content';
import { byLocale, loadMessages, type WithLocale } from '@/shared/i18n';
import { BackToHome, PageShell, TextLink } from '@/shared/ui';

import { musicPath } from '../lib/music-urls';
import { LocaleChips } from './locale-chips';
import { MusicSection } from './music-section';
import { SongList } from './song-list';

export function MusicPage({ locale }: WithLocale) {
  return (
    <PageShell>
      <Stack gap={48}>
        <Group component="nav" justify="flex-end">
          <TextLink href={findFeed(SITE_ID, 'music', locale).route} size="sm">
            RSS
          </TextLink>
          <LocaleChips hrefs={byLocale(musicPath)} {...{ locale }} />
        </Group>

        <MusicSection {...{ locale }} />

        <SongList {...{ locale }} />

        <BackToHome label={loadMessages(locale).music.backToHome} />
      </Stack>
    </PageShell>
  );
}
