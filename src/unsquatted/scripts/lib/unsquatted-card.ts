/**
 * unsquatted.com's social card, as a page for `og-render.ts` to screenshot: the
 * mark and the wordmark over the hero's lede, beside a panel of the first
 * listed names, an empty name field closing it and a count of the rest.
 *
 * It reads what the site renders — the listed names through the module the
 * home page reads, the words from its catalogue — so adding a name re-flags
 * the card, and the card cannot say what the page has stopped saying.
 *
 * The wordmark is set in Fraunces as on the page, the font staged beside the
 * card from `@fontsource-variable/fraunces` — a `file://` page has no route to
 * the web font the site loads. The rest is in the faces the machine rendering
 * it has (DejaVu).
 */

import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { CANVAS, SCALE } from '@/kernel/shared/config/index.node-safe';

import { COPY, PICKS } from '@/unsquatted/pages/home/index.server-only';

import { escapeHtml, type StagedPage } from '@/kernel/scripts/lib/og-render';

/** Staged beside the page under this name, which is the `src` it uses. */
const FONT = 'wordmark.woff2';

/** Fraunces' weight and optical-size axes, as the site loads it. */
const fontPath = fileURLToPath(
  import.meta.resolve(
    '@fontsource-variable/fraunces/files/fraunces-latin-opsz-normal.woff2',
  ),
);

/** How many listed names the panel has room for above the name field. */
const SHOWN = 4;

const PAPER = '#f6f7f2';
const INK = '#1d2420';
const INK_DIM = '#5d6b63';
const INK_FAINT = '#a3aea7';
const GREEN = '#2f6b4f';
const RULE = '#e3e7df';

const SERIF = `Wordmark, serif`;
const SANS = `'DejaVu Sans', Arial, sans-serif`;
const MONO = `'DejaVu Sans Mono', monospace`;

const MARK = `<svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true">
        <rect width="64" height="64" rx="14" fill="${GREEN}" />
        <path d="M20 18v17a12 12 0 0 0 24 0V18" fill="none" stroke="${PAPER}" stroke-width="7" stroke-linecap="round" />
      </svg>`;

/** The lede, its first sentence the headline and the rest under it. */
function lede(): readonly [string, string] {
  const [head = '', ...rest] = `${COPY.lede} ${COPY.blazing}.`.split('. ');

  return [`${head}.`, rest.join('. ')];
}

const more = (count: number) =>
  count > 0 ? `+ ${count} more &amp; counting` : '&amp; counting';

export function unsquattedCard(): StagedPage {
  const [headline, subline] = lede();
  const rows = PICKS.slice(0, SHOWN)
    .map(
      ({ domain }) => `          <li>
            <span class="domain">${escapeHtml(domain)}</span>
            <span class="grab">${escapeHtml(COPY.verdict.free)}</span>
          </li>`,
    )
    .join('\n');

  return {
    page: `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      @font-face { font-family: "Wordmark"; src: url("${FONT}") format("woff2"); font-weight: 100 900; }
      html { zoom: ${SCALE}; }
      html, body { margin: 0; padding: 0; }
      body {
        box-sizing: border-box;
        width: ${CANVAS.width}px;
        height: ${CANVAS.height}px;
        padding: 56px 80px;
        display: flex;
        gap: 48px;
        overflow: hidden;
        background: ${PAPER};
        color: ${INK};
        font-family: ${SANS};
      }
      header svg { flex: none; }
      main { flex: 1; display: flex; flex-direction: column; min-width: 0; }
      header { display: flex; align-items: center; gap: 18px; }
      .wordmark {
        font-family: ${SERIF};
        font-size: 72px;
        font-weight: 700;
        letter-spacing: -0.02em;
        line-height: 1;
      }
      .headline { margin: auto 0 0; font-size: 42px; line-height: 1.33; }
      .subline { margin: 20px 0 0; font-size: 32px; color: ${INK_DIM}; }
      .headline sup { font-size: 0.6em; line-height: 0; }
      .note { margin: 16px 0 auto; font-size: 24px; color: ${INK_FAINT}; }
      .url { font-family: ${MONO}; font-size: 28px; font-weight: 700; color: ${GREEN}; }
      aside {
        flex: none;
        box-sizing: border-box;
        width: 448px;
        padding: 36px 32px 28px;
        border: 2px solid ${RULE};
        border-radius: 20px;
        background: #fff;
        display: flex;
        flex-direction: column;
      }
      h2 {
        margin: 0 0 12px;
        font-size: 22px;
        letter-spacing: 2px;
        text-transform: uppercase;
        color: ${INK_DIM};
      }
      ul { margin: 0; padding: 0; list-style: none; }
      li {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        padding: 22px 0;
        border-bottom: 2px solid ${RULE};
      }
      li:last-child { border-bottom: none; }
      .domain { font-family: ${MONO}; font-size: 27px; }
      .grab { font-size: 22px; color: ${GREEN}; }
      .field {
        margin-top: 12px;
        padding: 10px 16px;
        border: 2px solid ${RULE};
        border-radius: 10px;
        font-family: ${MONO};
        font-size: 25px;
        color: ${INK_FAINT};
      }
      .more { margin: auto 0 0; padding-top: 16px; font-size: 22px; color: ${INK_DIM}; }
    </style>
  </head>
  <body>
    <main>
      <header>
      ${MARK}
        <span class="wordmark">Unsquatted</span>
      </header>
      <p class="headline">${escapeHtml(headline).replace('*', '<sup>*</sup>')}</p>
      <p class="subline">${escapeHtml(subline)}</p>
      <p class="note">${escapeHtml(COPY.ledeNote)}</p>
      <span class="url">unsquatted.com</span>
    </main>
    <aside>
      <h2>${escapeHtml(COPY.listHeading)}</h2>
      <ul>
${rows}
      </ul>
      <div class="field">Your name…</div>
      <p class="more">${more(PICKS.length - SHOWN)}</p>
    </aside>
  </body>
</html>
`,
    files: { [FONT]: fs.readFileSync(fontPath) },
  };
}
