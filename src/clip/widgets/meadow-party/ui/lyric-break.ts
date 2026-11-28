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

// «Так хорошо-шо-шо»: each line «хоро» and a «шо» set larger than the last,
// the first as one word.
const ECHOES = [
  [42.56, 1],
  [43.04, 1.45],
  [43.32, 2.1],
] as const;

const LETTER_HEIGHT = 150;
const LEADING = 1.3;
const ECHO_HEIGHT = 84;
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

// The neon's catch on «бы», in seconds from its onset: on, off, on, a dip, on.
const IGNITION = [
  [0, 1],
  [0.04, 0],
  [0.07, 1],
  [0.12, 0.35],
  [0.15, 1],
] as const;

/** How lit the pharmacy sign is `since` «бы», 0 to 1, catching as neon does. */
const lightAt = (since: number): number =>
  IGNITION.findLast(([at]) => since >= at)?.[1] ?? 0;

// Half the stacked words' width and height, in stage units, with room round
// them: the middle line is the cross's bar, the short ones its upright.
const UPRIGHT = [185, 330] as const;
const BAR = [505, 120] as const;

/**
 * The stacked words' outline, a plus that is a pharmacy's green cross once
 * «бы» lands under «не» — the shape the words already make.
 */
function pharmacyCross(pen: Pen, lit: number): void {
  const { ctx } = pen;
  const [cx, cy] = [STAGE.width / 2, STAGE.height / 2];
  const [uw, uh] = UPRIGHT;
  const [bw, bh] = BAR;
  const corners: ReadonlyArray<readonly [number, number]> = [
    [-uw, -uh],
    [uw, -uh],
    [uw, -bh],
    [bw, -bh],
    [bw, bh],
    [uw, bh],
    [uw, uh],
    [-uw, uh],
    [-uw, bh],
    [-bw, bh],
    [-bw, -bh],
    [-uw, -bh],
  ];
  ctx.beginPath();
  for (const [x, y] of corners) ctx.lineTo(cx + x, cy + y);
  ctx.closePath();
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.globalAlpha *= lit;
  ctx.strokeStyle = PARTY_PALETTE.pharmacy;
  ctx.lineWidth = 12;
  ctx.stroke();
  ctx.restore();
}

/**
 * Black, and nothing on it but the words sung so far, stacked a line each and
 * built up word by word, each slamming down on its onset and jolting the ones
 * above it.
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
  ctx.save();
  if (lit > 0) {
    ctx.shadowColor = PARTY_PALETTE.pharmacy;
    ctx.shadowBlur = 28 * lit;
    pharmacyCross(pen, lit);
  }
  for (const [n, [word]] of sung.entries()) {
    const fresh = n === sung.length - 1;
    const centre = [STAGE.width / 2, top + n * pitch] as const;
    landing(pen, centre, (fresh ? 0.35 : 0.04) * slam, () => {
      writePlain(pen, word, {
        x: 0,
        y: -LETTER_HEIGHT / 2,
        letterHeight: LETTER_HEIGHT,
        alignment: 'center',
        weight: 0.16,
        jitter: 0.25,
        color: lit > 0.5 ? PARTY_PALETTE.pharmacy : PARTY_PALETTE.lyric,
        seed: 70 + n,
      });
    });
  }
  ctx.restore();
};

/** `text` in the break's hand, its baseline at `y`, shadowed in ink to read over a picture. */
function echoWord(
  pen: Pen,
  text: string,
  [x, y]: readonly [number, number],
  height: number,
  alignment: Writing['alignment'],
  seed: number,
): void {
  const style = {
    letterHeight: height,
    alignment,
    weight: 0.16,
    jitter: 0.25,
    seed,
  };
  const shadow = height * 0.06;
  writePlain(pen, text, {
    ...style,
    x: x + shadow,
    y: y - height + shadow,
    color: INK_PALETTE.ink,
  });
  writePlain(pen, text, {
    ...style,
    x,
    y: y - height,
    color: PARTY_PALETTE.lyric,
  });
}

/**
 * «хорошо-шо-шо» in the break's lettering, letters only over whatever is
 * under them: a line each as sung, each «шо» larger than the last.
 */
export const echoLines: Drawing = (pen) => {
  const { playhead } = pen;
  const sung = ECHOES.filter(([onset]) => playhead >= onset);
  const slam = slamAt(
    playhead,
    sung.map(([onset]) => onset),
  );
  let baseline = 95;
  for (const [n, [, grow]] of sung.entries()) {
    const big = ECHO_HEIGHT * grow;
    baseline += big + ECHO_HEIGHT * 0.35;
    const fresh = n === sung.length - 1;
    // «хоро» ends and «шо» starts at a pivot that keeps the pair centred,
    // a capital taken as about 0.8 of its height wide.
    const pivot =
      n === 0
        ? STAGE.width / 2
        : STAGE.width / 2 + (4 * ECHO_HEIGHT - 2 * big) * 0.4;
    landing(pen, [pivot, baseline], (fresh ? 0.3 : 0.03) * slam, () => {
      if (n === 0) {
        echoWord(pen, 'ХОРОШО', [0, 0], ECHO_HEIGHT, 'center', 80);
        return;
      }
      echoWord(pen, 'ХОРО', [0, 0], ECHO_HEIGHT, 'right', 80 + n);
      echoWord(pen, 'ШО', [ECHO_HEIGHT * 0.13, 0], big, 'left', 90 + n);
    });
  }
};
