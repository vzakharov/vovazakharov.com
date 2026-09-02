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
import { z } from 'zod';

import { contentHash } from '../src/shared/content/content-hash.ts';
import { findChromium } from './lib/chromium.ts';

type Card = {
  /** Absolute path of the SVG the card is rasterized from. */
  svgPath: string;
  /** Absolute path of the PNG written beside it. */
  pngPath: string;
  /** Absolute path of the manifest recording this card's source hash. */
  manifestPath: string;
};

const REPO_ROOT = path.join(import.meta.dirname, '..');
const CONTENT_ROOT = path.join(REPO_ROOT, 'public', 'content');

/**
 * 1200×630 is what X's `summary_large_image` crops to; the chart's native
 * 980×640 would lose its title row and x-axis to that crop, so the card is
 * letterboxed into the ratio instead — fitted to the height, side padding
 * absorbing the rest.
 */
const CANVAS = { width: 1200, height: 630 };

/** Doubled so the card stays sharp where a consumer renders it at 2×. */
const SCALE = 2;

/** The PNG's real pixel size — the canvas the page is laid out in. */
const PIXELS = {
  width: CANVAS.width * SCALE,
  height: CANVAS.height * SCALE,
};

/**
 * Inset, in canvas pixels, between the drawing and the card's edge. Also keeps
 * the drawing off the raster's bottom row, where Chromium loses a sliver of an
 * SVG image whose box ends exactly there.
 */
const PADDING = 24;

/**
 * The surface behind the card. The same value as `--background` in
 * `globals.css` and as the source SVG's own plate, which is what makes the
 * padding read as part of the figure rather than as a border around it.
 */
const CANVAS_BACKGROUND = '#ffffff';

/** A frontmatter `ogImage` under this suffix is rendered from `<stem>.svg`. */
const RENDERED_SUFFIX = '.og.png';

/** Records each render's source hash, beside the render it describes. */
const MANIFEST_NAME = 'og-renders.json';

const checkOnly = process.argv.includes('--check');

/** Every markdown file under the content tree. */
function markdownFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      return entry.name === 'generated' ? [] : markdownFiles(entryPath);
    }

    return entry.name.endsWith('.md') ? [entryPath] : [];
  });
}

/**
 * The `ogImage` each document's frontmatter names, resolved against the
 * document. Read with a pattern rather than through the content pipeline for
 * the same reason the mermaid script reads fences that way: this runs outside
 * the bundler, where `shared/content` is unavailable.
 */
function ogImagePaths(): string[] {
  const frontmatterPattern = /^---\r?\n([\S\s]*?)^---/m;
  const ogImagePattern = /^ogImage:[\t ]*(\S+)[\t ]*$/m;

  return markdownFiles(CONTENT_ROOT).flatMap((file) => {
    const frontmatter = frontmatterPattern.exec(fs.readFileSync(file, 'utf8'));

    if (frontmatter === null) return [];

    const reference = ogImagePattern.exec(frontmatter[1] ?? '');

    return reference?.[1] === undefined
      ? []
      : [path.resolve(path.dirname(file), reference[1])];
  });
}

/** The cards to render, one per distinct PNG the frontmatter asks for. */
function collectCards(): Card[] {
  const pngPaths = [
    ...new Set(
      ogImagePaths().filter((pngPath) => pngPath.endsWith(RENDERED_SUFFIX)),
    ),
  ];

  return pngPaths.map((pngPath) => ({
    svgPath: `${pngPath.slice(0, -RENDERED_SUFFIX.length)}.svg`,
    pngPath,
    manifestPath: path.join(path.dirname(pngPath), MANIFEST_NAME),
  }));
}

/** Output file name → the hash of the source it was rendered from. */
const manifestSchema = z.record(z.string(), z.string());

function readManifest(manifestPath: string): Record<string, string> {
  if (!fs.existsSync(manifestPath)) return {};

  return manifestSchema.parse(
    JSON.parse(fs.readFileSync(manifestPath, 'utf8')),
    { error: () => `Malformed OG manifest: ${manifestPath}` },
  );
}

/** The hash of the SVG a card is rendered from. Throws when it is missing. */
function sourceHash({ svgPath, pngPath }: Card): string {
  if (!fs.existsSync(svgPath)) {
    throw new Error(
      `No source SVG for the Open Graph card ${path.relative(REPO_ROOT, pngPath)}: ` +
        `expected ${path.relative(REPO_ROOT, svgPath)}. A frontmatter ogImage ending ` +
        `in ${RENDERED_SUFFIX} is rendered from the SVG of the same stem.`,
    );
  }

  return contentHash(fs.readFileSync(svgPath, 'utf8'));
}

/**
 * A card needs rendering when its PNG is absent or when the manifest's hash no
 * longer matches the source — the two conditions `--check` reports.
 *
 * The manifest exists because a re-render cannot be byte-compared: PNG encoding
 * is not stable across Chromium versions, so an unchanged source would look
 * changed on a different machine.
 */
function isStale(card: Card): boolean {
  const recorded = readManifest(card.manifestPath)[path.basename(card.pngPath)];

  return !fs.existsSync(card.pngPath) || recorded !== sourceHash(card);
}

/**
 * The source is referenced rather than inlined so it is parsed as SVG.
 * Splicing it into the page would put it through the HTML parser, where any of
 * some forty HTML tag names appearing anywhere in the file ends foreign
 * content and spills the rest of the chart out as text — and authored content
 * cannot be asked to avoid those.
 *
 * `object-fit` does the letterboxing, so the framing follows from the canvas
 * alone: any source scales to fit and centres, whatever its own aspect, with
 * nothing cropped and no intrinsic-size arithmetic to get wrong.
 *
 * The page is laid out at the PNG's real pixel size rather than at the card's
 * dimensions under a doubled device scale factor. Those should be equivalent
 * and are not: headless Chromium rasterizes an SVG image under a scaled
 * device pixel ratio into a surface that drops the bottom of the drawing —
 * silently, and only in the screenshot.
 *
 * Chromium's default scheme is light, which is the one a social card wants:
 * every consumer composites it onto its own surface, and light is the one both
 * light and dark surfaces frame legibly.
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
  // The source is copied in beside the page rather than linked across the
  // filesystem: a file:// document's reach outside its own directory is not
  // something to depend on.
  const stagingDir = fs.mkdtempSync(path.join(os.tmpdir(), 'og-'));
  const svgName = path.basename(card.svgPath);
  const pagePath = path.join(stagingDir, 'card.html');

  fs.copyFileSync(card.svgPath, path.join(stagingDir, svgName));
  fs.writeFileSync(pagePath, cardPage(svgName));

  fs.mkdirSync(path.dirname(card.pngPath), { recursive: true });

  execFileSync(
    chromium,
    [
      '--headless',
      '--disable-gpu',
      '--no-sandbox',
      '--hide-scrollbars',
      // `--screenshot` alone can fire before the referenced SVG has painted,
      // yielding a blank card. Virtual time runs the page's clock forward to
      // the budget or to quiescence, whichever comes first.
      '--virtual-time-budget=10000',
      `--window-size=${PIXELS.width},${PIXELS.height}`,
      `--screenshot=${card.pngPath}`,
      `file://${pagePath}`,
    ],
    { stdio: 'inherit' },
  );

  console.log(
    `  rendered ${path.relative(REPO_ROOT, card.pngPath)} ` +
      `(${PIXELS.width}×${PIXELS.height})`,
  );
}

/**
 * Every manifest already in the content tree. Found by walking rather than
 * derived from the cards, so removing the last card in a directory still
 * surfaces the manifest it leaves behind.
 */
function manifestFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) return manifestFiles(entryPath);

    return entry.name === MANIFEST_NAME ? [entryPath] : [];
  });
}

/** The renders — recorded or on disk — that no frontmatter asks for any more. */
function orphans(cards: Card[]): string[] {
  const wanted = new Set(cards.map((card) => card.pngPath));
  const directories = new Set([
    ...cards.map((card) => path.dirname(card.pngPath)),
    ...manifestFiles(CONTENT_ROOT).map((file) => path.dirname(file)),
  ]);

  return [
    ...new Set(
      [...directories].flatMap((dir) =>
        [
          ...Object.keys(readManifest(path.join(dir, MANIFEST_NAME))),
          ...fs
            .readdirSync(dir)
            .filter((name) => name.endsWith(RENDERED_SUFFIX)),
        ].map((name) => path.join(dir, name)),
      ),
    ),
  ].filter((pngPath) => !wanted.has(pngPath));
}

/**
 * Rewrites each manifest to exactly the cards its directory now holds, and
 * removes the one a directory no longer needs.
 */
function writeManifests(cards: Card[]): void {
  const grouped = new Map<string, Card[]>();

  for (const card of cards) {
    grouped.set(card.manifestPath, [
      ...(grouped.get(card.manifestPath) ?? []),
      card,
    ]);
  }

  for (const manifestPath of manifestFiles(CONTENT_ROOT)) {
    if (!grouped.has(manifestPath)) fs.rmSync(manifestPath);
  }

  for (const [manifestPath, group] of grouped) {
    const entries = group
      .map((card): [string, string] => [
        path.basename(card.pngPath),
        sourceHash(card),
      ])
      .toSorted(([a], [b]) => a.localeCompare(b));

    fs.writeFileSync(
      manifestPath,
      `${JSON.stringify(Object.fromEntries(entries), undefined, 2)}\n`,
    );
  }
}

function main(): void {
  const cards = collectCards();
  const stale = cards.filter((card) => isStale(card));
  const gone = [...new Set(orphans(cards))];

  console.log(
    `${cards.length} Open Graph card(s) in the content tree, ${stale.length} to render, ` +
      `${gone.length} stale render(s) to prune.`,
  );

  if (checkOnly) {
    for (const card of stale)
      console.log(`  stale:   ${path.relative(REPO_ROOT, card.pngPath)}`);
    for (const pngPath of gone)
      console.log(`  orphan:  ${path.relative(REPO_ROOT, pngPath)}`);
    process.exitCode = stale.length > 0 || gone.length > 0 ? 1 : 0;
    return;
  }

  if (stale.length > 0) {
    const chromium = findChromium();
    for (const card of stale) renderCard(card, chromium);
  }

  for (const pngPath of gone) {
    if (fs.existsSync(pngPath)) fs.rmSync(pngPath);
    console.log(`  pruned ${path.relative(REPO_ROOT, pngPath)}`);
  }

  writeManifests(cards);
}

main();
