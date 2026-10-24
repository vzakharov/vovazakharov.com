/**
 * Майя's social cards, as pages for `og-render.ts` to screenshot: she stands at
 * the left edge, cut from the «Крылья» cover, and the copy sits beside her in
 * the site's Merriweather. The site card carries her name and the tagline; a
 * post's carries its byline line, title and description, read from the file
 * through the schema the build parses it with.
 *
 * The font is staged beside the card from `@fontsource/merriweather` — a
 * `file://` page has no route to the web font the site loads — in both of the
 * subsets her copy reaches for.
 */

import matter from 'gray-matter';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { CANVAS, SCALE } from '@/shared/config/index.node-safe';
import { siteConfig } from '@/shared/config/site-config';
import {
  collectionDir,
  isDocumentFile,
  type Slugged,
} from '@/shared/content/collections';
import { formatDocumentDate } from '@/shared/content/document-date';
import {
  type ArticleFrontmatter,
  articleFrontmatterSchema,
  type WithFrontmatter,
} from '@/shared/content/frontmatter';
import type { Titled } from '@/shared/typings';

import { contentFiles, REPO_ROOT } from './content-tree.ts';
import { headingTitle } from './docket.ts';
import {
  CANVAS_BACKGROUND,
  escapeHtml,
  INK,
  INK_DIM,
  type StagedPage,
} from './og-render.ts';

type BlogPost = Slugged & Titled & WithFrontmatter<ArticleFrontmatter>;

/** Staged beside the page under this name, which is the `src` it uses. */
const PORTRAIT = 'portrait.jpg';

/** The cover her avatar was cropped from; she stands in its left third. */
const COVER = path.join(
  REPO_ROOT,
  'apps/vova/public/music/assets/covers/wings.jpg',
);

/**
 * The body and the title, each in both scripts; a cut is staged as
 * `<subset>-<weight>.woff2`. Each specifier is spelled whole, which is how knip
 * sees the package used.
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

/** What one card prints: the small line over the title, and an optional line under it. */
type CardCopy = Titled & { kicker: string; line?: string };

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
        background: ${CANVAS_BACKGROUND};
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

/** Every post, parsed through the schema the site builds with. */
export function readBlog(): BlogPost[] {
  return contentFiles(isDocumentFile, [collectionDir('maya-blog')]).map(
    (file) => {
      const { data, content } = matter(fs.readFileSync(file, 'utf8'));
      const frontmatter = articleFrontmatterSchema.safeParse(data);

      if (!frontmatter.success) {
        throw new Error(`Invalid frontmatter in ${file}`, {
          cause: frontmatter.error,
        });
      }

      return {
        slug: path.basename(file, '.md'),
        title: headingTitle(content, file),
        frontmatter: frontmatter.data,
      };
    },
  );
}

/** The byline line is the index card's, so the card and the page say it alike. */
export function mayaPostCard({ title, frontmatter }: BlogPost): StagedPage {
  return stagedCard({
    kicker: `${siteConfig('maya').name} · ${formatDocumentDate(frontmatter.date, 'ru')}`,
    title,
    line: frontmatter.description,
  });
}
