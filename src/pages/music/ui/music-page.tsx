import { Stack } from '@mantine/core';

import { byLocale, loadMessages } from '@/shared/i18n';
import { BackToHome, PageShell } from '@/shared/ui';

import { catalogueArtists } from '../lib/catalogue';
import type { CataloguePageProps } from '../lib/music-route-params';
import { artistPath, indexPath } from '../lib/music-urls';
import { projectName } from '../lib/projects';
import { catalogueSongs } from '../lib/songs';
import { CatalogueGrid } from './catalogue-grid';
import { MusicNav } from './music-nav';
import { MusicSection } from './music-section';

/** The section's front page: the artists, each a way into its albums and songs. */
export function MusicPage({ locale, everything }: CataloguePageProps) {
  const catalogue = { everything };
  const messages = loadMessages(locale).music;

  return (
    <PageShell>
      <Stack gap={48}>
        <MusicNav
          hrefs={byLocale((alternate) => indexPath(catalogue, alternate))}
          {...{ locale }}
        />

        <MusicSection {...{ locale }} />

        <CatalogueGrid
          title={messages.artists}
          tiles={catalogueArtists(catalogueSongs(catalogue)).map((artist) => ({
            href: artistPath(artist, catalogue, locale),
            label: projectName(artist, locale),
          }))}
        />

        <BackToHome label={messages.backToHome} />
      </Stack>
    </PageShell>
  );
}
