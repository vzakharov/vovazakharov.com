#!/usr/bin/env tsx

/**
 * Rasterizes every Open Graph card the site advertises into a committed PNG:
 * the chart cards a content document's frontmatter names, from the SVG beside
 * each, and the CV's card per framing, from a page generated off the message
 * catalogue.
 *
 * The cards have to be PNGs because no major Open Graph consumer renders SVG —
 * X, Facebook, LinkedIn, Slack and iMessage all drop it and fall back to
 * nothing — and a static export has no request-time renderer to produce one.
 *
 * Run by hand when a card's source changes — never by `next build`, so CI
 * installs no browser. `--check` is what keeps that honest: it recomputes each
 * source's hash against the manifest, so an edited chart or a reworded tagline
 * cannot ship behind a stale social card. It hashes sources only, needing no
 * browser, which is why `vet.sh` can run it beside every other check.
 *
 *   pnpm content:og            # render what changed, prune what is gone
 *   pnpm content:og --check    # report staleness, write nothing
 *
 * Runs under `tsx` rather than bare Node, for the CV card's sake — see
 * `lib/cv-card.ts` — so it reaches `src/` by the `@/` alias.
 */

import fs from 'node:fs';
import path from 'node:path';

import { PUBLIC_DIR } from '@/shared/content/collections';
import { contentHash } from '@/shared/content/content-hash';
import { OG_CARD_SUFFIX } from '@/shared/seo';

import { cvCardPath, cvPath } from '@/pages/cv/lib/cv-urls';
import { CV_VARIANTS } from '@/pages/cv/lib/cv-variants';

import { findChromium } from './lib/chromium.ts';
import { CONTENT_DIRS, contentFiles, REPO_ROOT } from './lib/content-tree.ts';
import { cvCard } from './lib/cv-card.ts';
import {
  CANVAS_BACKGROUND,
  type Card,
  PIXELS,
  renderCard,
} from './lib/og-render.ts';
import { runRenderJob } from './lib/render-manifest.ts';

/**
 * Inset between the drawing and the card's edge, in canvas pixels. Load-bearing
 * as well as cosmetic: Chromium rasterizes an SVG image whose box ends on the
 * surface's last row short of the bottom.
 */
const PADDING = 24;

/** Records each render's source hash, beside the render it describes. */
const MANIFEST_NAME = 'og-renders.json';

/** Where the CV's cards live: its route's own directory under `public/`. */
const CV_CARD_DIR = path.join(PUBLIC_DIR, cvPath());

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
function readSvg(svgPath: string, pngPath: string): string {
  if (!fs.existsSync(svgPath)) {
    throw new Error(
      `No source SVG for the Open Graph card ${path.relative(REPO_ROOT, pngPath)}: ` +
        `expected ${path.relative(REPO_ROOT, svgPath)}. A frontmatter ogImage ending ` +
        `in ${OG_CARD_SUFFIX} is rendered from the SVG of the same stem.`,
    );
  }

  return fs.readFileSync(svgPath, 'utf8');
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
function svgPage(svgName: string): string {
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

/** One card per distinct PNG the frontmatter asks for, its source the SVG. */
function chartCards(): Card[] {
  const pngPaths = [
    ...new Set(
      ogImagePaths().filter((pngPath) => pngPath.endsWith(OG_CARD_SUFFIX)),
    ),
  ];

  return pngPaths.map((pngPath) => {
    const svgPath = `${pngPath.slice(0, -OG_CARD_SUFFIX.length)}.svg`;
    const svgName = path.basename(svgPath);
    const svg = readSvg(svgPath, pngPath);

    return {
      outputPath: pngPath,
      sourceHash: contentHash(svg),
      page: svgPage(svgName),
      files: { [svgName]: svg },
    };
  });
}

/**
 * One card per framing, its source the generated page and the files it
 * references — so the template, the catalogue slice it reads and the portrait
 * are all covered, and editing any of them re-flags the card.
 */
function cvCards(): Card[] {
  return CV_VARIANTS.map((variant) => {
    const staged = cvCard(variant);
    const files = Object.entries(staged.files)
      .toSorted(([a], [b]) => a.localeCompare(b))
      .map(
        ([name, content]) =>
          `${name}:${Buffer.from(content).toString('base64')}`,
      );

    return {
      ...staged,
      outputPath: path.join(PUBLIC_DIR, cvCardPath(variant)),
      sourceHash: contentHash([staged.page, ...files].join('\n')),
    };
  });
}

await runRenderJob(
  {
    label: 'Open Graph card',
    manifestName: MANIFEST_NAME,
    isOutput: (name) => name.endsWith(OG_CARD_SUFFIX),
    manifestDirs: [...CONTENT_DIRS, CV_CARD_DIR],
    entries: [...chartCards(), ...cvCards()],
    render: (stale) => {
      const chromium = findChromium();
      for (const card of stale) renderCard(card, chromium);
    },
  },
  process.argv.includes('--check'),
);
