import type { Sized } from '@/kernel/shared/typings';

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
  energy,
  jaw,
  KICKS,
  pulse,
  punch,
  sectionAt,
  wordAt,
} from '@/clip/shared/score';
import { reality, SCREEN, testCard } from '@/clip/shared/tape';
import type { Drawing, Local } from '@/clip/shared/timeline';

import { onChannel } from './channel';
import { PLACEHOLDER_PALETTE } from './palette-placeholder';

/** Where a stand-in plays: on the TV, or in the room it stands in. */
export type Look = 'broadcast' | 'reality';

const FONT = 'system-ui, sans-serif';
/** How fast a pulse's flash fades, in seconds. */
const FLASH_SECONDS = 0.1;

/** An `x, y, w, h` rectangle as an inkable path. */
const box = (x: number, y: number, w: number, h: number) =>
  polygon([
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ]);

/** The whole frame under `colour`, `alpha` of the way opaque. */
function wash(
  { ctx }: Pen,
  { width, height }: Sized,
  colour: string,
  alpha = 1,
): void {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = colour;
  ctx.fillRect(0, 0, width, height);
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
function mouth(
  pen: Pen,
  [x, y]: readonly [number, number],
  open: number,
): void {
  ink(pen, ellipse([x, y], 60, 6 + open * 50), {
    fill: PLACEHOLDER_PALETTE.mouth,
    width: 6,
    seed: 7,
  });
}

/**
 * The card's own content on a `frame`-sized picture: a flash on every pulse
 * of the section, a ring as the kick lands, the shot's title, the section's
 * name and feel, the pulse's count, the word sung and the shot's span, and
 * meters for the jaw, the mix's loudness and the shot's progress.
 */
function card(pen: Pen, title: string, local: Local, frame: Sized): void {
  const { playhead: t } = pen;
  const { width: w, height: h } = frame;
  const section = sectionAt(t);
  const beat = pulse(t);
  const open = jaw(t);
  const textX = w / 2 - 60;
  const margin = 28;

  wash(
    pen,
    frame,
    PLACEHOLDER_PALETTE.light,
    0.35 * Math.exp((-beat.fraction * beat.seconds) / FLASH_SECONDS),
  );
  const kick = punch(KICKS, t);
  ink(
    pen,
    box(margin, margin, w - 2 * margin, h - 2 * margin),
    kick > 0.05
      ? { stroke: PLACEHOLDER_PALETTE.kick, width: 6 + 18 * kick, seed: 3 }
      : { width: 6, wobble: 3, seed: 3 },
  );

  letter(pen, title, [textX, 110], 46, 11);
  const heading = [...new Set([section.name, section.feel])]
    .filter((part) => part !== title)
    .join(' · ');
  letter(pen, heading, [textX, 170], 26, 12);
  const word = wordAt(t)?.text;
  if (word !== undefined) letter(pen, word, [textX, h / 2 + 30], 76, 13);
  letter(pen, `pulse ${String(beat.index)}`, [textX, h - 150], 26, 14);
  letter(
    pen,
    `${clock(t - local.sinceCut)} – ${clock(t - local.sinceCut + local.seconds)}`,
    [textX, h - 105],
    22,
    15,
  );

  mouth(pen, [w - 130, h / 2 + 60], open);
  // Low enough to clear the channel's bug in the picture's corner.
  meter(pen, [w - 200, 140, 30, 120], open, PLACEHOLDER_PALETTE.mouth, 20);
  meter(pen, [w - 90, 140, 30, 120], energy(t), PLACEHOLDER_PALETTE.light, 22);
  meter(
    pen,
    [margin + 36, h - margin - 66, 22, 38],
    local.p,
    PLACEHOLDER_PALETTE.light,
    24,
  );
}

/**
 * A stand-in for a scene not yet drawn. On the TV it is a channel: the test
 * card, dimmed under the stand-in's lettering, tuned in at the cut.
 * In reality it fills the stage on a wash the mix's loudness dims.
 */
export const placeholder =
  (title: string, look: Look, channel: number): Drawing =>
  (pen: Pen, local: Local): void => {
    if (look === 'reality') {
      reality(pen, (inner) => {
        wash(inner, STAGE, PLACEHOLDER_PALETTE.reality);
        wash(inner, STAGE, INK_PALETTE.ink, 0.7 * (1 - energy(inner.playhead)));
        card(inner, title, local, STAGE);
      });
      return;
    }
    onChannel(
      pen,
      local,
      (inner) => {
        testCard(inner);
        wash(inner, SCREEN, PLACEHOLDER_PALETTE.dim, 0.6);
        card(inner, title, local, SCREEN);
      },
      channel,
    );
  };
