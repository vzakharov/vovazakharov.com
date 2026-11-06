/**
 * unsquatted.com's social cards, as pages for `og-render.ts` to screenshot: the
 * mark and the wordmark over some words, beside a panel of names and a name
 * field closing it. The site card's words are the hero's lede, its names the
 * best listed ones, no two on one pattern, its field empty; a post's are its
 * own, from its widgets.
 *
 * It reads the listed names through the module the home page reads, and its
 * words from the page's catalogue, so adding a name re-flags the card and the
 * card cannot show a name the page has stopped listing. Of the names it takes
 * only those with no `shownUntil`, so a date passing never changes the card on
 * a day nobody committed.
 *
 * The wordmark is set in Fraunces as on the page, the font staged beside the
 * card from `@fontsource-variable/fraunces` — a `file://` page has no route to
 * the web font the site loads. The rest is in the faces the machine rendering
 * it has (DejaVu).
 */

import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

import { siteConfig, withoutScheme } from '@/kernel/shared/config';
import { CANVAS, SCALE } from '@/kernel/shared/config/index.node-safe';

import {
  COPY,
  DICE_FACE,
  DICE_FACES,
  DICE_VIEW_BOX,
  LASTING_PICKS,
  plainByline,
  variedPicks,
} from '@/unsquatted/pages/home/index.server-only';

import { escapeHtml, type StagedPage } from '@/kernel/scripts/lib/og-render';

const { name, url } = siteConfig('unsquatted');

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

/** Each die's face and pips, in the colours the page's light theme gives them. */
const DICE_COLOURS = {
  back: { face: PAPER, pips: INK },
  front: { face: '#fff', pips: GREEN },
};

/** The page's dice button. */
const DICE = `<svg viewBox="${DICE_VIEW_BOX}" width="34" height="34" fill="none" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true">
${DICE_FACES.map(
  ({ side, rotate, at: [x, y], pips }) => `          <g transform="${rotate}">
            <rect x="${x}" y="${y}" width="${DICE_FACE.size}" height="${DICE_FACE.size}" rx="${DICE_FACE.radius}" fill="${DICE_COLOURS[side].face}" />
            <g fill="${DICE_COLOURS[side].pips}" stroke="none">${pips.map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="${DICE_FACE.pipRadius}" />`).join('')}</g>
          </g>`,
).join('\n')}
        </svg>`;

function lede(): readonly [string, string] {
  return [COPY.lede, plainByline({ copy: COPY })];
}

const more = (count: number) =>
  count > 0 ? `+ ${count} more &amp; counting` : '&amp; counting';

/** What the template sets: the left column's words and the panel's rows. */
type CardContent = {
  headline: string;
  subline: string;
  note: string;
  listHeading: string;
  domains: readonly string[];
  /** The field under the rows: a word typed in it, or its placeholder. */
  field: { typed: boolean; text: string };
  more: string;
  /** A post's title, set smaller than the site's lede, which is a slogan. */
  titled: boolean;
};

/** The site card: the hero's lede beside the best listed names. */
export function unsquattedCard(): StagedPage {
  const [headline, subline] = lede();

  return card({
    headline: escapeHtml(headline).replace('*', '<sup>*</sup>'),
    subline: escapeHtml(subline),
    note: escapeHtml(COPY.ledeNote),
    listHeading: escapeHtml(COPY.listHeading),
    domains: variedPicks(SHOWN).map(({ domain }) => domain),
    field: { typed: false, text: 'Your name…' },
    more: more(LASTING_PICKS.length - SHOWN),
    titled: false,
  });
}

/**
 * A post's card: its title and blurb under the occasion, beside the first list
 * its widgets set, and the word its first `name` widget sets in the field.
 */
export function postCard({
  title,
  description,
  eyebrow,
  list,
  word,
}: {
  title: string;
  description: string;
  eyebrow: string;
  list: { label: string; domains: readonly string[] };
  word: string;
}): StagedPage {
  return card({
    headline: escapeHtml(title),
    subline: escapeHtml(description),
    note: escapeHtml(eyebrow),
    listHeading: escapeHtml(list.label),
    domains: list.domains.slice(0, SHOWN),
    field: { typed: true, text: escapeHtml(word) },
    more: 'and more in the post',
    titled: true,
  });
}

function card({
  headline,
  subline,
  note,
  listHeading,
  domains,
  field,
  more: moreLine,
  titled,
}: CardContent): StagedPage {
  const rows = domains
    .map(
      (domain) => `          <li>
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
      .headline.title { font-size: 36px; line-height: 1.25; text-wrap: balance; }
      .subline { margin: 20px 0 0; font-size: 32px; color: ${INK_DIM}; text-wrap: balance; }
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
        margin: 0 0 24px;
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
        padding: 12px 0;
        border-bottom: 2px solid ${RULE};
      }
      li:last-child { border-bottom: none; }
      .domain { font-family: ${MONO}; font-size: 27px; }
      .grab { font-size: 22px; color: ${GREEN}; }
      /* The room the list leaves splits evenly above and below the field. */
      .checker { display: flex; gap: 12px; margin: auto 0; }
      .field,
      .dice {
        border: 2px solid ${RULE};
        border-radius: 10px;
      }
      .dice { display: flex; align-items: center; padding: 0 10px; background: ${PAPER}; }
      .field {
        flex: 1;
        padding: 10px 16px;
        font-family: ${MONO};
        font-size: 25px;
        color: ${INK_FAINT};
      }
      .field.typed { color: ${INK}; }
      .more { margin: 0; font-size: 22px; color: ${INK_DIM}; }
    </style>
  </head>
  <body>
    <main>
      <header>
      ${MARK}
        <span class="wordmark">${escapeHtml(name)}</span>
      </header>
      <p class="headline${titled ? ' title' : ''}">${headline}</p>
      <p class="subline">${subline}</p>
      <p class="note">${note}</p>
      <span class="url">${escapeHtml(withoutScheme(url))}</span>
    </main>
    <aside>
      <h2>${listHeading}</h2>
      <ul>
${rows}
      </ul>
      <div class="checker">
        <div class="field${field.typed ? ' typed' : ''}">${field.text}</div>
        <div class="dice">${DICE}</div>
      </div>
      <p class="more">${moreLine}</p>
    </aside>
  </body>
</html>
`,
    files: { [FONT]: fs.readFileSync(fontPath) },
  };
}
