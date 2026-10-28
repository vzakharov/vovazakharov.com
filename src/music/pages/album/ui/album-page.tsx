import { Box, Stack } from '@mantine/core';

import { byLocale } from '@/kernel/shared/i18n';
import { pick } from '@/kernel/shared/lib/collections';

import { NameLink, PageShell } from '@/shell/shared/ui';
import { SiteFooter } from '@/shell/widgets/site-footer';

import {
  albumPath,
  catalogueInfo,
  musicPath,
  scriptSample,
  songTrack,
  trackNames,
} from '@/music/shared/catalogue';
import { messages } from '@/music/shared/i18n';
import { FactLine, Spelling } from '@/music/shared/ui';
import { HookLine } from '@/music/entities/hook';
import { AlbumPlayButton } from '@/music/features/player';
import { CatalogueHeader } from '@/music/widgets/catalogue-header';
import { MusicNav } from '@/music/widgets/music-nav';
import { SongList } from '@/music/widgets/song-list';
import { Story } from '@/music/widgets/story';

import type { AlbumPageProps } from '../lib/album-metadata';

/**
 * One release: who put it out, whether it is still being made, its own text
 * where it has one, and its songs in track order.
 */
export function AlbumPage({ album, locale }: AlbumPageProps) {
  const copy = messages(locale);
  const { name, gloss, text, artist, cover, wip, kind, years, tracks, size } =
    catalogueInfo().album(album, locale);
  const queue = tracks.map(({ song }) => songTrack(song, album));
  const sample = scriptSample(
    [name.original, artist.name.original, ...trackNames(queue, locale)],
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
          kind={copy.kind[kind]}
          title={name}
          picture={cover}
          {...pick(text, 'markdown')}
          {...{ gloss, wip, size }}
        >
          <FactLine
            facts={{
              artist: (
                <NameLink {...pick(artist, 'href')}>
                  <Spelling {...artist.name} />
                </NameLink>
              ),
              years,
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
