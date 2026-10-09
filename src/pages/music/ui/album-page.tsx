import { Stack, Text } from '@mantine/core';

import { byLocale, loadMessages } from '@/shared/i18n';
import { pick } from '@/shared/lib/collections';
import { BackToHome, NameLink, PageShell } from '@/shared/ui';

import { albumArtist, albumGloss, albumTitle } from '../lib/albums';
import { albumSongs, albumYears } from '../lib/catalogue';
import { albumLength } from '../lib/duration';
import type { AlbumPageProps } from '../lib/music-route-params';
import { albumPath, artistPath, indexPath } from '../lib/music-urls';
import { projectName } from '../lib/projects';
import { catalogueSongs, songTrack } from '../lib/songs';
import { CatalogueHeader } from './catalogue-header';
import { MusicNav } from './music-nav';
import { SongList } from './song-list';

/** One release: who put it out, and its songs in track order. */
export function AlbumPage({ album, locale, everything }: AlbumPageProps) {
  const catalogue = { everything };
  const songs = catalogueSongs(catalogue);
  const messages = loadMessages(locale).music;
  const artist = albumArtist(album, locale);
  const tracks = albumSongs(album, songs);

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
          title={albumTitle(album, locale)}
          gloss={albumGloss(album, locale)}
        >
          <Text size="sm" opacity={0.7} mt={12}>
            <NameLink href={artistPath(artist, catalogue, locale)}>
              {projectName(artist, locale)}
            </NameLink>{' '}
            · {albumYears(album, songs)}
          </Text>
          <Text size="sm" opacity={0.7}>
            {albumLength(
              tracks.map(({ frontmatter }) => frontmatter.seconds),
              locale,
              messages.albumLength,
            )}
          </Text>
        </CatalogueHeader>

        <SongList
          {...pick(messages, 'title')}
          tracks={tracks.map((song) => songTrack(song))}
          trackNumbers={
            new Map(
              tracks.flatMap(({ slug, frontmatter: { track } }) =>
                track === undefined ? [] : [[slug, track] as const],
              ),
            )
          }
          {...{ locale }}
        />

        <BackToHome label={messages.backToHome} />
      </Stack>
    </PageShell>
  );
}
