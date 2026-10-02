import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Action } from '../../model/game';
import type { FlowerFoot } from '../../model/ground';
import { FlowerHold, LONG_PRESS } from './flower-hold';

const FOOT: FlowerFoot = { x: 10, y: 20, size: 1 };

/** A hold whose finger has stood still for `still()`, with the flower `id` standing at `FOOT`. */
function holding(still: () => number | undefined) {
  const sent: Action[] = [];
  const hold = new FlowerHold({
    heldStill: still,
    footOf: (id) => (id === 'f1' ? FOOT : undefined),
    dispatch: (action) => {
      sent.push(action);
    },
  });
  return { hold, sent };
}

describe('a long press on a flower', () => {
  it('opens the picker on it once held still long enough, and only once', () => {
    let still = 0;
    const { hold, sent } = holding(() => still);
    hold.press('f1');
    hold.update();
    still = LONG_PRESS - 0.01;
    hold.update();
    assert.deepEqual(sent, []);
    still = LONG_PRESS;
    hold.update();
    still = LONG_PRESS * 2;
    hold.update();
    assert.deepEqual(sent, [{ kind: 'flower', id: 'f1', foot: FOOT }]);
  });

  it('is forgotten once the finger turns, steps or lifts', () => {
    let still: number | undefined = 0.1;
    const { hold, sent } = holding(() => still);
    hold.press('f1');
    hold.update();
    still = undefined;
    hold.update();
    // A later press elsewhere held as long does not open it.
    still = LONG_PRESS;
    hold.update();
    assert.deepEqual(sent, []);
  });

  it('opens nothing on a flower the screen has no room for', () => {
    const { hold, sent } = holding(() => LONG_PRESS);
    hold.press('f2');
    hold.update();
    assert.deepEqual(sent, []);
  });
});
