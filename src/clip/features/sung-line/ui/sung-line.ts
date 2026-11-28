import { INK_PALETTE, type Pen } from '@/clip/shared/ink';
import { writePlain } from '@/clip/shared/lettering';
import { lineAt, LYRIC_LINES } from '@/clip/shared/score';
import { dotText } from '@/clip/shared/tape';

import { presence, shown, sungChars, wrapped } from '../model/caption';
import { type Placement, placementOf } from '../model/placement';
import { SUNG_LINE_PALETTE } from './palette-sung-line';

/** How strongly the line is drawn: an accompaniment, legible when looked for. */
const OPACITY = 0.88;
/** Row to row of the dot face, in dots: seven lit and three dark. */
const DOT_ROWS = 10;
/** Row to row of the hand, in cap heights: the lettering's own leading. */
const HAND_LEADING = 1.55;
/** The hand's stroke, and the ink edge around it, in cap heights. */
const HAND_WEIGHT = 0.1;
const HAND_EDGE = 0.24;

/** The dot face's rows, each standing where the whole line would, the last at the spot. */
function dotRows(
  pen: Pen,
  text: string,
  chars: number,
  place: Placement,
): void {
  const rows = shown(text, chars).split('\n');
  const {
    setAt: [x, y],
    glyphSize,
    align,
  } = place;
  for (const [n, row] of rows.entries()) {
    dotText(pen, row, [x, y - (rows.length - 1 - n) * DOT_ROWS * glyphSize], {
      dot: glyphSize,
      color: SUNG_LINE_PALETTE.caption,
      shadow: SUNG_LINE_PALETTE.captionEdge,
      align,
    });
  }
}

/** How many letters `text` holds, spaces and breaks aside. */
const letters = (text: string): number => text.replaceAll(/\s/gu, '').length;

/** The marker hand writing the line as it is sung, bone over an ink edge, its last row at the spot. */
function handRows(
  pen: Pen,
  text: string,
  chars: number,
  place: Placement,
  seed: number,
): void {
  const rows = text.split('\n').length;
  const [x, y] = place.setAt;
  const writing = {
    x,
    y: y - (rows - 1) * HAND_LEADING * place.glyphSize,
    letterHeight: place.glyphSize,
    leading: HAND_LEADING,
    alignment: place.align,
    jitter: place.unsteadiness ?? 0,
    progress: letters(text.slice(0, chars)) / letters(text),
    seed,
  };
  writePlain(pen, text, {
    ...writing,
    weight: HAND_EDGE,
    color: INK_PALETTE.ink,
  });
  writePlain(pen, text, {
    ...writing,
    weight: HAND_WEIGHT,
    color: INK_PALETTE.bone,
  });
}

/**
 * The line being sung at `pen.playhead`, over whatever the clip shows: its
 * words arriving as they are sung, the line staying until the next begins
 * or, after a pause, fading.
 */
export function sungLine(pen: Pen): void {
  const { ctx, playhead } = pen;
  const line = lineAt(playhead);
  if (!line) return;
  const shownShare = presence(line, playhead);
  const chars = sungChars(line, playhead);
  if (shownShare <= 0 || chars === 0) return;
  const n = LYRIC_LINES.indexOf(line);
  const place = placementOf(line, n);
  const text = wrapped(line.text, place.rowChars).toUpperCase();
  ctx.save();
  ctx.globalAlpha *= OPACITY * shownShare;
  if (place.idiom === 'dot') dotRows(pen, text, chars, place);
  else handRows(pen, text, chars, place, n + 1);
  ctx.restore();
}
