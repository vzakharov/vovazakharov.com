import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { handStroke, jitter, tiltOf } from './hand.ts';

describe('jitter', () => {
  it('is stable per id and salt, and stays in [-1, 1)', () => {
    assert.equal(jitter('star-1', 'tilt'), jitter('star-1', 'tilt'));
    assert.notEqual(jitter('star-1', 'tilt'), jitter('star-2', 'tilt'));
    assert.notEqual(jitter('star-1', 'tilt'), jitter('star-1', 'side'));
    for (const id of ['a', 'b', 'call-7', 'z-bite0', '']) {
      const value = jitter(id);
      assert.ok(value >= -1 && value < 1, `${id} → ${value}`);
    }
  });

  it('spreads ids that differ only in their last character', () => {
    const values = ['1', '2', '3', '4', '5', '6', '7', '8'].map((n) =>
      jitter(`star-${n}`, 'tilt'),
    );
    assert.ok(values.some((value) => value < -0.2));
    assert.ok(values.some((value) => value > 0.2));
  });
});

describe('tiltOf', () => {
  it('keeps headings straight and zones nearly so', () => {
    assert.equal(tiltOf('title', 'text'), 0);
    assert.ok(Math.abs(tiltOf('z-star', 'zone')) <= 0.5);
    assert.ok(Math.abs(tiltOf('star-1', 'sticky')) <= 2.6);
  });
});

describe('handStroke', () => {
  it('runs from a to b, its midpoint bowed off the straight line', () => {
    const a = { x: 0, y: 0 };
    const b = { x: 400, y: 0 };
    const { d, mid } = handStroke(a, b, 'l-1');
    assert.match(d, /^M0,0 C.+ 400,0$/);
    assert.ok(Math.abs(mid.y) > 20, `midpoint ${mid.y} sits on the chord`);
  });

  it('draws the second pass close beside the first', () => {
    const a = { x: 0, y: 0 };
    const b = { x: 0, y: 300 };
    const first = handStroke(a, b, 'l-2').mid;
    const second = handStroke(a, b, 'l-2', 1).mid;
    assert.notDeepEqual(first, second);
    assert.ok(Math.hypot(first.x - second.x, first.y - second.y) < 10);
  });
});
