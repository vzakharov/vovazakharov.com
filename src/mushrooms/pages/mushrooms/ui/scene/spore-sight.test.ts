import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Point } from '../../model/geometry';
import { OPENING_EYE } from '../../model/ground';
import { bedPlace } from './bed-place';
import type { ShownCover } from './flower-cover';
import { dotInSight } from './spore-sight';
import { viewAt } from './view';
import { opened } from './visit-play';

/** A cover 20 px square round `at`, standing `distance` from the eye. */
function squareRound({ x, y }: Point, distance: number): ShownCover {
  const box = { left: x - 10, right: x + 10, top: y - 10, bottom: y + 10 };
  return {
    distance,
    drawn: [
      {
        outline: [
          { x: box.left, y: box.top },
          { x: box.right, y: box.top },
          { x: box.right, y: box.bottom },
          { x: box.left, y: box.bottom },
        ],
        box,
      },
    ],
  };
}

describe("a spore's dot", () => {
  const { layout, meadow } = opened(1, 1180, 820, false);
  const view = viewAt(layout.camera, OPENING_EYE);
  const [mushroom] = meadow.mushrooms;
  assert.ok(mushroom);
  const { foot } = mushroom;
  const { x, y, distance } = bedPlace(view, foot);

  it('is in sight where it is drawn with nothing nearer over it', () => {
    assert.deepEqual(dotInSight(view, [], foot), { x, y });
    assert.deepEqual(
      dotInSight(view, [squareRound({ x, y }, distance + 1)], foot),
      { x, y },
    );
    assert.deepEqual(
      dotInSight(view, [squareRound({ x: x + 40, y }, distance - 1)], foot),
      { x, y },
    );
  });

  it('is out of sight under a nearer mushroom', () => {
    assert.equal(
      dotInSight(view, [squareRound({ x, y }, distance - 1)], foot),
      undefined,
    );
  });

  it('is out of sight off the screen', () => {
    assert.equal(
      dotInSight(view, [], { ...foot, x: foot.x + 1000 }),
      undefined,
    );
  });
});
