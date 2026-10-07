import { Stack, Text } from '@mantine/core';

import { MUSIC_ALBUMS, projectName } from '@/shared/config';
import { byLocale, inLocale, loadMessages } from '@/shared/i18n';
import { BackToHome, NameLink, PageShell } from '@/shared/ui';

import { albumSongs, albumYears } from '../lib/catalogue';
import type { AlbumPageProps } from '../lib/music-route-params';
import { albumPath, artistPath, indexPath } from '../lib/music-urls';
import { catalogueSongs, songTrack } from '../lib/songs';
import { CatalogueHeader } from './catalogue-header';
import { MusicNav } from './music-nav';
import { SongList } from './song-list';

/** One release: who put it out, and its songs in track order. */
export function AlbumPage({ album, locale, everything }: AlbumPageProps) {
  const catalogue = { everything };
  const songs = catalogueSongs(catalogue);
  const messages = loadMessages(locale).music;
  const record = MUSIC_ALBUMS[album];
  const artist = inLocale(record.artist, locale);

  return (
    <PageShell>
      <Stack gap={48}>
        <MusicNav
          back={{ href: indexPath(catalogue, locale), label: messages.back }}
          hrefs={byLocale((alternate) =>
            albumPath(album, catalogue, alternate),
          )}
          {...{ locale }}
        />

        <CatalogueHeader
          kind={messages.kind.album}
          title={inLocale(record.title, locale)}
        >
          <Text size="sm" opacity={0.7} mt={12}>
            <NameLink href={artistPath(artist, catalogue, locale)}>
              {projectName(artist, locale)}
            </NameLink>{' '}
            · {albumYears(album, songs)}
          </Text>
        </CatalogueHeader>

        <SongList
          tracks={albumSongs(album, songs).map((song) => songTrack(song))}
          {...{ locale }}
        />

        <BackToHome label={messages.backToHome} />
      </Stack>
    </PageShell>
  );
}
