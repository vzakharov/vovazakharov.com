import { Box, Stack } from '@mantine/core';

import { byLocale } from '@/kernel/shared/i18n';
import { pick } from '@/kernel/shared/lib/collections';

import { NameLink, PageShell } from '@/shell/shared/ui';
import { SiteFooter } from '@/shell/widgets/site-footer';

import {
  albumArtist,
  albumCover,
  albumGloss,
  albumKind,
  albumPath,
  albumText,
  albumTitle,
  albumWipNote,
  albumYears,
  artistPath,
  catalogueSongs,
  musicPath,
  projectName,
  scriptSample,
  songTrack,
  trackNames,
} from '@/music/shared/catalogue';
import { albumTracks } from '@/music/shared/catalogue/index.node-safe';
import { messages } from '@/music/shared/i18n';

import { catalogueSize } from '../lib/duration';
import type { AlbumPageProps } from '../lib/music-route-params';
import { AlbumPlayButton } from './album-play-button';
import { CatalogueHeader } from './catalogue-header';
import { FactLine } from './fact-line';
import { HookLine } from './hook-line';
import { MusicNav } from './music-nav';
import { SongList } from './song-list';
import { Spelling } from './spelling';
import { Story } from './story';

/**
 * One release: who put it out, whether it is still being made, its own text
 * where it has one, and its songs in track order.
 */
export function AlbumPage({ album, locale }: AlbumPageProps) {
  const songs = catalogueSongs();
  const copy = messages(locale);
  const artist = albumArtist(album, locale);
  const tracks = albumTracks(album, songs);
  const text = albumText(album, locale);
  const queue = tracks.map(({ song }) => songTrack(song, album));
  const title = albumTitle(album, locale);
  const artistName = projectName(artist, locale);
  const sample = scriptSample(
    [title.original, artistName.original, ...trackNames(queue, locale)],
    locale,
  );

  return (
    <PageShell>
      <Stack gap={48}>
        <MusicNav
          back={{ href: musicPath(locale), label: copy.back }}
          hrefs={byLocale((alternate) => albumPath(album, alternate))}
          {...{ locale, sample }}
        />

        <CatalogueHeader
          kind={copy.kind[albumKind(album, songs)]}
          {...{ title }}
          gloss={albumGloss(album, locale)}
          picture={albumCover(album)}
          size={catalogueSize(
            { seconds: tracks.map(({ song }) => song.frontmatter.seconds) },
            locale,
            copy.size,
          )}
          {...pick(text, 'markdown')}
          wip={albumWipNote(album, locale)}
        >
          <FactLine
            facts={{
              artist: (
                <NameLink href={artistPath(artist, locale)}>
                  <Spelling {...artistName} />
                </NameLink>
              ),
              years: albumYears(album, songs),
            }}
            fz="sm"
            opacity={0.7}
            mt={12}
          />
          <HookLine>{text.hook}</HookLine>
          {/* The same tracks the list below plays, so both drive one queue. */}
          <Box mt={20}>
            <AlbumPlayButton tracks={queue} />
          </Box>
        </CatalogueHeader>

        <Story
          {...pick(text, 'prelude', 'story')}
          {...pick(copy, 'behindTheScenes', 'preludeHeadings', 'readMore')}
        />

        <SongList
          {...pick(copy, 'title')}
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
