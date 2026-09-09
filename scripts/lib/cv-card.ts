/**
 * The CV's social card, one per framing, as a page for `og-render.ts` to
 * screenshot. Its copy is read, never retyped: every string on it comes from the
 * message catalogue through the same variant merge the page uses, so the card
 * cannot say what the page has stopped saying.
 *
 * Runs under `tsx`, unlike the other render libraries: the catalogue is a JSON
 * import bare Node takes only with an attribute.
 */

import fs from 'node:fs';
import path from 'node:path';

import { printedUrl, SITE_CONFIG } from '@/shared/config';
import { PUBLIC_DIR } from '@/shared/content/collections';
import type { Labeled, Named } from '@/shared/typings';

import { cvMessages } from '@/pages/cv/lib/cv-messages';
import { OFFER_BLOCKS } from '@/pages/cv/lib/cv-offer';
import type { CvVariant } from '@/pages/cv/lib/cv-variants';

import {
  CANVAS,
  CANVAS_BACKGROUND,
  SCALE,
  type StagedPage,
} from './og-render.ts';

/** Staged beside the page under this name, which is the `src` it uses. */
const PORTRAIT = 'portrait.png';

/** The chart card's palette, so the two card kinds read as one site. */
const INK = '#0b0b0b';
const INK_DIM = '#52514e';
const RULE = '#dcdad5';

function escapeHtml(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

type CardCopy = Named & {
  tagline: string;
  offerTitle: string;
  offer: string[];
  addresses: string[];
};

/**
 * Laid out at the canvas size and zoomed to the screenshot's, so the numbers
 * below are the ones a consumer's preview shows. HTML rather than SVG because
 * the offer bullets wrap and SVG text does not.
 *
 * Two columns rather than one stacked block: a framing whose offer is five
 * few-word labels leaves a stacked plate's lower half empty.
 */
function cardPage({ name, tagline, offerTitle, offer, addresses }: CardCopy) {
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
        padding: 60px 72px;
        display: flex;
        align-items: stretch;
        gap: 60px;
        overflow: hidden;
        background: ${CANVAS_BACKGROUND};
        color: ${INK};
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      }
      h1, h2, p, ul, li { margin: 0; padding: 0; }
      .identity {
        flex: none;
        width: 430px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      img { width: 148px; height: 148px; border-radius: 50%; }
      h1 { margin-top: 28px; font-size: 46px; font-weight: 700; line-height: 1.1; }
      .tagline { margin-top: 14px; font-size: 24px; line-height: 1.3; color: ${INK_DIM}; }
      .addresses { display: flex; flex-direction: column; gap: 8px; font-size: 19px; color: ${INK_DIM}; }
      .offer {
        flex: 1;
        padding-left: 60px;
        border-left: 1px solid ${RULE};
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      h2 {
        margin-bottom: 26px;
        font-size: 18px;
        font-weight: 600;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: ${INK_DIM};
      }
      ul { display: flex; flex-direction: column; gap: 16px; list-style: none; }
      li { display: flex; gap: 14px; font-size: 23px; line-height: 1.35; }
      li::before { content: "—"; flex: none; color: ${INK_DIM}; }
    </style>
  </head>
  <body>
    <div class="identity">
      <div>
        <img src="${PORTRAIT}" alt="" />
        <h1>${escapeHtml(name)}</h1>
        <p class="tagline">${escapeHtml(tagline)}</p>
      </div>
      <div class="addresses">
${addresses.map((address) => `        <span>${escapeHtml(address)}</span>`).join('\n')}
      </div>
    </div>
    <div class="offer">
      <h2>${escapeHtml(offerTitle)}</h2>
      <ul>
${offer.map((item) => `        <li>${escapeHtml(item)}</li>`).join('\n')}
      </ul>
    </div>
  </body>
</html>
`;
}

export function cvCard(variant: CvVariant): StagedPage {
  const { header, contact, whatIOffer } = cvMessages('en', variant).cv;
  const { name, tagline } = header;

  const [headBlock] = OFFER_BLOCKS[variant];
  const items: ReadonlyArray<string | Labeled> =
    whatIOffer.blocks[headBlock].items;

  return {
    page: cardPage({
      name,
      tagline,
      offerTitle: whatIOffer.title,
      offer: items.map((item) =>
        typeof item === 'string' ? item : item.label,
      ),
      addresses: [
        printedUrl(SITE_CONFIG.url).text,
        contact.github,
        contact.linkedin,
      ],
    }),
    files: {
      [PORTRAIT]: fs.readFileSync(
        path.join(PUBLIC_DIR, SITE_CONFIG.avatar.path),
      ),
    },
  };
}
