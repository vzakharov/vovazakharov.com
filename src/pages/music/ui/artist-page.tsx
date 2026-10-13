import { Group, Stack } from '@mantine/core';

import { byLocale, loadMessages } from '@/shared/i18n';
import { pick } from '@/shared/lib/collections';
import { scriptSample } from '@/shared/music-catalogue';
import { FileLink, PageShell } from '@/shared/ui';

import { SiteFooter } from '@/widgets/site-footer';

import { albumTitle } from '../lib/albums';
import { projectGloss, projectName } from '../lib/artists';
import { albumYears, artistReleases, artistSongs } from '../lib/catalogue';
import { artistText } from '../lib/catalogue-text';
import type { ArtistPageProps } from '../lib/music-route-params';
import { albumPath, artistPath, indexPath } from '../lib/music-urls';
import { releasePicture } from '../lib/pictures';
import { catalogueSongs, songTrack, trackNames } from '../lib/songs';
import { CatalogueGrid } from './catalogue-grid';
import { CatalogueHeader } from './catalogue-header';
import { HookLine } from './hook-line';
import { MusicNav } from './music-nav';
import { SongList } from './song-list';
import { Story } from './story';

/**
 * One project: its own text where it has one, the albums and singles it put
 * out, then every song it is billed on.
 */
export function ArtistPage({ artist, locale, everything }: ArtistPageProps) {
  const catalogue = { everything };
  const songs = catalogueSongs(catalogue);
  const messages = loadMessages(locale).music;
  const text = artistText(artist, locale);
  const name = projectName(artist, locale);
  const tiles = artistReleases(artist, locale, songs).map((release) => {
    const cover = releasePicture(release);

    if ('album' in release) {
      const { album } = release;

      return {
        href: albumPath(album, catalogue, locale),
        slug: album,
        name: albumTitle(album, locale),
        cover,
        detail: albumYears(album, songs),
      };
    }

    const { titles, routes } = songTrack(release.single);

    return {
      href: routes[locale],
      ...pick(release.single, 'slug'),
      name: titles[locale],
      cover,
      detail: `${messages.single} · ${String(release.single.frontmatter.date.getUTCFullYear())}`,
    };
  });
  const tracks = artistSongs(artist, songs).map((song) => songTrack(song));
  const sample = scriptSample(
    [
      name.original,
      ...tiles.map((tile) => tile.name.original),
      ...trackNames(tracks, locale),
    ],
    locale,
  );

  return (
    <PageShell>
      <Stack gap={48}>
        <MusicNav
          back={{ href: indexPath(catalogue, locale), label: messages.back }}
          hrefs={byLocale((alternate) =>
            artistPath(artist, catalogue, alternate),
          )}
          {...{ locale, sample }}
        />

        <CatalogueHeader
          kind={messages.kind.artist}
          title={name}
          gloss={projectGloss(artist, locale)}
          facts={
            // Its own file at the far end of the line, where an album page
            // sets it.
            <Group justify="flex-end">
              <FileLink {...text.markdown}>.md</FileLink>
            </Group>
          }
        >
          <HookLine>{text.hook}</HookLine>
        </CatalogueHeader>

        <Story
          {...pick(text, 'universe', 'story')}
          {...pick(messages, 'makingOf', 'readMore')}
        />

        <CatalogueGrid title={messages.albums} {...{ tiles }} />

        <SongList {...pick(messages, 'title')} {...{ tracks, locale }} />

        <SiteFooter {...{ locale }} />
      </Stack>
    </PageShell>
  );
}
