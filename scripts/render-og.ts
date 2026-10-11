#!/usr/bin/env tsx

/**
 * Rasterizes every Open Graph card the site advertises into a committed PNG:
 * the chart cards a content document's frontmatter names, from the SVG beside
 * each, the CV's card per framing, from a page generated off the message
 * catalogue, and basilisk.fyi's card per case, from a page generated off its
 * frontmatter — and the music section's cover collages, as JPEGs.
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
 *   pnpm content:og:<site>          # render what changed, prune what is gone
 *   pnpm content:og:<site> --check  # report staleness, write nothing
 *
 * One run serves one site, because it is entered in that app's directory —
 * which is what `public/` resolves against.
 *
 * Runs under `tsx`, which `lib/cv-card.ts` needs, so `src/` is reached by alias
 * — and with the `react-server` condition, under which `server-only` is the
 * empty module it is in a build, so a case is parsed by the site's own schema.
 */

import fs from 'node:fs';
import path from 'node:path';

import { PIXELS } from '@/shared/config/index.node-safe';
import { siteConfig } from '@/shared/config/site-config';
import {
  collectionsForSite,
  documentRoute,
  PUBLIC_DIR,
} from '@/shared/content/collections';
import { contentHash } from '@/shared/content/content-hash';
import { MUSIC_PROJECT_NAMES } from '@/shared/music-catalogue';
import { OG_CARD_SUFFIX, OG_CARD_SUFFIXES, routeCardPath } from '@/shared/seo';

import { cvCardPath, cvPath } from '@/pages/cv/lib/cv-urls';
import { CV_VARIANTS } from '@/pages/cv/lib/cv-variants';
import {
  artistCollage,
  artistCollageCovers,
  MUSIC_COLLAGE,
  musicCollageCovers,
} from '@/pages/music/lib/pictures';

import { basiliskCard, caseCard } from './lib/basilisk-card.ts';
import { findScreenshotChromium } from './lib/chromium.ts';
import {
  CONTENT_DIRS,
  contentFiles,
  RENDERED_SITE,
  REPO_ROOT,
} from './lib/content-tree.ts';
import { cvCard } from './lib/cv-card.ts';
import type { DocketCase } from './lib/docket.ts';
import { musicCollage } from './lib/music-collage.ts';
import {
  CANVAS_BACKGROUND,
  type Card,
  renderCard,
  type StagedPage,
} from './lib/og-render.ts';
import { readDocket } from './lib/read-docket.ts';
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

/** The CV is one site's page, so the other sites' runs neither card it nor walk its directory. */
const CARDS_CV = RENDERED_SITE === 'vova';

/** The music section is one site's, as the CV is. */
const CARDS_MUSIC = collectionsForSite(RENDERED_SITE).includes('music');

/** The cases, on the run of the site that files them; read once for both card kinds. */
const DOCKET: readonly DocketCase[] = collectionsForSite(
  RENDERED_SITE,
).includes('basilisk-cases')
  ? readDocket()
  : [];

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

/** One card rasterized from one authored SVG — the whole of what the drawn cards are. */
function svgCard(svgPath: string, pngPath: string): Card {
  const svgName = path.basename(svgPath);
  const svg = readSvg(svgPath, pngPath);

  return {
    outputPath: pngPath,
    sourceHash: contentHash(svg),
    page: svgPage(svgName),
    files: { [svgName]: svg },
  };
}

/** One card per distinct PNG the frontmatter asks for, its source the SVG of the same stem. */
function chartCards(): Card[] {
  const pngPaths = [
    ...new Set(
      ogImagePaths().filter((pngPath) => pngPath.endsWith(OG_CARD_SUFFIX)),
    ),
  ];

  return pngPaths.map((pngPath) =>
    svgCard(`${pngPath.slice(0, -OG_CARD_SUFFIX.length)}.svg`, pngPath),
  );
}

/**
 * A card generated as a page, its source the page and the files it references
 * — so the template, the copy it reads and every staged file are covered, and
 * editing any of them re-flags the card.
 */
function generatedCard(staged: StagedPage, outputPath: string): Card {
  const files = Object.entries(staged.files)
    .toSorted(([a], [b]) => a.localeCompare(b))
    .map(
      ([name, content]) => `${name}:${Buffer.from(content).toString('base64')}`,
    );

  return {
    ...staged,
    outputPath,
    sourceHash: contentHash([staged.page, ...files].join('\n')),
  };
}

/**
 * The card a site unfurls as. basilisk.fyi's is generated, the seal beside the
 * home page's memo. Elsewhere it is the site's mark: authored as SVG and
 * rendered that way on every page, so this is the one place it has to be a
 * raster, and the pair is `avatar.vector` beside `avatar.path` — the two cuts
 * of a seal share no stem for the convention above to pair them by.
 */
function siteCards(): Card[] {
  const { avatar } = siteConfig(RENDERED_SITE);
  const outputPath = path.join(PUBLIC_DIR, avatar.path);

  if (RENDERED_SITE === 'basilisk') {
    return [generatedCard(basiliskCard(DOCKET), outputPath)];
  }

  return avatar.vector === undefined
    ? []
    : [svgCard(path.join(PUBLIC_DIR, avatar.vector), outputPath)];
}

/** One card per framing. */
function cvCards(): Card[] {
  if (!CARDS_CV) return [];

  return CV_VARIANTS.map((variant) =>
    generatedCard(cvCard(variant), path.join(PUBLIC_DIR, cvCardPath(variant))),
  );
}

function collageCard(covers: readonly string[], card: string): Card {
  return generatedCard(musicCollage(covers), path.join(PUBLIC_DIR, card));
}

/**
 * The index's collage and each artist's that has one, at the addresses their
 * pages' metadata points to.
 */
function musicCards(): Card[] {
  if (!CARDS_MUSIC) return [];

  return [
    collageCard(musicCollageCovers(), MUSIC_COLLAGE),
    ...MUSIC_PROJECT_NAMES.flatMap((artist) => {
      const covers = artistCollageCovers(artist);

      return covers.length === 0
        ? []
        : [collageCard(covers, artistCollage(artist))];
    }),
  ];
}

/** One card per case, at the case's route plus the card suffix — where its page's metadata points. */
function caseCards(): Card[] {
  return DOCKET.map((filed) =>
    generatedCard(
      caseCard(filed),
      path.join(
        PUBLIC_DIR,
        routeCardPath(documentRoute('basilisk-cases', filed.slug)),
      ),
    ),
  );
}

const siteEntries = siteCards();

await runRenderJob(
  {
    label: 'Open Graph card',
    manifestName: MANIFEST_NAME,
    isOutput: (name) =>
      OG_CARD_SUFFIXES.some((suffix) => name.endsWith(suffix)),
    // A site card and the music index's sit at the root of `public/`, which
    // the collection walk only reaches where the collection is rooted there.
    manifestDirs: [
      ...new Set([
        ...CONTENT_DIRS,
        ...(CARDS_CV ? [CV_CARD_DIR] : []),
        ...(siteEntries.length > 0 || CARDS_MUSIC ? [PUBLIC_DIR] : []),
      ]),
    ],
    entries: [
      ...chartCards(),
      ...siteEntries,
      ...cvCards(),
      ...musicCards(),
      ...caseCards(),
    ],
    render: (stale) => {
      const chromium = findScreenshotChromium();
      for (const card of stale) renderCard(card, chromium);
    },
  },
  process.argv.includes('--check'),
);
