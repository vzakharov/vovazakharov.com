/**
 * The music section's Open Graph cards, as a bundle for the render of whichever
 * site mounts it: the index's collage, the radio's — the same covers under its
 * band — the songs feeds' square cut of it under theirs, and each artist's that
 * has one, at the addresses their pages' metadata and the feeds point to.
 */

import path from 'node:path';

import { siteConfig } from '@/kernel/shared/config';
import { PUBLIC_DIR } from '@/kernel/shared/content/index.node-safe';

import { musicProjectNames } from '@/music/shared/catalogue';
import { musicMessages } from '@/music/shared/i18n';
import {
  artistCollage,
  artistCollageCovers,
  MUSIC_COLLAGE,
  musicCollageCovers,
  PODCAST_COVER,
  RADIO_CARD,
} from '@/music/pages/music/lib/pictures';

import { RENDERED_SITE } from '../../../kernel/scripts/lib/content-tree.ts';
import {
  generatedCard,
  type OgBundle,
} from '../../../kernel/scripts/lib/og-job.ts';
import type { Card } from '../../../kernel/scripts/lib/og-render.ts';
import {
  type CollageBand,
  musicCollage,
  type MusicCollageOptions,
} from './music-collage.ts';

function collageCard(
  covers: readonly string[],
  card: string,
  options?: MusicCollageOptions,
): Card {
  return generatedCard(
    musicCollage(covers, options),
    path.join(PUBLIC_DIR, card),
  );
}

/** English only, one card for both languages, as every collage is. */
function radioBand(): CollageBand {
  const { title, pitch } = musicMessages('en').radioPage;

  return { title, line: pitch };
}

/** The songs feeds' name without its locale, over the feeds' own description. */
function podcastBand(): CollageBand {
  const { title, metaDescription } = musicMessages('en');

  return {
    title: `${siteConfig(RENDERED_SITE).name} — ${title}`,
    line: metaDescription,
  };
}

export function musicCards(): OgBundle {
  return {
    cards: [
      collageCard(musicCollageCovers(), MUSIC_COLLAGE),
      collageCard(musicCollageCovers(), RADIO_CARD, { band: radioBand() }),
      collageCard(musicCollageCovers(), PODCAST_COVER, {
        band: podcastBand(),
        shape: 'square',
      }),
      ...musicProjectNames().flatMap((artist) => {
        const covers = artistCollageCovers(artist);

        return covers.length === 0
          ? []
          : [collageCard(covers, artistCollage(artist))];
      }),
    ],
    // The index's collage and the podcast cover sit at the root of `public/`.
    manifestDirs: [PUBLIC_DIR],
    outputNames: [path.basename(PODCAST_COVER)],
  };
}
