/**
 * The spores the mushrooms a reconcile brings up come with. One the child
 * grew comes up in a puff where it stands. A shed's sprouts come up where
 * their parent's spores land, so the child sees the cause: the parent puffs
 * from its crown, a few dots fall along an arc to each sprout's foot over
 * `SPORE_FALL_MS`, and as they land a small puff and the grow sound go with
 * the sprout popping up.
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
import { drawnAt, drawnSize, puffFrom, puffSpores } from './spores';

/** How many dots fall to each sprout. */
const DOTS = 4;
/** How late in the fall the last dot sets off; every dot lands as it ends. */
const STAGGER = 0.3;
/** How far over the higher end the arc rises, of the distance it spans. */
const RISE = 0.3;
/** How far a dot's arc swings aside from the next's, of the distance it spans. */
const SWING = 0.2;
/** A dot's radius, of its parent's cap width as drawn. */
const DOT = 0.05;
/** How far a newborn's puff opens, of its size as drawn. */
const BIRTH_PUFF = 0.5;

/** Where a puff from `genes`' crown rises, in its frame: a little under its cap's top. */
export function crownOf(genes: MushroomGenes): Point {
  return capFrame(genes)({ x: 0, y: capSurface(genes, 0) * 0.9 });
}

/**
 * Brings up the spores of `born`, the mushrooms just shown: a puff and the
 * grow sound at each one without a `sprout`, and each parent's shed drifting
 * from it to its sprouts, the parent looked up among `shown` by id.
 */
export function driftSpores(
  scene: Phaser.Scene,
  voice: MeadowSound,
  born: readonly Shown[],
  shown: ReadonlyMap<string, Shown>,
  depth: number,
): void {
  const shed = new Map<string, Shown[]>();
  for (const newborn of born) {
    const parent = newborn.sprout?.parent;
    if (parent === undefined) {
      puffAt(scene, newborn, BIRTH_PUFF, depth);
      voice.grow();
    } else shed.set(parent, [...(shed.get(parent) ?? []), newborn]);
  }
  for (const [id, sprouts] of shed) {
    const parent = shown.get(id);
    if (!parent) throw new Error(`${id} sheds, shown nowhere`);
    const crown = crownOf(parent.genes);
    puffFrom(scene, parent, crown, 0.75, depth);
    const r = Math.max(1.5, parent.genes.capWidth * drawnSize(parent) * DOT);
    for (const sprout of sprouts) {
      fall(
        scene,
        () => drawnAt(parent, crown),
        sprout,
        r,
        depth,
        () => {
          puffAt(scene, sprout, BIRTH_PUFF * SPROUT_START, depth);
          voice.grow();
        },
      );
    }
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
 * `DOTS` spores falling from wherever `from` stands to `sprout`'s foot, each
 * along its own arc and setting off a little after the last, all landing as
 * the fall ends, when `landed` runs. Both ends are read every frame, so the
 * dots follow a turn or a walk.
 */
function fall(
  scene: Phaser.Scene,
  from: () => Point,
  sprout: Shown,
  r: number,
  depth: number,
  landed: () => void,
): void {
  const dots = Array.from({ length: DOTS }, (_, index) => {
    const share = index / (DOTS - 1);
    const dot = scene.add
      .circle(0, 0, r, PALETTE.spore)
      // An inked rim, as a puff's dots have, so a pale spore reads against the sky.
      .setStrokeStyle(Math.max(1, r * 0.2), PALETTE.ink, 0.45)
      .setDepth(depth)
      .setVisible(false);
    return { dot, setsOff: STAGGER * share, swing: SWING * (share - 0.5) * 2 };
  });
  scene.tweens.addCounter({
    from: 0,
    to: 1,
    duration: SPORE_FALL_MS,
    onUpdate: (tween) => {
      const now = tween.getValue() ?? 0;
      const ends = [from(), pick(sprout.graphics, 'x', 'y')] as const;
      for (const { dot, setsOff, swing } of dots) {
        const gone = (now - setsOff) / (1 - setsOff);
        const along = Phaser.Math.Easing.Sine.In(Math.min(1, gone));
        dot.setVisible(gone > 0).setPosition(...arcAt(...ends, swing)(along));
      }
    },
    onComplete: () => {
      for (const { dot } of dots) dot.destroy();
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
