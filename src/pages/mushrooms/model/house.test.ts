import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { containsPoint, type Point } from './geometry';
import {
  doorPlace,
  EMPTY_HOUSE,
  furnished,
  type House,
  PANE,
  windowSlots,
} from './house';
import { CAP_KINDS, mushroomGenes } from './mushroom-genes';
import { domeBand, stemOutline } from './mushroom-outline';

const SEEDS = Array.from({ length: 2000 }, (_, index) => index * 2_654_435_761);
const everyMushroom = CAP_KINDS.flatMap((cap) =>
  SEEDS.map((seed) => mushroomGenes({ seed, cap })),
);

/** A box's four corners, `width` by `height` round `middle`. */
function corners({ x, y }: Point, width: number, height = width): Point[] {
  return [-1, 1].flatMap((sx) =>
    [-1, 1].map((sy) => ({
      x: x + (sx * width) / 2,
      y: y + (sy * height) / 2,
    })),
  );
}

describe('windowSlots', () => {
  it('has room for three windows or five, more on a wider cap', () => {
    const counts = new Set<number>();
    for (const genes of everyMushroom) {
      const count = windowSlots(genes).length;
      assert.ok(count === 3 || count === 5, `${count} windows`);
      counts.add(count);
    }
    assert.deepEqual(
      [...counts].toSorted((a, b) => a - b),
      [3, 5],
    );
    const byWidth = everyMushroom.toSorted((a, b) => a.capWidth - b.capWidth);
    const [narrowest] = byWidth;
    const widest = byWidth.at(-1);
    assert.ok(narrowest && widest);
    assert.equal(windowSlots(widest).length, 5);
    assert.equal(windowSlots(narrowest).length, 3);
  });

  it('puts every pane inside the cap as it is drawn', () => {
    for (const genes of everyMushroom) {
      const dome = domeBand(genes, 0);
      for (const slot of windowSlots(genes)) {
        for (const corner of corners(slot, PANE)) {
          assert.ok(
            containsPoint(dome, corner),
            JSON.stringify({ genes, slot }),
          );
        }
      }
    }
  });

  it('keeps the row on the cap’s lower band', () => {
    for (const genes of everyMushroom) {
      for (const { y } of windowSlots(genes)) {
        assert.ok(y - PANE / 2 > 0);
        assert.ok(y + PANE / 2 < genes.capHeight * 0.6);
      }
    }
  });

  it('leaves at least a pane’s width of cap between two windows', () => {
    for (const genes of everyMushroom) {
      const slots = windowSlots(genes);
      for (const [index, a] of slots.entries()) {
        for (const b of slots.slice(index + 1)) {
          assert.ok(Math.hypot(a.x - b.x, a.y - b.y) - PANE >= PANE - 1e-9);
        }
      }
    }
  });

  it('fills from the middle outward, each pair mirroring the other', () => {
    for (const genes of everyMushroom) {
      const [first, ...rest] = windowSlots(genes);
      assert.ok(first);
      assert.equal(first.x, 0);
      for (let index = 0; index < rest.length; index += 2) {
        const left = rest[index];
        const right = rest[index + 1];
        assert.ok(left && right);
        assert.ok(left.x < 0);
        assert.equal(right.x, -left.x);
        assert.equal(right.y, left.y);
        const inner = rest[index - 1];
        if (inner) assert.ok(right.x > inner.x);
      }
    }
  });
});

describe('doorPlace', () => {
  it('stands the door on the stem, just above the ground', () => {
    for (const genes of everyMushroom) {
      const door = doorPlace(genes);
      const stem = stemOutline(genes);
      // Across and along the stem where the door stands, as `stemOutline` turns them.
      const cos = Math.cos(door.tilt);
      const sin = Math.sin(door.tilt);
      for (const { x, y } of corners({ x: 0, y: 0 }, door.width, door.height)) {
        const corner = {
          x: door.x + x * cos + y * sin,
          y: door.y - x * sin + y * cos,
        };
        assert.ok(containsPoint(stem, corner), JSON.stringify(genes));
      }
      assert.ok(door.y - door.height / 2 > 0);
      assert.ok(door.y + door.height / 2 < genes.stemHeight / 2);
    }
  });
});

describe('furnished', () => {
  it('adds windows in the order picked, up to the row’s room', () => {
    let house: House | undefined = EMPTY_HOUSE;
    for (const kind of ['tall', 'cross', 'tall'] as const) {
      assert.ok(house !== undefined);
      house = furnished(house, kind, 3);
    }
    assert.deepEqual(house, {
      windows: ['tall', 'cross', 'tall'],
      door: false,
    });
    assert.equal(furnished(house, 'round', 3), undefined);
    assert.equal(furnished(house, 'door', 3)?.door, true);
  });

  it('puts in one door, and no second', () => {
    const doored = furnished(EMPTY_HOUSE, 'door', 3);
    assert.deepEqual(doored, { windows: [], door: true });
    assert.equal(furnished(doored, 'door', 3), undefined);
  });
});
