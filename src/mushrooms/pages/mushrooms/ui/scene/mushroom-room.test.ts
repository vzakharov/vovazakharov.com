import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { firstMeadow } from '../../model/game';
import { type Eye, OPENING_EYE } from '../../model/ground';
import { grownOn } from '../../model/placement';
import { mulberry32 } from '../../model/random';
import { standOf } from './flower-sight';
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
      return grownOn(OPENING_EYE, { x: asked.times, z: 0 });
    },
    () => fitting.now,
  );
  return { asked, fitting, room };
}

describe('the room kept for the next mushroom', () => {
  const layout = meadowLayout(1180, 820, 1);
  const stand = standOf(layout, [], firstMeadow(mulberry32(1)));
  const from = (eye: Eye) => viewAt(layout.camera, eye);
  const opening = from(OPENING_EYE);
  const turned = from({ ...OPENING_EYE, heading: 0.1 });

  it('answers again from what it found while nothing changes', () => {
    const { asked, room } = counted();
    const first = grownOn(OPENING_EYE, { x: 1, z: 0 });
    assert.deepEqual(room(stand, 7), first);
    assert.deepEqual(room({ ...stand }, 7), first);
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
    room({ ...stand, mushrooms: [...stand.mushrooms] }, 7);
    room({ ...stand, planted: [...stand.planted] }, 7);
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
  const layout = meadowLayout(1180, 820, 1);
  const stand = standOf(layout, [], firstMeadow(mulberry32(1)));
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
        const { x } = ofGround(view, foot.foot);
        assert.ok(
          x > 0 && x < layout.width,
          `${name}: seed ${String(seed)}'s foot at ${x.toFixed(0)} px across a ${String(layout.width)} px screen`,
        );
      }
    }
  });

  it('grows behind the opening eye facing away from it, on the screen the view shows', () => {
    const view = viewAt(layout.camera, { ...OPENING_EYE, heading: Math.PI });
    const found = roomFor(stand, 3, view);
    assert.ok(found);
    assert.ok(found.foot.y < 0);
    const { x } = ofGround(view, found.foot);
    assert.ok(x > 0 && x < layout.width);
  });
});
