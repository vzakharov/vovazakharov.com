import type * as Phaser from 'phaser';

import { ellipse, type Point } from '../../model/geometry';
import type { Looking } from '../../model/motion';
import type { MushroomGenes } from '../../model/mushroom-genes';
import { toCanvas } from '../../model/mushroom-outline';
import { capFrame } from '../../model/mushroom-pose';
import { WORM_SEGMENTS, type WormBody } from '../../model/worm';
import { inkFor } from './ink';
import { PALETTE } from './palette';
import { type Brush, fillShape, inkUnder } from './shapes';

/** A worm as its house paints it: its body, and which way a peeking worm looks (`wormPeek`). */
export type ShownWorm = WormBody & Looking;

/**
 * A worm on a mushroom's cap, in the frame `paintHouse` paints in: its
 * segments tail first over one ink round them all, the second from the head
 * in the band's deeper pink, and an eye on the
 * head looking the way it crawls, or about as it peeks.
 */
export function paintWorm(
  graphics: Phaser.GameObjects.Graphics,
  genes: MushroomGenes,
  size: number,
  { segments, head, look }: ShownWorm,
  { ink, tone, lighting }: Brush,
): void {
  const canvas = toCanvas(size);
  const cap = capFrame(genes);
  const place = (point: Point) => canvas(cap(point));
  // In paint order the head is last, so the band sits next to it; with the
  // head gone into its window the tail still leads the list.
  const band = head ? segments.length - 2 : WORM_SEGMENTS - 2;
  const outlines = segments.map((segment) =>
    ellipse(segment, segment.r).map((point) => place(point)),
  );
  // Every segment's ink first, then every fill: one inked body, not a
  // string of rimmed beads.
  for (const outline of outlines) {
    inkUnder(graphics, outline, inkFor(tone(PALETTE.worm)), ink, lighting);
  }
  for (const [index, outline] of outlines.entries()) {
    const fill = index === band ? PALETTE.wormBand : PALETTE.worm;
    graphics.fillStyle(tone(fill));
    fillShape(graphics, outline);
  }
  if (!head) return;
  const along = { x: Math.cos(head.tangent), y: Math.sin(head.tangent) };
  // Forward on the head and toward its upper side, whichever way it crawls.
  const up = 0.3 * Math.sign(along.x);
  const eye = place({
    x: head.x + head.r * (0.35 * along.x - up * along.y + 0.35 * look),
    y: head.y + head.r * (0.35 * along.y + up * along.x),
  });
  graphics.fillStyle(tone(PALETTE.mouseEye));
  fillShape(graphics, ellipse(eye, Math.max(1, head.r * size * 0.28)));
}
