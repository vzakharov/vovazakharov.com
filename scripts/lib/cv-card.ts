/**
 * The CV's social card, one per framing, as a page for `og-render.ts` to
 * screenshot. Its copy is read, never retyped: name, tagline and the proof line
 * come from the message catalogue through the same variant merge the page uses,
 * so the card cannot say what the page has stopped saying — which is the drift
 * a hand-made card once shipped.
 *
 * English only. A `ru` card would double the committed weight for the site's
 * secondary surface, and the localized `og:description` already tells a
 * consumer which language it got.
 *
 * Runs under `tsx`, unlike the other render libraries: the catalogue is a JSON
 * import bare Node takes only with an attribute, and the merge lives in `src/`
 * behind the `@/` alias.
 */

import fs from 'node:fs';
import path from 'node:path';

import { printedUrl, SITE_CONFIG } from '@/shared/config';
import { PUBLIC_DIR } from '@/shared/content/collections';

import { cvMessages } from '@/pages/cv/lib/cv-messages';
import type { CvVariant } from '@/pages/cv/lib/cv-variants';

import {
  CANVAS,
  CANVAS_BACKGROUND,
  SCALE,
  type StagedPage,
} from './og-render.ts';

/** The portrait's file name inside the staging directory, and the `src` the page uses. */
const PORTRAIT = 'portrait.png';

/** The chart card's palette, so the two card kinds read as one site. */
const INK = '#0b0b0b';
const INK_DIM = '#52514e';

function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/**
 * Laid out at the canvas size in CSS pixels and zoomed to the screenshot's, so
 * the numbers below are the numbers a consumer's 1200×630 preview shows. HTML
 * rather than SVG because the proof line is a sentence, and SVG text does not
 * wrap.
 */
function cardPage(name: string, tagline: string, proof: string): string {
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html { zoom: ${SCALE}; }
      html, body { margin: 0; padding: 0; }
      body {
        box-sizing: border-box;
        width: ${CANVAS.width}px;
        height: ${CANVAS.height}px;
        padding: 0 96px;
        display: flex;
        align-items: center;
        gap: 72px;
        overflow: hidden;
        background: ${CANVAS_BACKGROUND};
        color: ${INK};
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      }
      img { flex: none; width: 280px; height: 280px; border-radius: 50%; }
      h1, p { margin: 0; }
      h1 { font-size: 54px; font-weight: 700; line-height: 1.1; }
      .tagline { margin-top: 18px; font-size: 30px; line-height: 1.3; opacity: 0.8; }
      .proof { margin-top: 24px; font-size: 22px; line-height: 1.45; color: ${INK_DIM}; }
      .site { margin-top: 28px; font-size: 18px; color: ${INK_DIM}; opacity: 0.8; }
    </style>
  </head>
  <body>
    <img src="${PORTRAIT}" alt="" />
    <div>
      <h1>${escapeHtml(name)}</h1>
      <p class="tagline">${escapeHtml(tagline)}</p>
      <p class="proof">${escapeHtml(proof)}</p>
      <p class="site">${escapeHtml(printedUrl(SITE_CONFIG.url).text)}</p>
    </div>
  </body>
</html>
`;
}

export function cvCard(variant: CvVariant): StagedPage {
  const { header, metadata } = cvMessages('en', variant).cv;

  return {
    page: cardPage(header.name, header.tagline, metadata.ogSuffix),
    files: {
      [PORTRAIT]: fs.readFileSync(
        path.join(PUBLIC_DIR, SITE_CONFIG.avatar.path),
      ),
    },
  };
}
