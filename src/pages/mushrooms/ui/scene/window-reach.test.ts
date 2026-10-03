import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { containsPoint, type Point } from '../../model/geometry';
import { PANE, windowSlots } from '../../model/house';
import {
  MUSHROOM_SPECIES,
  type MushroomGenes,
  mushroomGenes,
} from '../../model/mushroom-genes';
import { toCanvas } from '../../model/mushroom-outline';
import { capFrame } from '../../model/mushroom-pose';
import {
  tappedPart,
  WINDOW_REACH,
  windowFace,
  windowReaches,
} from './window-reach';

const INK = 2;

/** A rectangle's corners, from `left`, `bottom` to `right`, `top`. */
const box = (left: number, bottom: number, right: number, top: number) => [
  { x: left, y: bottom },
  { x: right, y: bottom },
  { x: right, y: top },
  { x: left, y: top },
];
/** From a cap's own frame to the canvas, on a cap of `genes` drawn `size` px to its unit. */
const placeOn = (genes: MushroomGenes, size: number) => (point: Point) =>
  toCanvas(size)(capFrame(genes)(point));

/** A door `below` px under a window row, its tap area a 32 px circle. */
const door = (below: number) => ({
  x: 0,
  y: below,
  holds: ({ x, y }: Point) => Math.hypot(x, y - below) <= 32,
});

const everyMushroom = MUSHROOM_SPECIES.flatMap((species) =>
  [1, 7, 42, 977].map((seed) => mushroomGenes({ seed, species })),
);

describe('a window’s tap reach', () => {
  it('takes in its whole painted pane, at any size', () => {
    for (const genes of everyMushroom) {
      for (const size of [60, 200, 600]) {
        const slots = windowSlots(genes);
        const reaches = windowReaches(genes, size, slots.length, INK);
        assert.equal(reaches.length, slots.length);
        for (const [index, reach] of reaches.entries()) {
          const slot = slots[index] ?? { x: 0, y: 0 };
          const place = placeOn(genes, size);
          for (const corner of box(-0.5, -0.5, 0.5, 0.5)) {
            const at = place({
              x: slot.x + corner.x * PANE,
              y: slot.y + corner.y * PANE,
            });
            assert.ok(Math.hypot(at.x - reach.x, at.y - reach.y) <= reach.r);
          }
        }
      }
    }
  });

  it('is never under `WINDOW_REACH`, and no more than it round a small pane', () => {
    for (const genes of everyMushroom) {
      for (const reach of windowReaches(genes, 60, 5, INK)) {
        assert.equal(reach.r, WINDOW_REACH);
      }
      for (const reach of windowReaches(genes, 600, 5, INK)) {
        assert.ok(reach.r > WINDOW_REACH);
      }
    }
  });

  it('holds only as many windows as are put in', () => {
    const genes = everyMushroom[0];
    assert.ok(genes);
    assert.equal(windowReaches(genes, 200, 2, INK).length, 2);
    assert.equal(windowReaches(genes, 200, 0, INK).length, 0);
  });

  it('keeps every window’s middle on the face it is cut to', () => {
    for (const genes of everyMushroom) {
      const face = windowFace(genes, 200);
      for (const reach of windowReaches(genes, 200, 5, INK)) {
        assert.ok(containsPoint(face, reach));
      }
    }
  });
});

describe('a tap on a house', () => {
  /** A cap's face as a box 100 px wide and 24 tall, its windows' row across its middle. */
  const face = box(-50, -12, 50, 12);
  const reaches = [
    { x: 0, y: 0, r: 16 },
    { x: -30, y: 0, r: 16 },
    { x: 30, y: 0, r: 16 },
  ];
  const taken = (finger: Point, below = 40) =>
    tappedPart(finger, door(below), reaches, face);

  it('goes to the window whose reach holds it', () => {
    assert.equal(taken({ x: -28, y: 4 }), 1);
    assert.equal(taken({ x: 33, y: -3 }), 2);
  });

  it('is cut to the cap: within a window’s reach but off its face, the tap finds no window', () => {
    assert.equal(taken({ x: -30, y: -11 }), 1);
    assert.equal(taken({ x: -30, y: -14 }), undefined);
    assert.equal(
      tappedPart({ x: 0, y: -14 }, undefined, reaches, face),
      undefined,
    );
  });

  it('goes to the nearer middle where a window’s reach and the door’s overlap', () => {
    // 10 px under the middle window's, 30 over the door's 40 px down.
    assert.ok(door(40).holds({ x: 0, y: 10 }));
    assert.equal(taken({ x: 0, y: 10 }), 0);
    // 11 px under the window's, 9 over the door's 20 px down.
    assert.equal(taken({ x: 0, y: 11 }, 20), 'door');
  });

  it('goes to the door off the windows', () => {
    assert.equal(taken({ x: 0, y: 30 }), 'door');
    assert.equal(taken({ x: 200, y: 0 }), undefined);
  });
});
