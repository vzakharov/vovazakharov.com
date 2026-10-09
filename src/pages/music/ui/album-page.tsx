import { Box, Group, Stack, Text } from '@mantine/core';

import { renderProse } from '@/shared/content';
import { byLocale, loadMessages } from '@/shared/i18n';
import { pick } from '@/shared/lib/collections';
import { FileLink, NameLink, PageShell } from '@/shared/ui';

import { ProseContent } from '@/entities/document';

import { SiteFooter } from '@/widgets/site-footer';

import { albumTracks } from '../lib/album-tracks';
import { albumArtist, albumCover, albumGloss, albumTitle } from '../lib/albums';
import { albumYears } from '../lib/catalogue';
import { albumText } from '../lib/catalogue-text';
import { albumLength } from '../lib/duration';
import type { AlbumPageProps } from '../lib/music-route-params';
import { albumPath, artistPath, indexPath } from '../lib/music-urls';
import { projectName } from '../lib/projects';
import { catalogueSongs, songTrack } from '../lib/songs';
import { AlbumPlayButton } from './album-play-button';
import { CatalogueHeader } from './catalogue-header';
import { MusicNav } from './music-nav';
import { ReadMore } from './read-more';
import { SongList } from './song-list';

/**
 * One release: who put it out, its own text where it has one, and its songs in
 * track order.
 */
export async function AlbumPage({ album, locale, everything }: AlbumPageProps) {
  const catalogue = { everything };
  const songs = catalogueSongs(catalogue);
  const messages = loadMessages(locale).music;
  const artist = albumArtist(album, locale);
  const tracks = albumTracks(album, songs);
  const text = albumText(album, locale);
  const prose = text && (await renderProse(text));
  const queue = tracks.map(({ song }) => songTrack(song, album));

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
          picture={albumCover(album)}
          facts={
            // The release's length, and its own file at the far end of the
            // same line, as a song page sets its facts.
            <Group justify="space-between" gap="12px 32px" wrap="wrap">
              <Text size="sm" opacity={0.7}>
                {albumLength(
                  tracks.map(({ song }) => song.frontmatter.seconds),
                  locale,
                  messages.albumLength,
                )}
              </Text>
              {text && <FileLink {...text.markdown}>.md</FileLink>}
            </Group>
          }
        >
          <Text size="sm" opacity={0.7} mt={12}>
            <NameLink href={artistPath(artist, catalogue, locale)}>
              {projectName(artist, locale)}
            </NameLink>{' '}
            · {albumYears(album, songs)}
          </Text>
          {/* The same tracks the list below plays, so both drive one queue. */}
          <Box mt={20}>
            <AlbumPlayButton tracks={queue} />
          </Box>
        </CatalogueHeader>

        {prose && (
          <ReadMore label={messages.readMore}>
            <ProseContent {...prose} />
          </ReadMore>
        )}

        <SongList
          {...pick(messages, 'title')}
          tracks={queue}
          trackNumbers={
            new Map(tracks.map(({ song, track }) => [song.slug, track]))
          }
          {...{ locale }}
        />

        <SiteFooter {...{ locale }} />
      </Stack>
    </PageShell>
  );
}
