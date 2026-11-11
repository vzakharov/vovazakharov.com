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
  it('keeps headings straight and zones within their tilt', () => {
    assert.equal(tiltOf('title', 'text'), 0);
    assert.ok(Math.abs(tiltOf('z-star', 'zone')) <= 1.2);
    assert.ok(Math.abs(tiltOf('star-1', 'sticky')) <= 2.6);
  });
});

describe('handStroke', () => {
  it('runs from a to b, its midpoint bowed off the straight line', () => {
    const a = { x: 0, y: 0 };
    const b = { x: 400, y: 0 };
    const { d, mid } = handStroke(a, b, { id: 'l-1' });
    assert.match(d, /^M0,0 C.+ 400,0$/);
    assert.ok(Math.abs(mid.y) > 20, `midpoint ${mid.y} sits on the chord`);
  });

  it('draws the second pass close beside the first', () => {
    const a = { x: 0, y: 0 };
    const b = { x: 0, y: 300 };
    const first = handStroke(a, b, { id: 'l-2' }).mid;
    const second = handStroke(a, b, { id: 'l-2' }, 1).mid;
    assert.notDeepEqual(first, second);
    assert.ok(Math.hypot(first.x - second.x, first.y - second.y) < 10);
  });
});

/** The control points of a single-cubic path `M… C c1 c2 b`. */
function controls(d: string): Array<[number, number]> {
  return [...d.matchAll(/(-?[\d.]+),(-?[\d.]+)/g)].map((m) => [
    Number(m[1]),
    Number(m[2]),
  ]);
}

describe('a clockwise spiral', () => {
  const a = { x: 0, y: 0 };
  const b = { x: 800, y: 0 };
  // Ids whose jitter bows a plain line to either side, so the turn is the spiral's own.
  const ids = ['l-way', 'l-1', 'l-2', 'star-3', 'x'];

  it('turns right on screen, whatever side its id would bow a plain line to', () => {
    for (const id of ids) {
      const { mid } = handStroke(a, b, { id, spiral: 'cw' });
      // Heading east with y pointing down, a right turn bulges up.
      assert.ok(mid.y < -20, `${id}: midpoint ${mid.y}`);
    }
  });

  it('leaves its start straighter than it reaches its end', () => {
    for (const id of ids) {
      const [, c1, c2, end] = controls(
        handStroke(a, b, { id, spiral: 'cw' }).d,
      );
      assert.ok(c1 !== undefined && c2 !== undefined && end !== undefined);
      const startTurn = Math.abs(Math.atan2(c1[1], c1[0]));
      const endTurn = Math.abs(Math.atan2(end[1] - c2[1], end[0] - c2[0]));
      assert.ok(endTurn > startTurn * 1.5, `${id}: ${startTurn} → ${endTurn}`);
    }
  });
});
