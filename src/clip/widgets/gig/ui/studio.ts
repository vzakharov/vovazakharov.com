import { at, type Pen } from '@/clip/shared/ink';
import { KICKS, punch } from '@/clip/shared/score';
import { dotText, SCREEN } from '@/clip/shared/tape';
import { type Audience, studioAudience } from '@/clip/entities/bunny';
import { earFireworks } from '@/clip/features/ear-fireworks';

import { GIG_PALETTE } from './palette-gig';

const { width, height } = SCREEN;

/** A flat wash over the whole picture. */
export function wash(pen: Pen, color: string): void {
  pen.ctx.fillStyle = color;
  pen.ctx.fillRect(0, 0, width, height);
}

/**
 * The studio's spotlights: beams fanning down from the rig above, swinging a
 * full sweep every two bars of `beats`.
 */
export function beams(pen: Pen, beats: number, spread = 1): void {
  const { ctx } = pen;
  const swing = Math.sin((beats * Math.PI) / 4);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.22;
  for (const [n, color] of GIG_PALETTE.beams.entries()) {
    const source = width * (0.15 + n * 0.23);
    const angle =
      (swing * (n % 2 === 0 ? 1 : -1) * 0.5 + (n - 1.5) * 0.15) * spread;
    const reach = height * 1.3;
    const [dx, dy] = [Math.sin(angle) * reach, Math.cos(angle) * reach];
    const half = 0.16;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(source, -20);
    ctx.lineTo(source + dx - dy * half, dy + dx * half);
    ctx.lineTo(source + dx + dy * half, dy - dx * half);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/** «ХОРОШО» in bulbs over the stage, the lit ones chasing on the beat. */
export function marquee(pen: Pen, beats: number, y: number): void {
  const lit = Math.floor(beats * 2) % 2 === 0;
  dotText(pen, 'ХОРОШО', [width / 2, y], {
    dot: 14,
    color: lit ? GIG_PALETTE.bulbOn : GIG_PALETTE.bulbOff,
    shadow: GIG_PALETTE.bulbEdge,
    align: 'center',
  });
}

/** The studio floor from `y` down, its lit front edge. */
export function stageFloor(pen: Pen, y: number): void {
  const { ctx } = pen;
  ctx.fillStyle = GIG_PALETTE.floor;
  ctx.fillRect(0, y, width, height - y);
  ctx.fillStyle = GIG_PALETTE.stageEdge;
  ctx.fillRect(0, y, width, 6);
}

/** The studio audience across the bottom of the picture, its ears flying from `liftOff`. */
export function crowd(pen: Pen, audience: Audience): void {
  studioAudience(pen, audience);
  if (audience.liftOff !== undefined) earFireworks(pen, audience);
}

/** `draw` with the camera jolted in a little on every kick. */
export function jolted(pen: Pen, draw: () => void): void {
  const zoom = 1 + 0.035 * punch(KICKS, pen.playhead);
  at(
    pen,
    {
      x: (width / 2) * (1 - zoom),
      y: (height / 2) * (1 - zoom),
      scale: zoom,
    },
    draw,
  );
}
