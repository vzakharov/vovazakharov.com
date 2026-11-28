import type { Seeded } from '@/kernel/shared/typings';

import {
  clipped,
  lerp,
  type Pen,
  type Point,
  polygon,
  STAGE,
} from '@/clip/shared/ink';

import type { Drawing, Local } from './shot';

/** `under`: how deep into sleep a picture is seen from, 0 awake to 1 gone. */
type Dreaming = Seeded & { under: number };

// Past this depth the picture folds into two mirrored halves.
const MIRRORED_FROM = 0.55;
/** What of the stage one pass draws: all of it, or the left half and its mirror on the right. */
type Half = 'whole' | 'left' | 'mirrored';
// Corners of the blob the picture is seen through.
const BLOB_POINTS = 48;

const CENTRE: Point = [STAGE.width / 2, STAGE.height / 2];

/**
 * The outline the picture is seen through: an oval wider than the stage when
 * awake, shrinking and wobbling as sleep deepens; outside it, the stage's ink.
 */
function blob(depth: number, t: number, seed: number): Point[] {
  const radius = lerp(820, 470, depth);
  return Array.from({ length: BLOB_POINTS }, (_, n) => {
    const angle = (n / BLOB_POINTS) * Math.PI * 2;
    const swell =
      1 +
      depth *
        (0.1 * Math.sin(3 * angle + t * 2.1 + seed) +
          0.06 * Math.sin(5 * angle - t * 3.3 + seed * 2));
    return [
      CENTRE[0] + Math.cos(angle) * radius * 1.3 * swell,
      CENTRE[1] + Math.sin(angle) * radius * 0.85 * swell,
    ];
  });
}

/** The picture's own transform about the stage's centre: spin, swell, shear and drift. */
function bend(
  ctx: CanvasRenderingContext2D,
  depth: number,
  { sinceCut: t, p }: Local,
  seed: number,
): void {
  const spin =
    depth *
    (0.14 * Math.sin(t * 0.9 + seed) + 0.32 * depth * t) *
    (seed % 2 === 0 ? 1 : -1);
  const swell =
    1 + 0.12 * depth + 0.4 * depth * p + 0.06 * depth * Math.sin(t * 2.3);
  const shearX = 0.22 * depth * Math.sin(t * 1.7 + seed * 0.7);
  const shearY = 0.1 * depth * Math.sin(t * 1.3 + seed);
  const [cx, cy] = CENTRE;
  ctx.translate(
    cx + 50 * depth * Math.sin(t * 0.8 + seed),
    cy + 30 * depth * Math.cos(t * 0.6 + seed),
  );
  ctx.rotate(spin);
  ctx.transform(1, shearY, shearX, 1, 0, 0);
  ctx.scale(swell, swell);
  ctx.translate(-cx, -cy);
}

/**
 * `draw` as seen on the edge of sleep, `under` of the way under: slowed,
 * spinning, swelling and shearing inside a wobbling oval, and past
 * `MIRRORED_FROM` folded into mirrored halves. Canvas transforms only.
 */
export const halfDream =
  (draw: Drawing, { under: depth, seed }: Dreaming): Drawing =>
  (pen: Pen, local: Local) => {
    const { ctx, playhead } = pen;
    const slow = 1 - 0.45 * depth;
    const cut = playhead - local.sinceCut;
    const dreamt: Local = {
      ...local,
      sinceCut: local.sinceCut * slow,
      seconds: local.seconds * slow,
    };
    const dreamer: Pen = { ...pen, playhead: cut + dreamt.sinceCut };
    const halves: readonly Half[] =
      depth >= MIRRORED_FROM ? ['left', 'mirrored'] : ['whole'];
    clipped(pen, polygon(blob(depth, local.sinceCut, seed)), () => {
      for (const half of halves) {
        ctx.save();
        if (half !== 'whole') {
          ctx.beginPath();
          ctx.rect(half === 'left' ? 0 : CENTRE[0], 0, CENTRE[0], STAGE.height);
          ctx.clip();
        }
        if (half === 'mirrored') {
          ctx.translate(STAGE.width, 0);
          ctx.scale(-1, 1);
        }
        bend(ctx, depth, local, seed);
        draw(dreamer, dreamt);
        ctx.restore();
      }
    });
  };
