import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { conductingPaw, hopAt, lookAt } from './pose';

describe('hopAt', () => {
  it('lands squashed on the ground at 0', () => {
    const landing = hopAt(0);
    assert.equal(landing.hopHeight, 0);
    assert.ok(landing.stretch < 1);
  });

  it('comes back down to the ground at the end of the hop', () => {
    assert.ok(hopAt(0.999_99).hopHeight < 1);
    assert.deepEqual(hopAt(1.25), hopAt(0.25));
  });

  it('is highest, arms up, halfway through the air', () => {
    const top = hopAt(0.6);
    for (const p of [0, 0.1, 0.3, 0.9]) {
      assert.ok(hopAt(p).hopHeight < top.hopHeight);
      assert.ok(hopAt(p).armsUp < top.armsUp);
    }
  });

  it('sweeps its ears out going up and in coming down', () => {
    assert.ok(hopAt(0.3).earSweep > 0);
    assert.ok(hopAt(0.9).earSweep < 0);
  });

  it('hops a different height for each seed', () => {
    assert.notEqual(hopAt(0.6, 1).hopHeight, hopAt(0.6, 2).hopHeight);
  });
});

describe('conductingPaw', () => {
  it('lands on four distinct beats a bar', () => {
    const beats = [0, 0.25, 0.5, 0.75].map((beat) => conductingPaw(beat));
    assert.equal(new Set(beats.map((paw) => paw.join(','))).size, 4);
  });

  it('repeats every bar', () => {
    for (const beat of [0, 0.1, 0.4, 0.9]) {
      const [x, y] = conductingPaw(beat);
      const [nextX, nextY] = conductingPaw(beat + 1);
      assert.ok(Math.abs(x - nextX) < 1e-9 && Math.abs(y - nextY) < 1e-9);
    }
  });

  it('comes back to the downbeat at the end of the bar', () => {
    const [x, y] = conductingPaw(0.999_99);
    const [downX, downY] = conductingPaw(0);
    assert.ok(Math.hypot(x - downX, y - downY) < 1);
  });
});

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
