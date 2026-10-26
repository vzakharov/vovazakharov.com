/**
 * Майя's social cards, as pages for `og-render.ts` to screenshot: she stands at
 * the left edge, cut from the «Крылья» cover, and the copy sits beside her in
 * the site's Merriweather. The site card carries her name and the tagline; a
 * post's carries its byline line, title and description. A post or page with a
 * drawing of its own shows the drawing in her place, on the paper she draws on,
 * and keeps her face as a mark beside the byline.
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
import { collectionDir } from '@/shared/content/collections';
import { formatDocumentDate } from '@/shared/content/document-date';
import type { ArticleFrontmatter } from '@/shared/content/frontmatter';

import { REPO_ROOT } from './content-tree.ts';
import {
  CANVAS_BACKGROUND,
  type CardHeading,
  escapeHtml,
  INK,
  INK_DIM,
  type StagedPage,
} from './og-render.ts';
import type { CollectionEntry } from './read-collection.ts';

type BlogPost = CollectionEntry<ArticleFrontmatter>;

/** Staged beside the page under this name, which is the `src` it uses. */
const PORTRAIT = 'portrait.jpg';

/** The cover her avatar was cropped from; she stands in its left third. */
const COVER = path.join(
  REPO_ROOT,
  'apps/vova/public/music/assets/covers/wings.jpg',
);

/** Her face beside the byline of a card her drawing fills, staged under this name. */
const MARK = 'mark.png';

/**
 * The paper her drawings are on, which a drawn card is laid out on too, so a
 * drawing of any aspect letterboxes into it without a seam. Each drawing paints
 * it as its own background rect; one on another paper shows its edges here.
 */
const PAPER = '#f5efe3';

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

/**
 * A card's picture: her figure, or a drawing staged under `name` — which keeps
 * the source's extension, since the page loads it by name.
 */
type Picture = { kind: 'figure' } | { kind: 'drawing'; name: string };

function pictureStyle(picture: Picture): string {
  return picture.kind === 'figure'
    ? `      body { background: ${CANVAS_BACKGROUND}; }
      /* Her figure, the balloon and the hand she holds: the cover's left half. */
      .picture { width: 400px; object-fit: cover; object-position: 12% 0; }`
    : `      body { background: ${PAPER}; }
      .picture { width: 560px; object-fit: contain; }
      .mark {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        vertical-align: middle;
        margin-right: 14px;
      }`;
}

function cardPage({ kicker, title, line }: CardCopy, picture: Picture): string {
  const src = picture.kind === 'figure' ? PORTRAIT : picture.name;
  const mark =
    picture.kind === 'figure'
      ? ''
      : `<img class="mark" src="${MARK}" alt="" />`;

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
        color: ${INK};
        font-family: "Card", serif;
      }
      .picture { flex: none; height: 100%; }
${pictureStyle(picture)}
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
    <img class="picture" src="${src}" alt="" />
    <main>
      <p class="kicker">${mark}${escapeHtml(kicker)}</p>
      <p class="title">${escapeHtml(title)}</p>
${line === undefined ? '' : `      <p class="line">${escapeHtml(line)}</p>\n`}    </main>
  </body>
</html>
`;
}

/** Her face, as the site serves it. */
const markFile = (): Buffer =>
  fs.readFileSync(
    path.join(REPO_ROOT, 'apps/maya/public', siteConfig('maya').avatar.path),
  );

/** `drawing` is a path to the drawing that takes her figure's place, if any. */
function stagedCard(copy: CardCopy, drawing?: string): StagedPage {
  const fonts = Object.fromEntries(
    FONT_CUTS.map((cut) => [stagedFontName(cut), fontFile(cut)]),
  );

  if (drawing === undefined) {
    return {
      page: cardPage(copy, { kind: 'figure' }),
      files: { [PORTRAIT]: fs.readFileSync(COVER), ...fonts },
    };
  }

  const name = `drawing${path.extname(drawing)}`;

  return {
    page: cardPage(copy, { kind: 'drawing', name }),
    files: {
      [name]: fs.readFileSync(drawing),
      [MARK]: markFile(),
      ...fonts,
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

/**
 * The byline line is the index card's, so the card and the page say it alike.
 * The drawing is the post's `cardImage`, the one its index card shows too.
 */
export function mayaPostCard({ title, frontmatter }: BlogPost): StagedPage {
  const { cardImage, date, description } = frontmatter;

  return stagedCard(
    {
      kicker: `${siteConfig('maya').name} · ${formatDocumentDate(date, 'ru')}`,
      title,
      line: description,
    },
    cardImage === undefined
      ? undefined
      : path.resolve(collectionDir('maya-blog'), cardImage),
  );
}

/**
 * A page of hers that is not a post — a toy — carded under its own heading,
 * with the drawing at `drawing`, a path under her site's `public/`.
 */
export function mayaPageCard(copy: CardCopy & { drawing: string }): StagedPage {
  const { drawing, ...heading } = copy;

  return stagedCard(heading, path.join(REPO_ROOT, 'apps/maya/public', drawing));
}
