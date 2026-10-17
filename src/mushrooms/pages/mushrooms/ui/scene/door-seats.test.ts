import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { OPENING_EYE } from '../../model/ground';
import { anchoredGround, laidOf, placeIn } from './clump-layout';
import { doorSeats } from './door-seats';
import { doorInSight, standingAt } from './door-sight';
import { opened } from './visit-play';

const stand = opened(1, 1180, 820, true);
const ground = stand.layout.mushrooms;
const [first] = stand.mushrooms;
if (!first) throw new Error('A meadow opened with no mushroom');
/** A mushroom grown behind the opening eye, as far as the clump's front stands ahead. */
const behind = { ...first, id: 'behind', foot: { x: 0, y: -first.foot.y } };
const turned = { ...OPENING_EYE, heading: Math.PI };
const meadow = [...stand.mushrooms, behind];
const everyDoor = () => true;

describe('door seats', () => {
  it('stand off the opening world for a mushroom grown behind the opening eye', () => {
    assert.equal(placeIn(ground, behind), undefined);
  });

  it('seat every door the meadow opens with', () => {
    const seats = doorSeats(ground, OPENING_EYE, stand.mushrooms, everyDoor);
    for (const { id } of stand.mushrooms) assert.ok(seats.get(id), id);
  });

  it('seat a door grown behind the opening eye, among the mushrooms the turned eye sees', () => {
    assert.ok(placeIn(anchoredGround(ground, turned), behind));
    const seats = doorSeats(ground, turned, meadow, everyDoor);
    for (const { id } of meadow) assert.ok(seats.get(id), id);
  });

  it('seat a door from the eye as it stands now, never from the opening view', () => {
    assert.ok(placeIn(ground, first));
    assert.equal(placeIn(anchoredGround(ground, turned), first), undefined);
    const seats = doorSeats(
      ground,
      turned,
      meadow,
      ({ id }) => id === first.id,
    );
    const alone = doorInSight(
      standingAt(laidOf(ground.camera, first), first),
      [],
    );
    assert.deepEqual(seats.get(first.id), alone);
  });

  it('seat a door the eye does not see, its mushroom alone', () => {
    const seats = doorSeats(
      ground,
      OPENING_EYE,
      meadow,
      ({ id }) => id === 'behind',
    );
    assert.deepEqual([...seats.keys()], ['behind']);
  });
});
