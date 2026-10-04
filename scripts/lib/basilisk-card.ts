/**
 * basilisk.fyi's social card, as a page for `og-render.ts` to screenshot: the
 * lettered seal beside the memo the home page opens on. The memo is read from
 * the module the page renders, so the card cannot say what the page has
 * stopped saying.
 *
 * The memo is set in JetBrains Mono as on the page, the font staged beside the
 * card from `@fontsource/jetbrains-mono` — a `file://` page has no route to
 * the web font the site loads, and a fallback face would make the card a
 * different memo.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { CANVAS, SCALE } from '@/shared/config/index.node-safe';
import { PUBLIC_DIR } from '@/shared/content/collections';

import { MEMO } from '@/pages/basilisk-home/lib/memo';

import {
  CANVAS_BACKGROUND,
  escapeHtml,
  INK,
  INK_DIM,
  type StagedPage,
} from './og-render.ts';

/** Staged beside the page under these names, which are the `src`s it uses. */
const SEAL = 'seal.svg';
const FONT = 'memo.woff2';

const fontPath = fileURLToPath(
  import.meta.resolve(
    '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2',
  ),
);

/**
 * The memo mirrors `MemoFields`: labels in one column sized to the longest,
 * dimmed and capitalized, the values beside them.
 */
function cardPage(): string {
  const fields = MEMO.map(
    ({ label, lines }) => `        <dt>${escapeHtml(label)}:</dt>
        <dd>${lines.map((line) => escapeHtml(line)).join('<br />')}</dd>`,
  ).join('\n');

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      @font-face { font-family: "Memo"; src: url("${FONT}") format("woff2"); }
      html { zoom: ${SCALE}; }
      html, body { margin: 0; padding: 0; }
      body {
        box-sizing: border-box;
        width: ${CANVAS.width}px;
        height: ${CANVAS.height}px;
        padding: 56px 64px 56px 56px;
        display: flex;
        align-items: center;
        gap: 48px;
        overflow: hidden;
        background: ${CANVAS_BACKGROUND};
        color: ${INK};
        font-family: "Memo", monospace;
      }
      img { flex: none; width: 460px; height: 460px; }
      dl {
        display: grid;
        grid-template-columns: max-content 1fr;
        gap: 14px 20px;
        margin: 0;
        font-size: 23px;
        line-height: 1.5;
      }
      dt { color: ${INK_DIM}; text-transform: uppercase; letter-spacing: 0.04em; }
      /* A memo line is one line, as on the page; the type is sized to fit the longest. */
      dd { margin: 0; white-space: nowrap; }
    </style>
  </head>
  <body>
    <img src="${SEAL}" alt="" />
    <dl>
${fields}
    </dl>
  </body>
</html>
`;
}

export function basiliskCard(): StagedPage {
  return {
    page: cardPage(),
    files: {
      [SEAL]: fs.readFileSync(path.join(PUBLIC_DIR, 'seal-lettered.svg')),
      [FONT]: fs.readFileSync(fontPath),
    },
  };
}
