/**
 * The image a visitor shares a domain as: the checker's field holding the
 * name, the rows under it, drawn on a canvas in the browser. Its colours are
 * the page's light palette, read off an element marked
 * `data-unsquatted-palette`, and its faces are the ones the page has loaded.
 */

import type { WithCopy } from '@/unsquatted/shared/i18n';
import { priceParts } from '@/unsquatted/entities/domain';

import type { CardRow } from './share';

export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 630;

/** The mark's U, drawn on a 64-unit square as the site's avatar is. */
const MARK_U = 'M20 18v17a12 12 0 0 0 24 0V18';

/** Lucide's heart, on its 24-unit square. */
const HEART =
  'M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.5 5.5 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5';

/** The words the card carries, the verdicts' and prices' from the page's catalogue. */
export type CardText = {
  verdict: WithCopy['copy']['verdict'];
  price: WithCopy['copy']['price'];
  site: string;
  host: string;
  footer: string;
};

type Look = {
  paper: string;
  ink: string;
  muted: string;
  accent: string;
  surface: string;
  hairline: string;
  maybe: string;
  heart: string;
  displayFace: string;
  bodyFace: string;
  monoFace: string;
};

/** The light palette and the page's faces, as the page has them. */
function look(): Look {
  const probe = document.createElement('span');

  probe.dataset['unsquattedPalette'] = 'light';
  probe.hidden = true;
  document.body.append(probe);
  const style = getComputedStyle(probe);
  const read = (name: string) => style.getPropertyValue(name).trim();
  const found = {
    paper: read('--color-background'),
    ink: read('--color-foreground'),
    muted: read('--unsquatted-muted'),
    accent: read('--color-accent'),
    surface: read('--color-surface'),
    hairline: read('--color-border-hairline'),
    maybe: read('--unsquatted-maybe'),
    heart: read('--unsquatted-taken'),
    displayFace: read('--font-display'),
    bodyFace: read('--font-body'),
    monoFace: read('--mantine-font-family-monospace'),
  };

  probe.remove();

  return found;
}

/** `font` at `size`, or smaller, so `text` fits in `room`. */
function fitted(
  context: CanvasRenderingContext2D,
  text: string,
  font: (size: number) => string,
  size: number,
  room: number,
): string {
  context.font = font(size);
  const width = context.measureText(text).width;

  return width <= room ? font(size) : font(Math.floor((size * room) / width));
}

function drawHead(context: CanvasRenderingContext2D, l: Look, t: CardText) {
  context.save();
  context.translate(96, 64);
  context.fillStyle = l.accent;
  context.beginPath();
  context.roundRect(0, 0, 64, 64, 14);
  context.fill();
  context.strokeStyle = l.paper;
  context.lineWidth = 7;
  context.lineCap = 'round';
  context.stroke(new Path2D(MARK_U));
  context.restore();

  context.fillStyle = l.ink;
  context.font = `700 64px ${l.displayFace}`;
  context.textAlign = 'left';
  context.fillText(t.site, 178, 117);

  context.fillStyle = l.accent;
  context.font = `700 26px ${l.monoFace}`;
  context.textAlign = 'right';
  context.fillText(t.host, 1104, 112);
}

function drawField(context: CanvasRenderingContext2D, l: Look, name: string) {
  context.fillStyle = l.surface;
  context.strokeStyle = l.accent;
  context.lineWidth = 3;
  context.beginPath();
  context.roundRect(96, 176, 1008, 96, 16);
  context.fill();
  context.stroke();

  context.fillStyle = l.ink;
  context.textAlign = 'left';
  context.font = fitted(
    context,
    name,
    (size) => `${size}px ${l.monoFace}`,
    44,
    944,
  );
  context.fillText(name, 128, 240);
}

const ROW_TOP = 316;
const ROW_STEP = 68;
const RIGHT = 1072;

function drawRow(
  context: CanvasRenderingContext2D,
  l: Look,
  t: CardText,
  row: CardRow,
  index: number,
) {
  const y = ROW_TOP + index * ROW_STEP;
  const weight = index === 0 ? '700 ' : '';
  let right = RIGHT;

  context.textAlign = 'right';
  if (row.price !== undefined) {
    const { first, after } = priceParts(row.price);
    const price = `$${first}${after === undefined ? '' : `${t.price.then}$${after}`}${t.price.perYear}`;

    context.fillStyle = l.muted;
    context.font = `${weight}22px ${l.bodyFace}`;
    context.fillText(price, right, y);
    right -= context.measureText(price).width + 12;
  }
  context.fillStyle = row.state === 'free' ? l.accent : l.maybe;
  context.font = `${weight}26px ${l.bodyFace}`;
  const verdict = t.verdict[row.state];

  context.fillText(verdict, right, y);
  const verdictLeft = right - context.measureText(verdict).width - 24;

  context.fillStyle = l.ink;
  context.textAlign = 'left';
  context.font = fitted(
    context,
    row.domain,
    (each) => `${weight}${each}px ${l.monoFace}`,
    32,
    verdictLeft - 128,
  );
  context.fillText(row.domain, 128, y);

  if (row.liked) {
    context.save();
    context.translate(84, y - 22);
    context.fillStyle = l.heart;
    context.fill(new Path2D(HEART));
    context.restore();
  }
  if (index > 0) {
    context.strokeStyle = l.hairline;
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(128, y - ROW_STEP / 2);
    context.lineTo(RIGHT, y - ROW_STEP / 2);
    context.stroke();
  }
}

/** The type of the file `shareCard` makes, known before the file is. */
export const CARD_TYPE = 'image/png';

/** The card for `name`'s `rows`, as a PNG named for the first. */
export async function shareCard(
  name: string,
  rows: readonly CardRow[],
  text: CardText,
): Promise<File> {
  const canvas = document.createElement('canvas');

  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const context = canvas.getContext('2d');

  if (context === null) throw new Error('This browser draws no canvas');
  const l = look();

  context.fillStyle = l.paper;
  context.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  drawHead(context, l, text);
  drawField(context, l, name);
  for (const [index, row] of rows.entries())
    drawRow(context, l, text, row, index);

  context.fillStyle = l.muted;
  context.textAlign = 'left';
  context.font = fitted(
    context,
    text.footer,
    (size) => `${size}px ${l.bodyFace}`,
    27,
    1008,
  );
  context.fillText(text.footer, 96, 574);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((made) => {
      if (made === null) reject(new Error('The card did not encode'));
      else resolve(made);
    }, CARD_TYPE);
  });

  return new File([blob], `unsquatted.${rows[0]?.domain ?? name}.png`, {
    type: CARD_TYPE,
  });
}

/** Whether the clipboard takes an image; Firefox before 127 has no `ClipboardItem`. */
export const canCopyImage = () =>
  typeof ClipboardItem !== 'undefined' && 'write' in navigator.clipboard;
