/**
 * The image a visitor shares a domain as: the checker's field holding the
 * name, the rows under it, drawn on a canvas in the browser. Its colours are
 * the page's light palette, read off an element marked
 * `data-unsquatted-palette`, and its faces are the ones the page has loaded.
 */

import { pick } from '@/kernel/shared/lib/collections';

import { priceParts, type WithCopy } from '../../checker';
import { type CardRow, offersNothing } from './share';

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
  /** The footer up to the end of the word the field's arrow rises from. */
  marked: string;
  /** An all-taken card's footer, struck through. */
  lede: string;
  /**
   * What the hand writes: `all` over the struck lede where every domain on the
   * card is taken, `field` in the field, an arrow from the footer pointing at
   * it, where only the typed one is.
   */
  aside: Record<Aside, string>;
};

type Aside = 'all' | 'field';

/** What a hand-drawn arrow is inked in, and haloed in where it crosses text. */
type ArrowInks = {
  paper: string;
  /** A taken domain's verdict and a liked one's heart, which share a colour. */
  taken: string;
};

type Look = ArrowInks & {
  ink: string;
  muted: string;
  accent: string;
  surface: string;
  hairline: string;
  maybe: string;
  displayFace: string;
  handFace: string;
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
    taken: read('--unsquatted-taken'),
    displayFace: read('--font-display'),
    handFace: read('--font-hand'),
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

/** A row's verdict as the checker words it, a taken one with its year. */
function verdictText({ verdict }: CardText, row: CardRow): string {
  if (row.state !== 'taken') return verdict[row.state];

  return row.since === undefined
    ? verdict.taken
    : verdict.takenSince.replace('{year}', row.since);
}

const LEFT = 128;
const RIGHT = 1072;

const VERDICT_MARGIN = 24;

type Drawing = { l: Look; t: CardText };

/**
 * `row`'s verdict and price, set right-aligned to `RIGHT` on baseline `y`;
 * returns where the domain beside them has to end.
 */
function drawVerdict(
  context: CanvasRenderingContext2D,
  { l, t }: Drawing,
  row: CardRow,
  y: number,
  weight: string,
): number {
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
  context.fillStyle = { free: l.accent, ...pick(l, 'maybe', 'taken') }[
    row.state
  ];
  context.font = `${weight}26px ${l.bodyFace}`;
  const verdict = verdictText(t, row);

  context.fillText(verdict, right, y);

  return right - context.measureText(verdict).width - VERDICT_MARGIN;
}

/** The field's white stretch: from where its name ends to where its verdict starts. */
type FieldGap = readonly [start: number, end: number];

const FIELD_BASELINE = 240;

/**
 * The field holding `name`, and the verdict on it where it is a domain;
 * returns the gap between the two, which the name, shrinking, leaves at least
 * `reserve` wide.
 */
function drawField(
  context: CanvasRenderingContext2D,
  { l, t }: Drawing,
  name: string,
  row: CardRow | undefined,
  reserve: number,
): FieldGap {
  context.fillStyle = l.surface;
  context.strokeStyle = l.accent;
  context.lineWidth = 3;
  context.beginPath();
  context.roundRect(96, 176, 1008, 96, 16);
  context.fill();
  context.stroke();

  const nameRight =
    row === undefined
      ? RIGHT
      : drawVerdict(context, { l, t }, row, 236, '700 ');

  context.fillStyle = l.ink;
  context.textAlign = 'left';
  context.font = fitted(
    context,
    name,
    (size) => `${size}px ${l.monoFace}`,
    44,
    nameRight - LEFT - reserve,
  );
  context.fillText(name, LEFT, FIELD_BASELINE);

  return [LEFT + context.measureText(name).width, nameRight + VERDICT_MARGIN];
}

const ROW_TOP = 316;
const ROW_STEP = 68;

function drawRow(
  context: CanvasRenderingContext2D,
  l: Look,
  t: CardText,
  row: CardRow,
  index: number,
) {
  const y = ROW_TOP + index * ROW_STEP;
  const weight = index === 0 ? '700 ' : '';
  const verdictLeft = drawVerdict(context, { l, t }, row, y, weight);

  context.fillStyle = l.ink;
  context.textAlign = 'left';
  context.font = fitted(
    context,
    row.domain,
    (each) => `${weight}${each}px ${l.monoFace}`,
    32,
    verdictLeft - LEFT,
  );
  context.fillText(row.domain, LEFT, y);

  if (row.liked) {
    context.save();
    context.translate(84, y - 22);
    context.fillStyle = l.taken;
    context.fill(new Path2D(HEART));
    context.restore();
  }
  if (index > 0) {
    context.strokeStyle = l.hairline;
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(LEFT, y - ROW_STEP / 2);
    context.lineTo(RIGHT, y - ROW_STEP / 2);
    context.stroke();
  }
}

/** The weight every aside is set in, which the font load awaits. */
const HAND_WEIGHT = '700';

/** The all-taken aside's weight and size. */
const HAND = `${HAND_WEIGHT} 46px`;

/** The field's white stretch a long name leaves the note. */
const NOTE_ROOM = 300;

/** What the note keeps clear on either side within the field's white stretch. */
const NOTE_MARGIN = 24;

const FOOTER_LEFT = 96;
const FOOTER_BASELINE = 574;

type Point = readonly [x: number, y: number];

/** Writes in whatever font the caller has set. */
function writeByHand(
  context: CanvasRenderingContext2D,
  ink: string,
  aside: string,
  at: Point,
  tilt: number,
) {
  context.save();
  context.translate(...at);
  context.rotate(tilt);
  context.fillStyle = ink;
  context.fillText(aside, 0, 0);
  context.restore();
}

/**
 * A hand-drawn arrow along the cubic `from`–`to`, its head along the curve's
 * last tangent, haloed in `paper` so it reads where it crosses a row's text.
 */
function drawArrow(
  context: CanvasRenderingContext2D,
  { taken, paper }: ArrowInks,
  [from, bend, bendAgain, to]: readonly [Point, Point, Point, Point],
) {
  const [toX, toY] = to;
  const back = Math.atan2(bendAgain[1] - toY, bendAgain[0] - toX);

  context.save();
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.beginPath();
  context.moveTo(...from);
  context.bezierCurveTo(...bend, ...bendAgain, ...to);
  for (const turn of [-0.5, 0.5]) {
    context.moveTo(
      toX + 16 * Math.cos(back + turn),
      toY + 16 * Math.sin(back + turn),
    );
    context.lineTo(...to);
  }
  context.strokeStyle = paper;
  context.lineWidth = 9;
  context.stroke();
  context.strokeStyle = taken;
  context.lineWidth = 3;
  context.stroke();
  context.restore();
}

/**
 * `aside` by hand in the middle of the field's white stretch, `gap`, and an
 * arrow arcing up to it from the footer's word centred on `fromX`.
 */
function drawPointed(
  context: CanvasRenderingContext2D,
  l: Look,
  aside: string,
  [start, end]: FieldGap,
  fromX: number,
) {
  const tilt = -0.04;

  context.font = fitted(
    context,
    aside,
    (size) => `${HAND_WEIGHT} ${size}px ${l.handFace}`,
    40,
    end - start - 2 * NOTE_MARGIN,
  );
  const width = context.measureText(aside).width;
  const left = (start + end - width) / 2;
  const baseline = FIELD_BASELINE - 6;

  writeByHand(context, l.taken, aside, [left, baseline], tilt);

  const middle = left + width / 2;
  const toY = baseline + (width / 2) * Math.sin(tilt) + 26;
  const fromY = FOOTER_BASELINE - 34;
  const across = middle - fromX;
  const rise = fromY - toY;

  // Both control points sit on the chord's lower side, so the curve is one
  // arc, meeting the note from straight below.
  drawArrow(context, l, [
    [fromX, fromY],
    [fromX + across * 0.5, fromY - rise * 0.2],
    [middle, toY + rise * 0.5],
    [middle, toY],
  ]);
}

/** An all-taken card's footer: the lede struck through, `aside` over it by hand. */
function drawCorrected(
  context: CanvasRenderingContext2D,
  l: Look,
  t: CardText,
  aside: string,
) {
  context.fillStyle = l.muted;
  context.textAlign = 'left';
  context.font = `27px ${l.bodyFace}`;
  context.fillText(t.lede, FOOTER_LEFT, FOOTER_BASELINE);
  const right = FOOTER_LEFT + context.measureText(t.lede).width;

  context.strokeStyle = l.taken;
  context.lineWidth = 4;
  context.lineCap = 'round';
  context.beginPath();
  context.moveTo(90, 566);
  context.bezierCurveTo(right * 0.35, 561, right * 0.7, 570, right + 6, 563);
  context.stroke();

  context.font = `${HAND} ${l.handFace}`;
  writeByHand(context, l.taken, aside, [200, 522], -0.05);
}

/** The type of the file `shareCard` makes, known before the file is. */
const CARD_TYPE = 'image/png';

function asideOf(
  field: CardRow | undefined,
  rows: readonly CardRow[],
): Aside | undefined {
  const all = field === undefined ? rows : [field, ...rows];

  if (all.length > 0 && offersNothing(all)) return 'all';

  return field?.state === 'taken' ? 'field' : undefined;
}

/**
 * The card for `name` — its verdict in the field where `field` gives one —
 * and the `rows` under it, as a PNG named for the first domain it shows.
 */
export async function shareCard(
  name: string,
  field: CardRow | undefined,
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
  const aside = asideOf(field, rows);
  const gap = drawField(
    context,
    { l, t: text },
    name,
    field,
    aside === 'field' ? NOTE_ROOM : 0,
  );

  for (const [index, row] of rows.entries())
    drawRow(context, l, text, row, index);
  if (aside !== undefined) {
    // Unpreloaded, the hand arrives only when a card first asks for it. Only
    // the stack's first face is awaited: next/font's metric fallback after it
    // is `local("Arial")`, which rejects the whole load where Arial is absent.
    const [hand] = l.handFace.split(',');

    await document.fonts.load(`${HAND} ${hand}`);
  }
  if (aside === 'all') drawCorrected(context, l, text, text.aside.all);
  else {
    context.fillStyle = l.muted;
    context.textAlign = 'left';
    context.font = fitted(
      context,
      text.footer,
      (size) => `${size}px ${l.bodyFace}`,
      27,
      1008,
    );
    context.fillText(text.footer, FOOTER_LEFT, FOOTER_BASELINE);

    if (aside === 'field') {
      const { marked } = text;
      const wordLeft = context.measureText(
        marked.slice(0, marked.lastIndexOf(' ') + 1),
      ).width;
      const wordRight = context.measureText(marked).width;

      drawPointed(
        context,
        l,
        text.aside.field,
        gap,
        FOOTER_LEFT + (wordLeft + wordRight) / 2,
      );
    }
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((made) => {
      if (made === null) reject(new Error('The card did not encode'));
      else resolve(made);
    }, CARD_TYPE);
  });

  return new File(
    [blob],
    `unsquatted.${(field ?? rows[0])?.domain ?? name}.png`,
    {
      type: CARD_TYPE,
    },
  );
}

/** Whether the clipboard takes an image; Firefox before 127 has no `ClipboardItem`. */
export const canCopyImage = () =>
  typeof ClipboardItem !== 'undefined' && 'write' in navigator.clipboard;
