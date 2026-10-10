#!/usr/bin/env tsx

/**
 * Rasterizes every cover drawn as an SVG into the JPEG of the same stem beside
 * it, the 600px square every cover is — so a drawn cover reaches the tiles, the
 * page and the social card by the path a real one would. A real cover replacing
 * a drawn one lands after the SVG is deleted and this has run: the run prunes
 * a JPEG whose SVG is gone, whatever is in it by then.
 *
 * Run by hand after editing a drawing; `--check` hashes the SVGs against the
 * manifest without a browser, which is how `vet.sh` keeps a stale render from
 * shipping.
 *
 *   pnpm music:covers          # render what changed, prune what is gone
 *   pnpm music:covers --check  # report staleness, write nothing
 */

import fs from 'node:fs';
import path from 'node:path';

import { collectionDir } from '@/shared/content/collections';
import { contentHash } from '@/shared/content/content-hash';

import { findScreenshotChromium } from './lib/chromium.ts';
import { type Card, renderCard } from './lib/og-render.ts';
import { runRenderJob } from './lib/render-manifest.ts';

const COVERS_DIR = path.join(collectionDir('music'), 'assets', 'covers');

/** The size `albums.ts` and `pictures.ts` document every cover at. */
const SIDE = 600;

/** Referenced rather than inlined for the reason `render-og.ts`'s `svgPage` gives. */
function coverPage(svgName: string): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html, body { margin: 0; padding: 0; overflow: hidden; }
      img { display: block; width: ${SIDE}px; height: ${SIDE}px; }
    </style>
  </head>
  <body><img src="${svgName}" alt="" /></body>
</html>
`;
}

function coverCards(): Card[] {
  return fs
    .readdirSync(COVERS_DIR)
    .filter((name) => name.endsWith('.svg'))
    .map((svgName) => {
      const svg = fs.readFileSync(path.join(COVERS_DIR, svgName), 'utf8');

      return {
        outputPath: path.join(COVERS_DIR, svgName.replace(/\.svg$/, '.jpg')),
        sourceHash: contentHash(svg),
        page: coverPage(svgName),
        files: { [svgName]: svg },
      };
    });
}

await runRenderJob(
  {
    label: 'drawn cover',
    manifestName: 'cover-renders.json',
    // Only a JPEG the manifest records is this job's: the real covers beside
    // the drawn ones have no SVG and are nobody's render to prune.
    isOutput: () => false,
    manifestDirs: [COVERS_DIR],
    entries: coverCards(),
    render: (stale) => {
      const chromium = findScreenshotChromium();
      for (const card of stale)
        renderCard(card, chromium, { width: SIDE, height: SIDE });
    },
  },
  process.argv.includes('--check'),
);
