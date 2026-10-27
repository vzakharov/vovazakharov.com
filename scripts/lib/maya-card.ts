/**
 * Майя's social cards, as pages for `og-render.ts` to screenshot: she stands at
 * the left edge, cut from the «Крылья» cover, and the copy sits beside her on
 * her paper, in her drawings' ink. The face is Merriweather rather than the
 * site's Georgia, which a Linux renderer does not carry and whose free
 * stand-in, Gelasio, has no Cyrillic. The site card carries her name and the
 * tagline; a post's carries its byline line, title and description. A post or
 * toy with a drawing of its own is carded as the drawing alone: the unfurl
 * prints the title and description under it, and the drawing is signed.
 *
 * The font is staged beside the card from `@fontsource/merriweather` — a
 * `file://` page has no route to the web font the site loads — in both of the
 * subsets her copy reaches for.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { CANVAS, SCALE } from '@/shared/config/index.node-safe';
import { siteConfig } from '@/shared/config/site-config';
import { collectionDir, PUBLIC_DIR } from '@/shared/content/collections';
import { formatDocumentDate } from '@/shared/content/document-date';
import type { ArticleFrontmatter } from '@/shared/content/frontmatter';

import { REPO_ROOT } from './content-tree.ts';
import { type CardHeading, escapeHtml, type StagedPage } from './og-render.ts';
import type { CollectionEntry } from './read-collection.ts';

type BlogPost = CollectionEntry<ArticleFrontmatter>;

/** Staged beside the page under this name, which is the `src` it uses. */
const PORTRAIT = 'portrait.jpg';

/** The cover her avatar was cropped from; she stands in its left third. */
const COVER = path.join(
  REPO_ROOT,
  'apps/vova/public/music/assets/covers/wings.jpg',
);

/**
 * The paper her drawings are on, which every card of hers is laid out on, so a
 * drawing of any aspect letterboxes into it without a seam. Each drawing paints
 * it as its own background rect; one on another paper shows its edges here.
 */
const PAPER = '#f5efe3';

/** The ink her drawings are lined in, and the grey their small print is in. */
const INK = '#2b2622';
const INK_DIM = '#8c8781';

/**
 * The body and the title, each in both scripts. Each specifier is spelled
 * whole, which is how knip sees the package used.
 */
const FONT_CUTS = [
  {
    subset: 'latin',
    weight: 400,
    source: import.meta.resolve(
      '@fontsource/merriweather/files/merriweather-latin-400-normal.woff2',
    ),
  },
  {
    subset: 'cyrillic',
    weight: 400,
    source: import.meta.resolve(
      '@fontsource/merriweather/files/merriweather-cyrillic-400-normal.woff2',
    ),
  },
  {
    subset: 'latin',
    weight: 700,
    source: import.meta.resolve(
      '@fontsource/merriweather/files/merriweather-latin-700-normal.woff2',
    ),
  },
  {
    subset: 'cyrillic',
    weight: 700,
    source: import.meta.resolve(
      '@fontsource/merriweather/files/merriweather-cyrillic-700-normal.woff2',
    ),
  },
] as const;

type FontCut = (typeof FONT_CUTS)[number];

/** `@fontsource`'s own range for the subset, so a Latin glyph never falls to it. */
const CYRILLIC_RANGE = 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116';

const stagedFontName = ({ subset, weight }: FontCut) =>
  `${subset}-${weight}.woff2`;

const fontFile = ({ source }: FontCut): Buffer =>
  fs.readFileSync(fileURLToPath(source));

function fontFaces(): string {
  return FONT_CUTS.map((cut) => {
    const range =
      cut.subset === 'cyrillic' ? ` unicode-range: ${CYRILLIC_RANGE};` : '';

    return `      @font-face { font-family: "Card"; font-weight: ${cut.weight}; src: url("${stagedFontName(cut)}") format("woff2");${range} }`;
  }).join('\n');
}

/** What one card prints: its heading, and an optional line under the title. */
type CardCopy = CardHeading & { line?: string };

function cardPage({ kicker, title, line }: CardCopy): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
${fontFaces()}
      html { zoom: ${SCALE}; }
      html, body { margin: 0; padding: 0; }
      body {
        box-sizing: border-box;
        width: ${CANVAS.width}px;
        height: ${CANVAS.height}px;
        display: flex;
        overflow: hidden;
        background: ${PAPER};
        color: ${INK};
        font-family: "Card", serif;
      }
      /* Her figure, the balloon and the hand she holds: the cover's left half. */
      img {
        flex: none;
        width: 400px;
        height: 100%;
        object-fit: cover;
        object-position: 12% 0;
      }
      main {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 28px;
        padding: 56px 64px;
        min-width: 0;
      }
      p { margin: 0; }
      .kicker { color: ${INK_DIM}; font-size: 22px; }
      .title {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        overflow: hidden;
        font-size: 56px;
        font-weight: 700;
        line-height: 1.2;
      }
      .line {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 4;
        overflow: hidden;
        color: ${INK_DIM};
        font-size: 26px;
        line-height: 1.5;
      }
    </style>
  </head>
  <body>
    <img src="${PORTRAIT}" alt="" />
    <main>
      <p class="kicker">${escapeHtml(kicker)}</p>
      <p class="title">${escapeHtml(title)}</p>
${line === undefined ? '' : `      <p class="line">${escapeHtml(line)}</p>\n`}    </main>
  </body>
</html>
`;
}

function stagedCard(copy: CardCopy): StagedPage {
  return {
    page: cardPage(copy),
    files: {
      [PORTRAIT]: fs.readFileSync(COVER),
      ...Object.fromEntries(
        FONT_CUTS.map((cut) => [stagedFontName(cut), fontFile(cut)]),
      ),
    },
  };
}

export function mayaSiteCard(): StagedPage {
  const { name, tagline, url } = siteConfig('maya');

  return stagedCard({
    kicker: new URL(url).host,
    title: name,
    line: tagline,
  });
}

/** The drawing at `drawing`, contained in the card on her paper. */
function drawnCard(drawing: string): StagedPage {
  const name = `drawing${path.extname(drawing)}`;

  return {
    page: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html { zoom: ${SCALE}; }
      html, body { margin: 0; padding: 0; }
      body {
        width: ${CANVAS.width}px;
        height: ${CANVAS.height}px;
        overflow: hidden;
        background: ${PAPER};
      }
      img { display: block; width: 100%; height: 100%; object-fit: contain; }
    </style>
  </head>
  <body><img src="${name}" alt="" /></body>
</html>
`,
    files: { [name]: fs.readFileSync(drawing) },
  };
}

/**
 * The drawing its index card shows too, where it has one; else the byline
 * line, the index card's, so the card and the page say it alike.
 */
export function mayaPostCard({
  title,
  frontmatter,
  cardImage,
}: BlogPost): StagedPage {
  const { date, description } = frontmatter;

  if (cardImage !== undefined) {
    return drawnCard(path.resolve(collectionDir('maya-blog'), cardImage));
  }

  return stagedCard({
    kicker: `${siteConfig('maya').name} · ${formatDocumentDate(date, siteConfig('maya').locale)}`,
    title,
    line: description,
  });
}

/** A toy's card: its drawing, a path under her site's `public/`. */
export function mayaToyCard(drawing: string): StagedPage {
  return drawnCard(path.join(PUBLIC_DIR, drawing));
}
