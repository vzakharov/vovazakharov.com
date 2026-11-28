import { INK_PALETTE, type Pen, STAGE } from '@/clip/shared/ink';
import { writePlain, type Writing } from '@/clip/shared/lettering';
import type { Drawing } from '@/clip/shared/timeline';

import { PARTY_PALETTE } from './palette-meadow-party';

// Onsets from the score's words.ts, which the vocal stem's envelope confirms
// to a frame.
const BREAK_WORDS = [
  ['НЕ', 43.68],
  ['СДОХНУТЬ', 43.88],
  ['БЫ', 44.4],
] as const;

// «Так хорошо-шо-шо»: the onset of each «шо» and how tall the word's «шо»
// is set from it, in cap heights of its «хоро».
const ECHOES = [
  [42.56, 1],
  [43.04, 1.6],
  [43.32, 2.4],
] as const;

const LETTER_HEIGHT = 150;
const ECHO_HEIGHT = LETTER_HEIGHT;
// Where «хоро» ends and «шо» begins, so the grown word sits centred.
const ECHO_SEAM = [590, 470] as const;
const LEADING = 1.3;
// How long a word's landing takes, from oversized to set, in seconds.
const LANDS = 0.07;

/** How far the line landing latest is from set: 1 on its onset, 0 once landed. */
const slamAt = (playhead: number, onsets: readonly number[]): number => {
  const latest = onsets.findLast((onset) => playhead >= onset) ?? playhead;
  return Math.max(0, 1 - (playhead - latest) / LANDS);
};

/** `draw` about (x, y), swollen by `swell` while it lands. */
function landing(
  pen: Pen,
  [x, y]: readonly [number, number],
  swell: number,
  draw: () => void,
): void {
  const { ctx } = pen;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1 + swell, 1 + swell);
  draw();
  ctx.restore();
}

// A shaking hand going over each letter again: each pass's offset, in cap
// heights, line width, in cap heights, and opacity.
const PASSES = [
  [0, 0, 0.1, 1],
  [0.035, -0.025, 0.045, 0.8],
  [-0.03, 0.035, 0.03, 0.65],
] as const;

/**
 * `text` in an unsteady hand, gone over two more times out of register: a
 * marker sign written by someone who should not be holding a marker. Its own
 * line widths and unsteadiness replace `writing`'s.
 */
function scrawl(
  pen: Pen,
  text: string,
  writing: Writing & { color: string },
): void {
  const { ctx } = pen;
  const { letterHeight: size, x = 0, y = 0 } = writing;
  for (const [dx, dy, weight, alpha] of PASSES) {
    ctx.save();
    ctx.globalAlpha *= alpha;
    writePlain(pen, text, {
      ...writing,
      x: x + dx * size,
      y: y + dy * size,
      weight,
      jitter: 2.2,
    });
    ctx.restore();
  }
}

// The sign's catch on «бы», in seconds from its onset: on, off, on, a dip, on.
const IGNITION = [
  [0, 1],
  [0.04, 0],
  [0.07, 1],
  [0.12, 0.35],
  [0.15, 1],
] as const;

/** How lit the cross is `since` «бы», 0 to 1, catching as a tube sign does. */
const lightAt = (since: number): number =>
  IGNITION.findLast(([at]) => since >= at)?.[1] ?? 0;

// Half the stacked words' width and height, in stage units, with room round
// them: the middle line is the cross's bar, the short ones its upright, the
// arms alike and as thick for their length as the hospital's.
const UPRIGHT = [125, 335] as const;
const BAR = [335, 125] as const;
// How narrow the words are set, so «сдохнуть» is no longer than the upright
// is tall and «не» fits the upright.
const CONDENSED = 0.6;

/**
 * The hospital's red cross, solid, in the plus the stacked words already
 * make once «бы» lands under «не».
 */
function hospitalCross(pen: Pen, lit: number): void {
  const { ctx } = pen;
  const [cx, cy] = [STAGE.width / 2, STAGE.height / 2];
  const [uw, uh] = UPRIGHT;
  const [bw, bh] = BAR;
  ctx.save();
  ctx.globalAlpha *= lit;
  ctx.fillStyle = PARTY_PALETTE.cross;
  ctx.fillRect(cx - uw, cy - uh, 2 * uw, 2 * uh);
  ctx.fillRect(cx - bw, cy - bh, 2 * bw, 2 * bh);
  ctx.restore();
}

/**
 * Black, and nothing on it but the words sung so far, stacked a line each and
 * built up word by word, each slamming down on its onset and jolting the ones
 * above it; on «бы» the hospital's cross lights behind them.
 */
export const lyricBreak: Drawing = (pen) => {
  const { ctx, playhead } = pen;
  const sung = BREAK_WORDS.filter(([, onset]) => playhead >= onset);
  const slam = slamAt(
    playhead,
    sung.map(([, onset]) => onset),
  );
  const lit =
    sung.length === BREAK_WORDS.length
      ? lightAt(playhead - BREAK_WORDS[2][1])
      : 0;
  const pitch = LETTER_HEIGHT * LEADING;
  const top = (STAGE.height - pitch * (BREAK_WORDS.length - 1)) / 2;
  if (lit > 0) hospitalCross(pen, lit);
  for (const [n, [word]] of sung.entries()) {
    const fresh = n === sung.length - 1;
    const centre = [STAGE.width / 2, top + n * pitch] as const;
    landing(pen, centre, (fresh ? 0.35 : 0.04) * slam, () => {
      ctx.scale(CONDENSED, 1);
      scrawl(pen, word, {
        x: 0,
        y: -LETTER_HEIGHT / 2,
        letterHeight: LETTER_HEIGHT,
        alignment: 'center',
        color: lit > 0.5 ? INK_PALETTE.ink : PARTY_PALETTE.lyric,
        seed: 70 + n,
      });
    });
  }
};

/** `text` in the break's hand, its baseline at `y`, shadowed in ink to read over a picture. */
function shadowed(
  pen: Pen,
  text: string,
  [x, y]: readonly [number, number],
  height: number,
  alignment: Writing['alignment'],
  seed: number,
): void {
  const style = { letterHeight: height, alignment, seed };
  const shadow = height * 0.06;
  scrawl(pen, text, {
    ...style,
    x: x + shadow,
    y: y - height + shadow,
    color: INK_PALETTE.ink,
  });
  scrawl(pen, text, {
    ...style,
    x,
    y: y - height,
    color: PARTY_PALETTE.lyric,
  });
}

/**
 * «хорошо-шо-шо» as one word in the break's lettering, letters only over
 * whatever is under them: «хоро» holds its place while its «шо» grows on
 * each sung «шо», landing as the break's words do.
 */
export const horosho: Drawing = (pen) => {
  const { ctx, playhead } = pen;
  const sung = ECHOES.filter(([onset]) => playhead >= onset);
  const [, grow] = sung.at(-1) ?? [0, 0];
  if (grow === 0) return;
  const slam = slamAt(
    playhead,
    sung.map(([onset]) => onset),
  );
  landing(pen, ECHO_SEAM, 0.3 * slam, () => {
    ctx.scale(CONDENSED, 1);
    shadowed(pen, 'ХОРО', [0, 0], ECHO_HEIGHT, 'right', 80);
    shadowed(
      pen,
      'ШО',
      [ECHO_HEIGHT * 0.16, 0],
      ECHO_HEIGHT * grow,
      'left',
      81,
    );
  });
};
