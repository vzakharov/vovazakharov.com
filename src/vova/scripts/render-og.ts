#!/usr/bin/env tsx

/**
 * vovazakharov.com's Open Graph cards: the core's, the CV's one per framing,
 * and the music section's. `src/kernel/scripts/lib/og-job.ts` carries the
 * contract.
 */

import path from 'node:path';

import { PUBLIC_DIR } from '@/kernel/shared/config/index.node-safe';

import { cvCardPath, cvPath } from '@/vova/pages/cv/lib/cv-urls';
import { CV_VARIANTS } from '@/vova/pages/cv/lib/cv-variants';

import { cvCard } from './lib/cv-card.ts';

import { generatedCard, renderOgCards } from '@/kernel/scripts/lib/og-job';
import { musicCards } from '@/music/scripts/lib/music-cards';

await renderOgCards(
  {
    cards: CV_VARIANTS.map((variant) =>
      generatedCard(
        cvCard(variant),
        path.join(PUBLIC_DIR, cvCardPath(variant)),
      ),
    ),
    // The CV's cards live in its route's own directory, outside the content tree.
    manifestDirs: [path.join(PUBLIC_DIR, cvPath())],
  },
  musicCards(),
);
