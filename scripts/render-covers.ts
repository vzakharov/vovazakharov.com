#!/usr/bin/env tsx

/**
 * Lays every cover drawn as an SVG into the JPEG of the same stem beside it, as
 * a mosaic: the SVG is the motif, and each Voronoi tile takes the motif's colour
 * under its centre, set in grout. One style for every placeholder, so a drawn
 * cover reads as one, at the 600px square every cover is — reaching the tiles,
 * the page and the social card by the path a real cover would.
 *
 * A real cover replacing a drawn one lands after the SVG is deleted and this has
 * run: the run prunes a JPEG whose SVG is gone, whatever is in it by then.
 *
 * Run by hand after editing a motif; `--check` hashes the sources against the
 * manifest without a browser, which is how `vet.sh` keeps a stale render from
 * shipping.
 *
 *   pnpm music:covers          # render what changed, prune what is gone
 *   pnpm music:covers --check  # report staleness, write nothing
 */

import fs from 'node:fs';
import path from 'node:path';

import { collectionDir } from '@/shared/content/collections';

import { findScreenshotChromium } from './lib/chromium.ts';
import { REPO_ROOT } from './lib/content-tree.ts';
import { type Card, generatedCard, renderCard } from './lib/og-render.ts';
import { runRenderJob } from './lib/render-manifest.ts';

const COVERS_DIR = path.join(collectionDir('music'), 'assets', 'covers');

/** The size `albums.ts` and `pictures.ts` document every cover at. */
const SIDE = 600;

/** Staged beside the page; the package exports only its source modules, not this bundle. */
const DELAUNAY = fs.readFileSync(
  path.join(REPO_ROOT, 'node_modules/d3-delaunay/dist/d3-delaunay.min.js'),
  'utf8',
);

/**
 * The motif reaches the canvas through a blob URL, the one route a `file://`
 * page has that leaves the canvas untainted for `getImageData`. The tiles are
 * few and large, a relaxed scatter, so the motif is guessed at rather than
 * drawn; every random draw comes off the slug's seed.
 */
function coverPage(slug: string, svg: string): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>html, body { margin: 0; overflow: hidden; } canvas { display: block; }</style>
    <script src="d3-delaunay.min.js"></script>
  </head>
  <body>
    <canvas width="${SIDE}" height="${SIDE}"></canvas>
    <script>
      const SIDE = ${SIDE}, FRAME = 16, GROUT = '#24201c';
      const TILES = 60, SAMPLE_STEP = 6;

      let seed = [...${JSON.stringify(slug)}].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
      const random = () => {
        seed = (seed + 0x6d2b79f5) >>> 0;
        let t = Math.imul(seed ^ (seed >>> 15), seed | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 2 ** 32;
      };

      const motif = new Image();
      motif.onload = () => {
        const canvas = document.querySelector('canvas');
        const context = canvas.getContext('2d');
        context.drawImage(motif, 0, 0, SIDE, SIDE);
        const { data } = context.getImageData(0, 0, SIDE, SIDE);
        const at = (x, y) => {
          const i = (Math.min(SIDE - 1, Math.max(0, Math.round(y))) * SIDE + Math.min(SIDE - 1, Math.max(0, Math.round(x)))) * 4;
          return [data[i], data[i + 1], data[i + 2]];
        };
        const bounds = [FRAME, FRAME, SIDE - FRAME, SIDE - FRAME];
        const centroid = (polygon) => {
          let x = 0, y = 0, area = 0;
          for (let i = 0; i < polygon.length - 1; i++) {
            const [x0, y0] = polygon[i], [x1, y1] = polygon[i + 1], cross = x0 * y1 - x1 * y0;
            area += cross; x += (x0 + x1) * cross; y += (y0 + y1) * cross;
          }
          return [x / (3 * area), y / (3 * area)];
        };

        let points = Array.from({ length: TILES }, () => [FRAME + random() * (SIDE - 2 * FRAME), FRAME + random() * (SIDE - 2 * FRAME)]);
        for (let pass = 0; pass < 4; pass++)
          points = [...d3.Delaunay.from(points).voronoi(bounds).cellPolygons()].map(centroid);

        context.fillStyle = GROUT;
        context.fillRect(0, 0, SIDE, SIDE);
        context.lineWidth = 3;
        context.lineJoin = 'round';
        context.strokeStyle = GROUT;
        const voronoi = d3.Delaunay.from(points).voronoi(bounds);
        points.forEach((_, cell) => {
          const polygon = voronoi.cellPolygon(cell);
          const xs = polygon.map(([x]) => x), ys = polygon.map(([, y]) => y);
          // The colour most of the tile sits on, so a motif shows only where it fills a tile.
          const tally = new Map();
          for (let y = Math.min(...ys); y < Math.max(...ys); y += SAMPLE_STEP)
            for (let x = Math.min(...xs); x < Math.max(...xs); x += SAMPLE_STEP) {
              if (!voronoi.contains(cell, x, y)) continue;
              const colour = at(x, y), key = colour.map((v) => v >> 5).join();
              const entry = tally.get(key) ?? { count: 0, sum: [0, 0, 0] };
              entry.count++; entry.sum = entry.sum.map((v, i) => v + colour[i]);
              tally.set(key, entry);
            }
          const { count, sum } = [...tally.values()].reduce((a, b) => (b.count > a.count ? b : a), { count: 1, sum: at(...centroid(polygon)) });
          const shade = 1 + (random() - 0.5) * 0.16;
          const [r, g, b] = sum.map((v) => Math.min(255, Math.round((v / count) * shade)));
          context.beginPath();
          polygon.forEach(([x, y], i) => (i === 0 ? context.moveTo(x, y) : context.lineTo(x, y)));
          context.closePath();
          context.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
          context.fill();
          context.stroke();
        });
      };
      motif.src = URL.createObjectURL(new Blob([${JSON.stringify(svg).replaceAll('</', String.raw`<\/`)}], { type: 'image/svg+xml' }));
    </script>
  </body>
</html>
`;
}

function coverCards(): Card[] {
  return fs
    .readdirSync(COVERS_DIR)
    .filter((name) => name.endsWith('.svg'))
    .map((svgName) => {
      const slug = svgName.replace(/\.svg$/, '');
      const svg = fs.readFileSync(path.join(COVERS_DIR, svgName), 'utf8');

      return generatedCard(
        {
          page: coverPage(slug, svg),
          files: { 'd3-delaunay.min.js': DELAUNAY },
        },
        path.join(COVERS_DIR, `${slug}.jpg`),
      );
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
