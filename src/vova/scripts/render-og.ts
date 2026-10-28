#!/usr/bin/env tsx

/**
 * vovazakharov.com's Open Graph cards: blog's, the CV's one per framing, and
 * the music section's. `src/blog/scripts/lib/og-job.ts` carries the contract.
 */

import path from 'node:path';

import { PUBLIC_DIR } from '@/kernel/shared/config/index.node-safe';

import {
  CV_VARIANTS,
  cvCardPath,
  cvPath,
} from '@/vova/pages/cv/index.node-safe';

import { cvCard } from './lib/cv-card.ts';

import { renderDocumentOgCards } from '@/blog/scripts/lib/og-job';
import { generatedCard } from '@/kernel/scripts/lib/og-job';
import { musicCards } from '@/music/scripts/lib/music-cards';

await renderDocumentOgCards(
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
