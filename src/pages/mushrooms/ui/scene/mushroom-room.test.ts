import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { firstMeadow } from '../../model/game';
import { type Eye, OPENING_EYE } from '../../model/ground';
import { mulberry32 } from '../../model/random';
import { meadowLayout } from './layout';
import { keptRoom, roomFor } from './mushroom-room';
import { ofGround, viewAt } from './view';

/**
 * `keptRoom` over a finder that counts how often it is asked, and a view
 * test that holds a foot while `fitting` says so.
 */
function counted() {
  const fitting = { now: true };
  const asked = { times: 0 };
  const room = keptRoom(
    () => {
      asked.times += 1;
      return { x: asked.times, z: 0 };
    },
    () => fitting.now,
  );
  return { asked, fitting, room };
}

describe('the room kept for the next mushroom', () => {
  const { mushrooms, planted, pulled } = firstMeadow(mulberry32(1));
  const layout = meadowLayout(1180, 820, 1);
  const stand = { layout, flowers: [], mushrooms, planted, pulled };
  const from = (eye: Eye) => viewAt(layout.camera, eye);
  const opening = from(OPENING_EYE);
  const turned = from({ ...OPENING_EYE, heading: 0.1 });

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

  it('keeps the room it found over a turn or a step while the foot still fits the view, and finds it again once it does not', () => {
    const { asked, fitting, room } = counted();
    room(stand, 7, opening);
    room(stand, 7, turned);
    assert.equal(asked.times, 1);
    fitting.now = false;
    room(stand, 7, from({ ...OPENING_EYE, y: 1 }));
    assert.equal(asked.times, 2);
  });

  it('looks for room again on a turn where it found none', () => {
    let asked = 0;
    const room = keptRoom(
      (): undefined => {
        asked += 1;
      },
      () => true,
    );
    room(stand, 7, opening);
    room(stand, 7, from(OPENING_EYE));
    assert.equal(asked, 1);
    room(stand, 7, turned);
    assert.equal(asked, 2);
  });
});

describe('the room a `+` finds', () => {
  const { mushrooms, planted, pulled } = firstMeadow(mulberry32(1));
  const layout = meadowLayout(1180, 820, 1);
  const stand = { layout, flowers: [], mushrooms, planted, pulled };
  const eyes: ReadonlyArray<readonly [string, Eye]> = [
    ['the opening eye', OPENING_EYE],
    ['an eye turned', { ...OPENING_EYE, heading: 0.3 }],
    ['an eye stepped in', { ...OPENING_EYE, y: OPENING_EYE.y + 1 }],
  ];

  it('grows the next mushroom on the screen the view shows, wherever the eye stands and faces', () => {
    for (const [name, eye] of eyes) {
      const view = viewAt(layout.camera, eye);
      for (const seed of [3, 11, 29, 47]) {
        const foot = roomFor(stand, seed, view);
        assert.ok(foot, `${name}: seed ${String(seed)} found no room`);
        const { x } = ofGround(view, foot);
        assert.ok(
          x > 0 && x < layout.width,
          `${name}: seed ${String(seed)}'s foot at ${x.toFixed(0)} px across a ${String(layout.width)} px screen`,
        );
      }
    }
  });

  it('finds no room facing away from the wedge, whose ground is bare', () => {
    const view = viewAt(layout.camera, { ...OPENING_EYE, heading: Math.PI });
    assert.equal(roomFor(stand, 3, view), undefined);
  });
});
