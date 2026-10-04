import * as Phaser from 'phaser';

import {
  type Circle,
  placedAt,
  type Point,
  type Scaled,
} from '../../model/geometry';
import { toCanvas } from '../../model/mushroom-outline';
import type { Splayed } from '../../model/mushroom-pose';
import type { Standing } from './bed-place';
import type { WithGraphics } from './hit-areas';
import { PALETTE } from './palette';

/** Dots in the outer ring; the inner ring has half as many, between them. */
const RING_DOTS = 12;
const PUFF_SECONDS = 0.9;

/**
 * Where a puff stands and how far it opens (`r`), read afresh every frame, so
 * a puff follows what it rose from as a resize or a turn refits the meadow.
 */
type Anchor = () => Circle;

/**
 * A mushroom as the bed last stood it, which the bed moves in place on a
 * refit: `size` as laid out, drawn at its `stands`' zoom.
 */
export type Puffing = WithGraphics & Splayed & Scaled & Standing;

/** How big `body` is drawn as it stands now, in screen px. */
export function drawnSize({ size, stands }: Scaled & Standing): number {
  return size * stands.zoom;
}

/** Where `point`, in `body`'s frame, stands on screen as the bed draws `body` now. */
export function drawnAt(body: Puffing, point: Point): Point {
  return placedAt(body.graphics, body.turn, toCanvas(drawnSize(body))(point));
}

/**
 * A puff of spores from `point`, in `body`'s frame, opening to `share` of its
 * cap's width, wherever and as big as the bed draws `body` as the puff drifts.
 */
export function puffFrom(
  scene: Phaser.Scene,
  body: Puffing,
  point: Point,
  share: number,
  depth: number,
): void {
  puffSpores(
    scene,
    () => ({
      ...drawnAt(body, point),
      r: body.genes.capWidth * drawnSize(body) * share,
    }),
    depth,
  );
}

/**
 * A puff of spores from where `anchor` stands: two rings of dots, the second
 * half a step round from the first, opening to its reach as they drift up.
 * They stay opaque and go by shrinking — a spore fading by alpha takes on
 * whatever is behind it and reads as a hole in the cap or a bubble in the
 * sky. The rings follow `anchor` every frame, and are destroyed when the
 * last dot's flight ends.
 */
export function puffSpores(
  scene: Phaser.Scene,
  anchor: Anchor,
  depth: number,
): void {
  const { x, y, r: reach } = anchor();
  const puff = scene.add.container(x, y).setDepth(depth);
  const follow = () => {
    const now = anchor();
    puff.setPosition(now.x, now.y).setScale(now.r / reach);
  };
  scene.events.on(Phaser.Scenes.Events.UPDATE, follow);
  puff.once(Phaser.GameObjects.Events.DESTROY, () => {
    scene.events.off(Phaser.Scenes.Events.UPDATE, follow);
  });
  const turn = Math.random() * Math.PI * 2;
  const duration = PUFF_SECONDS * 1000;
  for (const [count, spread, radius, offset] of [
    [RING_DOTS, 1, 0.06, 0],
    [RING_DOTS / 2, 0.55, 0.08, 0.5],
  ] as const) {
    for (let index = 0; index < count; index++) {
      const angle = turn + ((index + offset) * Math.PI * 2) / count;
      const dot = scene.add
        .circle(0, 0, reach * radius, PALETTE.spore)
        // An inked rim, so a pale spore still reads against the sky.
        .setStrokeStyle(Math.max(1, reach * 0.012), PALETTE.ink, 0.45)
        .setScale(0.6);
      puff.add(dot);
      scene.tweens.add({
        targets: dot,
        x: Math.cos(angle) * reach * spread,
        // Opening flatter than a circle and drifting up, as a light thing would.
        y: Math.sin(angle) * reach * spread * 0.6 - reach * 0.35,
        duration,
        ease: Phaser.Math.Easing.Cubic.Out,
        onComplete: () => {
          // A destroyed dot leaves its container, which goes with the last.
          dot.destroy();
          if (puff.length === 0) puff.destroy();
        },
      });
      scene.tweens.chain({
        targets: dot,
        tweens: [
          {
            scale: 1.1,
            duration: duration * 0.4,
            ease: Phaser.Math.Easing.Cubic.Out,
          },
          { scale: 1, duration: duration * 0.26 },
          // The last third, shrunk to nothing.
          {
            scale: 0,
            duration: duration * 0.34,
            ease: Phaser.Math.Easing.Quadratic.In,
          },
        ],
      });
    }
  }
}
