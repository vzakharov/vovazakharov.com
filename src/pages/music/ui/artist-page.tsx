import { Stack } from '@mantine/core';

import { byLocale, loadMessages } from '@/shared/i18n';
import { pick } from '@/shared/lib/collections';
import { type MusicAlbum, scriptSample } from '@/shared/music-catalogue';
import { PageShell } from '@/shared/ui';

import { SiteFooter } from '@/widgets/site-footer';

import { albumCover, albumTitle } from '../lib/albums';
import { projectGloss, projectName } from '../lib/artists';
import {
  albumDetail,
  albumWipNote,
  artistDiscography,
  artistSongs,
  wipApart,
} from '../lib/catalogue';
import { artistText } from '../lib/catalogue-text';
import { catalogueSize } from '../lib/duration';
import type { ArtistPageProps } from '../lib/music-route-params';
import { albumPath, artistPath, musicPath } from '../lib/music-urls';
import { songPicture } from '../lib/pictures';
import { catalogueSongs, songTrack, trackNames } from '../lib/songs';
import { CatalogueGrid } from './catalogue-grid';
import { CatalogueHeader } from './catalogue-header';
import { HookLine } from './hook-line';
import { MusicNav } from './music-nav';
import { SongList } from './song-list';
import { Story } from './story';

/**
 * One project: its own text where it has one, the albums it put out, then those
 * still in the works, then its singles, then every song it is billed on.
 */
export function ArtistPage({ artist, locale }: ArtistPageProps) {
  const songs = catalogueSongs();
  const messages = loadMessages(locale).music;
  const text = artistText(artist, locale);
  const name = projectName(artist, locale);
  const { albums, singles } = artistDiscography(artist, locale, songs);
  const billed = artistSongs(artist, songs);
  const albumTile = (album: MusicAlbum) => ({
    href: albumPath(album, locale),
    slug: album,
    name: albumTitle(album, locale),
    cover: albumCover(album),
    detail: albumDetail(album, locale, songs).join(' · '),
    wip: albumWipNote(album, locale),
  });
  const { finished, wip } = wipApart(albums);
  const albumTiles = finished.map((album) => albumTile(album));
  const wipTiles = wip.map((album) => albumTile(album));
  const singleTiles = singles.map((single) => {
    const { titles, routes } = songTrack(single);

    return {
      href: routes[locale],
      ...pick(single, 'slug'),
      name: titles[locale],
      cover: songPicture(single),
      detail: String(single.frontmatter.date.getUTCFullYear()),
    };
  });
  const tracks = billed.map((song) => songTrack(song));
  const sample = scriptSample(
    [
      name.original,
      ...[...albumTiles, ...wipTiles, ...singleTiles].map(
        (tile) => tile.name.original,
      ),
      ...trackNames(tracks, locale),
    ],
    locale,
  );

  return (
    <PageShell>
      <Stack gap={48}>
        <MusicNav
          back={{ href: musicPath(locale), label: messages.back }}
          hrefs={byLocale((alternate) => artistPath(artist, alternate))}
          {...{ locale, sample }}
        />

        <CatalogueHeader
          kind={messages.kind.artist}
          title={name}
          gloss={projectGloss(artist, locale)}
          size={catalogueSize(
            {
              albums: albums.length,
              seconds: billed.map(({ frontmatter }) => frontmatter.seconds),
            },
            locale,
            messages.size,
          )}
          {...pick(text, 'markdown')}
        >
          <HookLine>{text.hook}</HookLine>
        </CatalogueHeader>

        <Story
          {...pick(text, 'prelude', 'story')}
          {...pick(messages, 'behindTheScenes', 'preludeHeadings', 'readMore')}
        />

        <CatalogueGrid title={messages.albums} tiles={albumTiles} />

        <CatalogueGrid title={messages.wip.heading} tiles={wipTiles} />

        <CatalogueGrid title={messages.singles} tiles={singleTiles} />

        <SongList {...pick(messages, 'title')} {...{ tracks, locale }} />

        <SiteFooter {...{ locale }} />
      </Stack>
    </PageShell>
  );
}
