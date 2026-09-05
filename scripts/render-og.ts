#!/usr/bin/env node

/**
 * Rasterizes every Open Graph card the content's frontmatter names, from the
 * SVG beside it, into a committed PNG.
 *
 * The cards have to be PNGs because no major Open Graph consumer renders SVG —
 * X, Facebook, LinkedIn, Slack and iMessage all drop it and fall back to
 * nothing — and a static export has no request-time renderer to produce one.
 *
 * Run by hand when a card's source changes — never by `next build`, so CI
 * installs no browser. `--check` is what keeps that honest: it recomputes each
 * source's hash against the manifest, so an edited chart cannot ship behind a
 * stale social card. It hashes files only, needing no browser, which is why
 * `vet.sh` can run it beside every other check.
 *
 *   pnpm content:og            # render what changed, prune what is gone
 *   pnpm content:og --check    # report staleness, write nothing
 *
 * Bare Node runs this file, relying on its type stripping, so it needs Node
 * 22.18 or newer and every relative import carries its `.ts` extension.
 */

/* eslint-disable no-console -- stdout is this script's interface: progress,
   the `--check` staleness report, and the prune log are what a human runs it
   for. The rule stays `error` in the app, where a stray log ships to a user. */

import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { contentHash } from '../src/shared/content/content-hash.ts';
import { findChromium } from './lib/chromium.ts';
import { contentFiles, REPO_ROOT } from './lib/content-tree.ts';
import { type Renderable, runRenderJob } from './lib/render-manifest.ts';

/** Absolute paths. A card's PNG and its source SVG share a directory. */
type Card = Renderable & { svgPath: string };

/**
 * 1200×630 is what X's `summary_large_image` crops to, and the chart's native
 * 980×640 would lose its title row and x-axis to that crop. Letterboxing into
 * the ratio costs padding and loses nothing.
 */
const CANVAS = { width: 1200, height: 630 };

/** Doubled so the card stays sharp where a consumer renders it at 2×. */
const SCALE = 2;

/**
 * The PNG's real pixel size, and the size the page is laid out at — scaling
 * `CANVAS` by a device pixel ratio instead widens the bottom-row loss `PADDING`
 * guards against.
 */
const PIXELS = {
  width: CANVAS.width * SCALE,
  height: CANVAS.height * SCALE,
};

/**
 * Inset between the drawing and the card's edge, in canvas pixels. Load-bearing
 * as well as cosmetic: Chromium rasterizes an SVG image whose box ends on the
 * surface's last row short of the bottom.
 */
const PADDING = 24;

/** `globals.css`'s `--background`, so the inset extends the source's own plate. */
const CANVAS_BACKGROUND = '#ffffff';

/** A frontmatter `ogImage` under this suffix is rendered from `<stem>.svg`. */
const RENDERED_SUFFIX = '.og.png';

/** Records each render's source hash, beside the render it describes. */
const MANIFEST_NAME = 'og-renders.json';

/**
 * The `ogImage` each document's frontmatter names, resolved against the
 * document. Read with a pattern rather than through the content pipeline for
 * the same reason the mermaid script reads fences that way: this runs outside
 * the bundler, where `shared/content` is unavailable.
 */
function ogImagePaths(): string[] {
  const frontmatterPattern = /^---\r?\n([\S\s]*?)^---/m;
  const ogImagePattern = /^ogImage:[\t ]*(\S+)[\t ]*$/m;

  return contentFiles((name) => name.endsWith('.md')).flatMap((file) => {
    const frontmatter = frontmatterPattern.exec(fs.readFileSync(file, 'utf8'));

    if (frontmatter === null) return [];

    const reference = ogImagePattern.exec(frontmatter[1] ?? '');

    return reference?.[1] === undefined
      ? []
      : [path.resolve(path.dirname(file), reference[1])];
  });
}

/** Throws when a card names a source SVG that is not there. */
function sourceHash(svgPath: string, pngPath: string): string {
  if (!fs.existsSync(svgPath)) {
    throw new Error(
      `No source SVG for the Open Graph card ${path.relative(REPO_ROOT, pngPath)}: ` +
        `expected ${path.relative(REPO_ROOT, svgPath)}. A frontmatter ogImage ending ` +
        `in ${RENDERED_SUFFIX} is rendered from the SVG of the same stem.`,
    );
  }

  return contentHash(fs.readFileSync(svgPath, 'utf8'));
}

/** The cards to render, one per distinct PNG the frontmatter asks for. */
function collectCards(): Card[] {
  const pngPaths = [
    ...new Set(
      ogImagePaths().filter((pngPath) => pngPath.endsWith(RENDERED_SUFFIX)),
    ),
  ];

  return pngPaths.map((pngPath) => {
    const svgPath = `${pngPath.slice(0, -RENDERED_SUFFIX.length)}.svg`;

    return {
      svgPath,
      outputPath: pngPath,
      sourceHash: sourceHash(svgPath, pngPath),
    };
  });
}

/**
 * The source is referenced rather than inlined so it is parsed as SVG.
 * Splicing it into the page would put it through the HTML parser, where any of
 * some forty HTML tag names appearing anywhere in the file ends foreign
 * content and spills the rest of the chart out as text — and authored content
 * cannot be asked to avoid those.
 *
 * `object-fit` does the letterboxing, so any source scales to fit and centres
 * whatever its own aspect, with no intrinsic-size arithmetic to get wrong.
 *
 * Chromium's default scheme is light, which is what a social card wants: every
 * consumer composites it onto a surface of its own, and light frames legibly on
 * either.
 */
function cardPage(svgName: string): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: ${PIXELS.width}px;
        height: ${PIXELS.height}px;
        background: ${CANVAS_BACKGROUND};
        overflow: hidden;
      }
      img {
        display: block;
        width: ${PIXELS.width - 2 * PADDING}px;
        height: ${PIXELS.height - 2 * PADDING}px;
        margin: ${PADDING}px;
        object-fit: contain;
      }
    </style>
  </head>
  <body><img src="${svgName}" alt="" /></body>
</html>
`;
}

function renderCard(card: Card, chromium: string): void {
  // Copied in beside the page: a file:// document's reach outside its own
  // directory is not something to depend on.
  const stagingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'og-'));
  const svgName = path.basename(card.svgPath);
  const pagePath = path.join(stagingDir, 'card.html');

  fs.copyFileSync(card.svgPath, path.join(stagingDir, svgName));
  fs.writeFileSync(pagePath, cardPage(svgName));

  fs.mkdirSync(path.dirname(card.outputPath), { recursive: true });

  execFileSync(
    chromium,
    [
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      '--hide-scrollbars',
      // Without it `--screenshot` can fire before the referenced SVG has
      // painted, yielding a blank card.
      '--virtual-time-budget=10000',
      `--window-size=${PIXELS.width},${PIXELS.height}`,
      `--screenshot=${card.outputPath}`,
      `file://${pagePath}`,
    ],
    { stdio: 'inherit' },
  );

  console.log(
    `  rendered ${path.relative(REPO_ROOT, card.outputPath)} ` +
      `(${PIXELS.width}×${PIXELS.height})`,
  );
}

await runRenderJob(
  {
    label: 'Open Graph card',
    manifestName: MANIFEST_NAME,
    isOutput: (name) => name.endsWith(RENDERED_SUFFIX),
    entries: collectCards(),
    render: (stale) => {
      const chromium = findChromium();
      for (const card of stale) renderCard(card, chromium);
    },
  },
  process.argv.includes('--check'),
);
