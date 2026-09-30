import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { firstMeadow } from '../../model/game';
import type { Point } from '../../model/geometry';
import type { Ground } from '../../model/ground';
import { clampLeft, openingPan, type Pan, worldOf } from '../../model/pan';
import { mulberry32 } from '../../model/random';
import { placeOf } from './clump-layout';
import { meadowLayout } from './layout';
import { keptRoom, roomFor } from './mushroom-room';

/** A crop of `pan` at rest, as the scene's crop converts to the world. */
function cropOf(pan: Pan) {
  return {
    toWorld: <Placed extends Point>(point: Placed): Placed => ({
      ...point,
      x: worldOf(pan, 0, point.x),
    }),
  };
}

/** `pan` come to rest with its left edge at `left`, held inside the world. */
const restingAt = (pan: Pan, left: number): Pan => ({
  ...pan,
  motion: { kind: 'rest', left: clampLeft(pan, left) },
});

/**
 * `keptRoom` over a finder that counts how often it is asked, and a crop
 * test that holds a foot while `fitting` says so.
 */
function counted(fitting = { now: true }) {
  const asked = { times: 0 };
  const room = keptRoom(
    () => {
      asked.times += 1;
      return { x: asked.times, z: 0 };
    },
    () => fitting.now,
  );
  return { asked, room };
}

describe('the room kept for the next mushroom', () => {
  const { mushrooms, planted } = firstMeadow(mulberry32(1));
  const layout = meadowLayout(1180, 820, 1);
  const stand = { layout, flowers: [], mushrooms, planted };
  const opening = openingPan(layout.camera);

  it('answers again from what it found while nothing changes', () => {
    const { asked, room } = counted();
    assert.deepEqual(room(stand, 7), { x: 1, z: 0 });
    assert.deepEqual(room({ ...stand }, 7), { x: 1, z: 0 });
    assert.equal(asked.times, 1);
  });

  it('finds the room again once a resize lays the same meadow out anew', () => {
    const { asked, room } = counted();
    room(stand, 7);
    room({ ...stand, layout: meadowLayout(1180, 760, 1) }, 7);
    assert.equal(asked.times, 2);
  });

  it('finds the room again once the mushrooms, the plantings or the seed change', () => {
    const { asked, room } = counted();
    room(stand, 7);
    room({ ...stand, mushrooms: [...mushrooms] }, 7);
    room({ ...stand, planted: [...planted] }, 7);
    room(stand, 8);
    assert.equal(asked.times, 4);
  });

  it('keeps the room it found over a pan while the foot still fits the crop, and finds it again once it does not', () => {
    const fitting = { now: true };
    const { asked, room } = counted(fitting);
    room(stand, 7, cropOf(opening));
    room(stand, 7, cropOf(restingAt(opening, 0)));
    assert.equal(asked.times, 1);
    fitting.now = false;
    room(stand, 7, cropOf(restingAt(opening, 10)));
    assert.equal(asked.times, 2);
  });

  it('looks for room again on a pan where it found none', () => {
    let asked = 0;
    const room = keptRoom(
      () => {
        asked += 1;
        return undefined;
      },
      () => true,
    );
    room(stand, 7, cropOf(opening));
    room(stand, 7, cropOf(opening));
    assert.equal(asked, 1);
    room(stand, 7, cropOf(restingAt(opening, 0)));
    assert.equal(asked, 2);
  });
});

describe('the room a `+` finds', () => {
  const { mushrooms, planted } = firstMeadow(mulberry32(1));
  const layout = meadowLayout(1180, 820, 1);
  const stand = { layout, flowers: [], mushrooms, planted };
  const opening = openingPan(layout.camera);
  const crops = [
    opening,
    restingAt(opening, 0),
    restingAt(opening, layout.camera.world),
  ];

  /** Where across the screen `pan` shows `foot`. */
  const across = (pan: Pan, foot: Ground) =>
    placeOf(layout.camera, foot).x - worldOf(pan, 0, 0);

  it('grows the next mushroom inside the crop the screen shows, wherever it is panned to', () => {
    for (const pan of crops) {
      for (const seed of [3, 11, 29, 47]) {
        const foot = roomFor(stand, seed, cropOf(pan));
        assert.ok(foot, `seed ${String(seed)} found no room`);
        const x = across(pan, foot);
        assert.ok(
          x > 0 && x < layout.width,
          `seed ${String(seed)}'s foot at ${x.toFixed(0)} px across a ${String(layout.width)} px screen`,
        );
      }
    }
  });
});
