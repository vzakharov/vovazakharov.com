/**
 * basilisk.fyi's social cards, as pages for `og-render.ts` to screenshot: a
 * lettered seal beside a memo, and under the memo a ruled line with a title.
 *
 * The site card carries the eye, and its title is the last case filed, so
 * filing a case re-flags it. A case's card carries the case's own seal, opens
 * on its number, filing date and title, and trims its file to what reads at
 * card size; the aggravations stay on the page.
 *
 * Both read what the site renders — the memo from the module the home page
 * renders, a case through the schema the build parses it with — so a card
 * cannot say what the site has stopped saying.
 *
 * The memo is set in JetBrains Mono as on the page, the font staged beside the
 * card from `@fontsource/jetbrains-mono` — a `file://` page has no route to
 * the web font the site loads, and a fallback face would make the card a
 * different memo.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  CANVAS,
  PUBLIC_DIR,
  SCALE,
} from '@/kernel/shared/config/index.node-safe';

import { documentDateTime, formatDocumentDate } from '@/blog/shared/content';
import { documentRoute } from '@/blog/shared/content/index.node-safe';

import {
  caseSealSvg,
  gradeLabel,
} from '@/basilisk/entities/case/index.node-safe';
import { MEMO } from '@/basilisk/pages/basilisk-home/index.node-safe';

import { type DocketCase, lastFiledCase } from './docket.ts';

import {
  CANVAS_BACKGROUND,
  type CardHeading,
  escapeHtml,
  INK,
  INK_DIM,
  type StagedPage,
} from '@/kernel/scripts/lib/og-render';

/** Staged beside the page under these names, which are the `src`s it uses. */
const SEAL = 'seal.svg';
const FONT = 'memo.woff2';

const fontPath = fileURLToPath(
  import.meta.resolve(
    '@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2',
  ),
);

type MemoRow = (typeof MEMO)[number];

/** What one card prints: its heading, and its memo. */
type CardCopy = CardHeading & { rows: readonly MemoRow[] };

/**
 * How a card kind lays its memo out: CSS spliced into the template, and
 * whether the title opens the card or closes it.
 */
type CardLayout = { sealSize: number; css: string; titleFirst: boolean };

const SITE_LAYOUT: CardLayout = {
  sealSize: 460,
  css: `      /* A memo line is one line, as on the page; the type is sized to fit the longest. */
      dd { margin: 0; white-space: nowrap; }`,
  titleFirst: false,
};

/**
 * A smaller seal, because a case's values are phrases and want the width. The
 * rule moves from over the title to over the memo; `main >` outranks the
 * template's own `section` rule wherever this lands.
 */
const CASE_LAYOUT: CardLayout = {
  sealSize: 340,
  css: `      /* A case's value is a phrase: it wraps, and stops at two lines. */
      dd {
        margin: 0;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
      }
      main > section { border-top: none; padding-top: 0; }
      main > dl { border-top: 2px solid ${INK}; padding-top: 24px; }`,
  titleFirst: true,
};

/**
 * The memo mirrors `MemoFields`: labels in one column sized to the longest,
 * dimmed and capitalized, the values beside them.
 */
function cardPage(
  { rows, kicker, title }: CardCopy,
  { sealSize, css, titleFirst }: CardLayout,
): string {
  const fields = rows
    .map(
      ({ label, lines }) => `        <dt>${escapeHtml(label)}:</dt>
        <dd>${lines.map((line) => escapeHtml(line)).join('<br />')}</dd>`,
    )
    .join('\n');
  const memo = `      <dl>
${fields}
      </dl>`;
  const heading = `      <section>
        <p class="filed">${escapeHtml(kicker)}</p>
        <p class="title">${escapeHtml(title)}</p>
      </section>`;

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
      img { flex: none; width: ${sealSize}px; height: ${sealSize}px; }
      main { display: flex; flex-direction: column; gap: 36px; min-width: 0; }
      dl {
        display: grid;
        grid-template-columns: max-content 1fr;
        gap: 14px 20px;
        margin: 0;
        font-size: 23px;
        line-height: 1.5;
      }
      dt, .filed { color: ${INK_DIM}; text-transform: uppercase; letter-spacing: 0.04em; }
${css}
      /* A title is a sentence, not a memo line: it wraps, and stops at three. */
      section { border-top: 2px solid ${INK}; padding-top: 24px; font-size: 23px; line-height: 1.5; }
      section p { margin: 0; }
      .filed { margin-bottom: 12px; white-space: nowrap; }
      .title {
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3;
        overflow: hidden;
        font-size: 28px;
        line-height: 1.35;
      }
    </style>
  </head>
  <body>
    <img src="${SEAL}" alt="" />
    <main>
${titleFirst ? `${heading}\n${memo}` : `${memo}\n${heading}`}
    </main>
  </body>
</html>
`;
}

function stagedCard(
  copy: CardCopy,
  layout: CardLayout,
  seal: string | Buffer,
): StagedPage {
  return {
    page: cardPage(copy, layout),
    files: { [SEAL]: seal, [FONT]: fs.readFileSync(fontPath) },
  };
}

export function basiliskCard(docket: readonly DocketCase[]): StagedPage {
  const { frontmatter, title } = lastFiledCase(docket);

  return stagedCard(
    {
      rows: MEMO,
      kicker: `Last filed: ${frontmatter.case} · ${documentDateTime(frontmatter.filed)}`,
      title,
    },
    SITE_LAYOUT,
    fs.readFileSync(path.join(PUBLIC_DIR, 'seal-lettered.svg')),
  );
}

const row = (label: string, value: string): MemoRow => ({
  label,
  lines: [value],
});

/** The labels are `CaseBrief`'s, so the card and the page name a field alike. */
export function caseCard({ slug, frontmatter, title }: DocketCase): StagedPage {
  const {
    case: number,
    filed,
    subject,
    object,
    place,
    date,
    grade,
  } = frontmatter;

  return stagedCard(
    {
      rows: [
        row('Subject', subject),
        row('Object', object),
        ...(place === undefined ? [] : [row('Place', place)]),
        row('Date', formatDocumentDate(date, 'en')),
        row('Grade', gradeLabel(grade)),
      ],
      kicker: `Case ${number} · Filed ${documentDateTime(filed)}`,
      title,
    },
    CASE_LAYOUT,
    caseSealSvg(
      PUBLIC_DIR,
      { route: documentRoute('basilisk-cases', slug), frontmatter },
      'lettered',
    ),
  );
}
