import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { lookAt } from './pose';

describe('lookAt', () => {
  it('grows and opens its grin as it comes nearer', () => {
    let last = lookAt(0);
    for (let n = 0.1; n <= 1; n += 0.1) {
      const look = lookAt(n);
      assert.ok(look.bunnyScale > last.bunnyScale);
      assert.ok(look.grin > last.grin);
      last = look;
    }
  });

  it('keeps its mouth shut and its buttons on when far', () => {
    assert.equal(lookAt(0).grin, 0);
    assert.equal(lookAt(0).eyes, 'button');
    assert.equal(lookAt(0).aura, 0);
  });

  it('lights its eyes only when near', () => {
    assert.equal(lookAt(0.7).eyes, 'button');
    assert.equal(lookAt(0.75).eyes, 'glow');
    assert.equal(lookAt(1).grin, 1);
  });

  it('clamps nearness to [0, 1]', () => {
    assert.deepEqual(lookAt(-3), lookAt(0));
    assert.deepEqual(lookAt(7), lookAt(1));
  });
});
