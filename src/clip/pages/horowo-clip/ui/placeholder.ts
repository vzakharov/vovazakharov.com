import {
  ellipse,
  ink,
  INK_PALETTE,
  noise,
  type Pen,
  polygon,
  STAGE,
} from '@/clip/shared/ink';
import {
  barAt,
  beatAt,
  CHANT,
  energy,
  jaw,
  pulse,
  VERSE_CALLS,
  wordAt,
} from '@/clip/shared/score';
import type { Drawing, Local } from '@/clip/shared/timeline';

import { PLACEHOLDER_PALETTE, type Wash, WASHES } from './palette-placeholder';

const { width: W, height: H } = STAGE;
const MARGIN = 36;
const FONT = 'system-ui, sans-serif';
/** How long after an onset a cut lands on the card rings, in seconds. */
const CUE_SECONDS = 0.2;
const ONSETS: readonly number[] = [...VERSE_CALLS, ...CHANT];
/** The column the card's lettering is centred on. */
const TEXT_X = W / 2 - 60;

/** An `x, y, w, h` rectangle as an inkable path. */
const box = (x: number, y: number, w: number, h: number) =>
  polygon([
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ]);

/** The whole stage under `colour`, `alpha` of the way opaque. */
function wash({ ctx }: Pen, colour: string, alpha = 1): void {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = colour;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;
}

/** `m:ss.s` for a time in seconds. */
const clock = (t: number): string => {
  const minutes = Math.floor(t / 60);
  const seconds = (t - minutes * 60).toFixed(1).padStart(4, '0');
  return `${String(minutes)}:${seconds}`;
};

/** Lettering that boils with the line: each redrawing nudges it a little. */
function letter(
  pen: Pen,
  text: string,
  [x, y]: readonly [number, number],
  size: number,
  seed: number,
): void {
  const { ctx, boil } = pen;
  ctx.font = `800 ${String(size)}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round';
  ctx.lineWidth = size / 6;
  ctx.strokeStyle = INK_PALETTE.ink;
  ctx.fillStyle = PLACEHOLDER_PALETTE.light;
  const dx = noise(seed, boil * 2) * 2;
  const dy = noise(seed, boil * 2 + 1) * 2;
  ctx.strokeText(text, x + dx, y + dy);
  ctx.fillText(text, x + dx, y + dy);
}

/** A meter: an inked track `share` full of `color`, rising from its foot. */
function meter(
  pen: Pen,
  [x, y, w, h]: readonly [number, number, number, number],
  share: number,
  color: string,
  seed: number,
): void {
  const top = y + h * (1 - share);
  if (share > 0) {
    ink(pen, box(x, top, w, y + h - top), { fill: color, stroke: null, seed });
  }
  ink(pen, box(x, y, w, h), { seed: seed + 1 });
}

/** The mask's mouth: a slot that opens as far as the jaw hangs. */
function mouth(pen: Pen, open: number): void {
  ink(pen, ellipse([W - 150, H / 2 + 40], 70, 6 + open * 60), {
    fill: PLACEHOLDER_PALETTE.mouth,
    width: 6,
    seed: 7,
  });
}

/**
 * A stand-in for a scene not yet drawn: the section's wash dimmed by the mix's
 * loudness, its name and span in boiling letters, the word being sung, a flash
 * on every beat, a ring on every onset a cut lands on, and meters for the jaw,
 * the loudness and the shot's own progress.
 */
export const placeholder =
  (name: string, tone: Wash): Drawing =>
  (pen: Pen, local: Local): void => {
    const { playhead: t } = pen;
    const loud = energy(t);
    const open = jaw(t);
    wash(pen, WASHES[tone]);
    wash(pen, INK_PALETTE.ink, 0.7 * (1 - loud));

    const downbeat = Math.abs(barAt(t) - Math.round(barAt(t))) < 0.06;
    wash(pen, PLACEHOLDER_PALETTE.light, (downbeat ? 0.45 : 0.22) * pulse(t));

    const cued = ONSETS.some((at) => t >= at && t - at < CUE_SECONDS);
    ink(
      pen,
      box(MARGIN, MARGIN, W - 2 * MARGIN, H - 2 * MARGIN),
      cued
        ? { stroke: PLACEHOLDER_PALETTE.cue, width: 22, wobble: 4, seed: 3 }
        : { width: 8, wobble: 3, seed: 3 },
    );

    letter(pen, name, [TEXT_X, 150], 52, 11);
    letter(
      pen,
      `${clock(t - local.sinceCut)} – ${clock(t - local.sinceCut + local.seconds)}`,
      [TEXT_X, 220],
      28,
      12,
    );
    const word = wordAt(t)?.text;
    if (word !== undefined) letter(pen, word, [TEXT_X, H / 2 + 40], 84, 13);
    const beat = Math.floor(beatAt(t));
    letter(
      pen,
      `bar ${String(Math.floor(barAt(t)))} · beat ${String(beat)}`,
      [TEXT_X, H - 150],
      26,
      14,
    );

    mouth(pen, open);
    meter(pen, [W - 236, 120, 36, 160], open, PLACEHOLDER_PALETTE.mouth, 20);
    meter(pen, [W - 100, 120, 36, 160], loud, PLACEHOLDER_PALETTE.light, 22);
    meter(
      pen,
      [MARGIN + 40, H - MARGIN - 70, 24, 40],
      local.p,
      PLACEHOLDER_PALETTE.light,
      24,
    );
  };
