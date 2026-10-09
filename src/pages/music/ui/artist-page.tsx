import { Group, Stack } from '@mantine/core';

import { renderProse } from '@/shared/content';
import { byLocale, loadMessages } from '@/shared/i18n';
import { pick } from '@/shared/lib/collections';
import { FileLink, PageShell } from '@/shared/ui';

import { ProseContent } from '@/entities/document';

import { SiteFooter } from '@/widgets/site-footer';

import { albumTitle } from '../lib/albums';
import { albumYears, artistReleases, artistSongs } from '../lib/catalogue';
import { artistText } from '../lib/catalogue-text';
import type { ArtistPageProps } from '../lib/music-route-params';
import { albumPath, artistPath, indexPath } from '../lib/music-urls';
import { releasePicture } from '../lib/pictures';
import { projectGloss, projectName } from '../lib/projects';
import { catalogueSongs, songTrack } from '../lib/songs';
import { CatalogueGrid } from './catalogue-grid';
import { CatalogueHeader } from './catalogue-header';
import { MusicNav } from './music-nav';
import { ReadMore } from './read-more';
import { SongList } from './song-list';

/**
 * One project: its own text where it has one, the albums and singles it put
 * out, then every song it is billed on.
 */
export async function ArtistPage({
  artist,
  locale,
  everything,
}: ArtistPageProps) {
  const catalogue = { everything };
  const songs = catalogueSongs(catalogue);
  const messages = loadMessages(locale).music;
  const text = artistText(artist, locale);
  const prose = text && (await renderProse(text));

  return (
    <PageShell>
      <Stack gap={48}>
        <MusicNav
          back={{ href: indexPath(catalogue, locale), label: messages.back }}
          hrefs={byLocale((alternate) =>
            artistPath(artist, catalogue, alternate),
          )}
          {...{ locale }}
        />

        <CatalogueHeader
          kind={messages.kind.artist}
          title={projectName(artist, locale)}
          gloss={projectGloss(artist, locale)}
          facts={
            // Its own file at the far end of the line, where an album page
            // sets it.
            text && (
              <Group justify="flex-end">
                <FileLink {...text.markdown}>.md</FileLink>
              </Group>
            )
          }
        />

        {prose && (
          <ReadMore label={messages.readMore}>
            <ProseContent {...prose} />
          </ReadMore>
        )}

        <CatalogueGrid
          title={messages.albums}
          tiles={artistReleases(artist, locale, songs).map((release) => {
            const cover = releasePicture(release);

            if ('album' in release) {
              const { album } = release;

              return {
                href: albumPath(album, catalogue, locale),
                label: albumTitle(album, locale),
                cover,
                detail: albumYears(album, songs),
              };
            }

            const { titles, routes } = songTrack(release.single);

            const { title, transliterated } = titles[locale];

            return {
              href: routes[locale],
              label: title,
              transliterated,
              cover,
              detail: `${messages.single} · ${String(release.single.frontmatter.date.getUTCFullYear())}`,
            };
          })}
        />

        <SongList
          {...pick(messages, 'title')}
          tracks={artistSongs(artist, songs).map((song) => songTrack(song))}
          {...{ locale }}
        />

        <SiteFooter {...{ locale }} />
      </Stack>
    </PageShell>
  );
}
