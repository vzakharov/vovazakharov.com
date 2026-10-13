import { Box, Stack } from '@mantine/core';

import { byLocale, loadMessages } from '@/shared/i18n';
import { pick } from '@/shared/lib/collections';
import { NameLink, PageShell } from '@/shared/ui';

import { SiteFooter } from '@/widgets/site-footer';

import { albumTracks } from '../lib/album-tracks';
import {
  albumArtist,
  albumCover,
  albumGloss,
  albumTitle,
  albumWip,
} from '../lib/albums';
import { albumKind, albumYears } from '../lib/catalogue';
import { albumText } from '../lib/catalogue-text';
import { catalogueSize } from '../lib/duration';
import type { AlbumPageProps } from '../lib/music-route-params';
import { albumPath, artistPath, indexPath } from '../lib/music-urls';
import { projectName } from '../lib/projects';
import { catalogueSongs, songTrack } from '../lib/songs';
import { AlbumPlayButton } from './album-play-button';
import { CatalogueHeader } from './catalogue-header';
import { FactLine } from './fact-line';
import { HookLine } from './hook-line';
import { MusicNav } from './music-nav';
import { SongList } from './song-list';
import { Story } from './story';

/**
 * One release: who put it out, whether it is still being made, its own text
 * where it has one, and its songs in track order.
 */
export function AlbumPage({ album, locale, everything }: AlbumPageProps) {
  const catalogue = { everything };
  const songs = catalogueSongs(catalogue);
  const messages = loadMessages(locale).music;
  const artist = albumArtist(album, locale);
  const tracks = albumTracks(album, songs);
  const text = albumText(album, locale);
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
          kind={messages.kind[albumKind(album, songs)]}
          title={albumTitle(album, locale)}
          gloss={albumGloss(album, locale)}
          picture={albumCover(album)}
          size={catalogueSize(
            { seconds: tracks.map(({ song }) => song.frontmatter.seconds) },
            locale,
            messages.size,
          )}
          markdown={text?.markdown}
          wip={albumWip(album) ? messages.wip.note : undefined}
        >
          <FactLine
            facts={{
              artist: (
                <NameLink href={artistPath(artist, catalogue, locale)}>
                  {projectName(artist, locale)}
                </NameLink>
              ),
              years: albumYears(album, songs),
            }}
            fz="sm"
            opacity={0.7}
            mt={12}
          />
          <HookLine>{text?.hook}</HookLine>
          {/* The same tracks the list below plays, so both drive one queue. */}
          <Box mt={20}>
            <AlbumPlayButton tracks={queue} />
          </Box>
        </CatalogueHeader>

        {text && (
          <Story
            {...pick(text, 'universe', 'story')}
            {...pick(messages, 'makingOf', 'readMore')}
          />
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
