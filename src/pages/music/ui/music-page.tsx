import { Group, Stack } from '@mantine/core';

import { SITE_ID } from '@/shared/config';
import { findFeed } from '@/shared/content';
import { byLocale, type WithLocale } from '@/shared/i18n';
import { PageShell } from '@/shared/ui';

import { SiteFooter } from '@/widgets/site-footer';

import { musicPath } from '../lib/music-urls';
import { LocaleChips } from './locale-chips';
import { MusicSection } from './music-section';
import { SongList } from './song-list';

export function MusicPage({ locale }: WithLocale) {
  return (
    <PageShell>
      <Stack gap={48}>
        <Group component="nav" justify="flex-end">
          <LocaleChips hrefs={byLocale(musicPath)} {...{ locale }} />
        </Group>

        <MusicSection {...{ locale }} />

        <SongList {...{ locale }} />

        <SiteFooter
          {...{ locale }}
          feed={findFeed(SITE_ID, 'music', locale).route}
        />
      </Stack>
    </PageShell>
  );
}
