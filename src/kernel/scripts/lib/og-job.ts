/**
 * Rasterizes every Open Graph card a site advertises into a committed PNG. The
 * core is the card every site has — its own, from its mark — and each site's
 * `scripts/render-og.ts` adds its own as bundles, blog's `og-job.ts` the chart
 * cards its documents name.
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
 *   pnpm content:og <site>          # render what changed, prune what is gone
 *   pnpm content:og <site> --check  # report staleness, write nothing
 *
 * One run serves one site, because it is entered in that site's directory —
 * which is what `public/` resolves against.
 *
 * Runs under `tsx`, which the generated cards need, so `src/` is reached by
 * alias — and with the `react-server` condition, under which `server-only` is
 * the empty module it is in a build, so a case is parsed by the site's own
 * schema.
 */

import fs from 'node:fs';
import path from 'node:path';

import {
  PIXELS,
  PUBLIC_DIR,
  siteConfig,
} from '@/kernel/shared/config/index.node-safe';
import { contentHash } from '@/kernel/shared/lib/content-hash';
import { OG_CARD_SUFFIX, OG_CARD_SUFFIXES } from '@/kernel/shared/seo';

import { findScreenshotChromium } from './chromium.ts';
import {
  CANVAS_BACKGROUND,
  type Card,
  renderCard,
  type StagedPage,
} from './og-render.ts';
import { type ManifestRoots, runRenderJob } from './render-manifest.ts';
import { RENDERED_SITE, REPO_ROOT } from './site-tree.ts';

/**
 * Inset between the drawing and the card's edge, in canvas pixels. Load-bearing
 * as well as cosmetic: Chromium rasterizes an SVG image whose box ends on the
 * surface's last row short of the bottom.
 */
const PADDING = 24;

/** Records each render's source hash, beside the render it describes. */
const MANIFEST_NAME = 'og-renders.json';

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
export function svgCard(svgPath: string, pngPath: string): Card {
  const svgName = path.basename(svgPath);
  const svg = readSvg(svgPath, pngPath);

  return {
    outputPath: pngPath,
    sourceHash: contentHash(svg),
    page: svgPage(svgName),
    files: { [svgName]: svg },
  };
}

/**
 * A card generated as a page, its source the page and the files it references
 * — so the template, the copy it reads and every staged file are covered, and
 * editing any of them re-flags the card.
 */
export function generatedCard(staged: StagedPage, outputPath: string): Card {
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
 * The card a site unfurls as, where its bundles bring none: the site's mark,
 * authored as SVG and rendered that way on every page, so this is the one place
 * it has to be a raster. The pair is `avatar.vector` beside `avatar.path` — the
 * two cuts of a seal share no stem for the convention above to pair them by.
 */
function defaultSiteCards(): Card[] {
  const { avatar } = siteConfig(RENDERED_SITE);

  return avatar.vector === undefined
    ? []
    : [svgCard(path.join(PUBLIC_DIR, avatar.vector), siteCardPath())];
}

/** Where the site's own card is written, for a bundle that generates it. */
export function siteCardPath(): string {
  return path.join(PUBLIC_DIR, siteConfig(RENDERED_SITE).card.path);
}

/**
 * What a site adds to the core. `siteCards` replaces the card generated from
 * the site's mark; `manifestDirs` are the roots its cards are written under;
 * and `outputNames` are file names the run owns beyond the card suffixes.
 */
export type OgBundle = Partial<ManifestRoots> & {
  siteCards?: Card[];
  cards?: Card[];
  outputNames?: string[];
};

export async function renderOgCards(...bundles: OgBundle[]): Promise<void> {
  const bundled = bundles.flatMap(({ siteCards }) => siteCards ?? []);
  const siteCards = bundled.length > 0 ? bundled : defaultSiteCards();
  const outputNames = new Set(
    bundles.flatMap(({ outputNames: names }) => names ?? []),
  );

  await runRenderJob(
    {
      label: 'Open Graph card',
      manifestName: MANIFEST_NAME,
      isOutput: (name) =>
        OG_CARD_SUFFIXES.some((suffix) => name.endsWith(suffix)) ||
        outputNames.has(name),
      // A site card sits at the root of `public/`.
      manifestDirs: [
        ...new Set([
          ...(siteCards.length > 0 ? [PUBLIC_DIR] : []),
          ...bundles.flatMap(({ manifestDirs }) => manifestDirs ?? []),
        ]),
      ],
      entries: [...siteCards, ...bundles.flatMap(({ cards }) => cards ?? [])],
      render: (stale) => {
        const chromium = findScreenshotChromium();
        for (const card of stale) renderCard(card, chromium);
      },
    },
    process.argv.includes('--check'),
  );
}
