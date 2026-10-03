/**
 * The spores of the meadow's mushrooms in flight. A mushroom the reconcile
 * brings up comes up in a puff where it stands, the grow sound with it; one
 * the rain sprouts pops smaller, at its start size, as its spore goes. A
 * spore a tap settles falls along an arc from its parent's crown to its foot
 * over `SPORE_FALL_MS`.
 */

import * as Phaser from 'phaser';

import { pick } from '@/shared/lib/collections';

import type { Point } from '../../model/geometry';
import type { MushroomGenes } from '../../model/mushroom-genes';
import { capFrame } from '../../model/mushroom-pose';
import { capSurface } from '../../model/mushroom-profile';
import { SPORE_FALL_MS, SPROUT_START } from '../../model/sprouting';
import type { Shown } from './mushroom-shown';
import { PALETTE } from './palette';
import type { MeadowSound } from './sound';
import { drawnSize, puffSpores } from './spores';

/** How far over the higher end the arc rises, of the distance it spans. */
const RISE = 0.3;
/** How far the arc swings aside, of the distance it spans. */
const SWING = 0.2;
/** How far a newborn's puff opens, of its size as drawn. */
const BIRTH_PUFF = 0.5;

/** Where a puff from `genes`' crown rises, in its frame: a little under its cap's top. */
export function crownOf(genes: MushroomGenes): Point {
  return capFrame(genes)({ x: 0, y: capSurface(genes, 0) * 0.9 });
}

/**
 * Brings up `born`, the mushrooms just shown: a puff at each one's foot and
 * the grow sound, a sprout's puff as small as it comes up.
 */
export function driftSpores(
  scene: Phaser.Scene,
  voice: MeadowSound,
  born: readonly Shown[],
  depth: number,
): void {
  for (const newborn of born) {
    const share = newborn.sprout ? SPROUT_START : 1;
    puffAt(scene, newborn, BIRTH_PUFF * share, depth);
    voice.grow();
  }
}

/** A puff opening to `share` of `shown`'s drawn size at its foot. */
function puffAt(
  scene: Phaser.Scene,
  shown: Shown,
  share: number,
  depth: number,
): void {
  puffSpores(
    scene,
    () => ({
      ...pick(shown.graphics, 'x', 'y'),
      r: drawnSize(shown) * share,
    }),
    depth,
  );
}

/**
 * A spore of radius `r` falling from wherever `from` stands to wherever `to`
 * does, along an arc, over `SPORE_FALL_MS`; `landed` runs as it lands. Both
 * ends are read every frame, so the dot follows a turn or a walk.
 */
export function fall(
  scene: Phaser.Scene,
  from: () => Point,
  to: () => Point,
  r: number,
  depth: number,
  landed: () => void,
): void {
  const dot = scene.add
    .circle(0, 0, r, PALETTE.spore)
    // An inked rim, as a puff's dots have, so a pale spore reads against the sky.
    .setStrokeStyle(Math.max(1, r * 0.2), PALETTE.ink, 0.45)
    .setDepth(depth)
    .setVisible(false);
  scene.tweens.addCounter({
    from: 0,
    to: 1,
    duration: SPORE_FALL_MS,
    onUpdate: (tween) => {
      const along = Phaser.Math.Easing.Sine.In(tween.getValue() ?? 0);
      dot.setVisible(true).setPosition(...arcAt(from(), to(), SWING)(along));
    },
    onComplete: () => {
      dot.destroy();
      landed();
    },
  });
}

/** The point `t` of the way along an arc from `start` to `end`, rising over both and swung `swing` aside. */
function arcAt(start: Point, end: Point, swing: number) {
  const span = Math.hypot(end.x - start.x, end.y - start.y);
  const bend = {
    x: (start.x + end.x) / 2 + swing * span,
    y: Math.min(start.y, end.y) - RISE * span,
  };
  return (t: number): [number, number] => {
    const [a, b, c] = [(1 - t) ** 2, 2 * (1 - t) * t, t ** 2];
    return [
      a * start.x + b * bend.x + c * end.x,
      a * start.y + b * bend.y + c * end.y,
    ];
  };
}
