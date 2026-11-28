import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { layOut } from './layout';
import { nailAt } from './nail';

const near = (a: readonly number[], b: readonly number[]): boolean =>
  Math.hypot((a[0] ?? 0) - (b[0] ?? 0), (a[1] ?? 0) - (b[1] ?? 0)) < 1e-6;

describe('nailAt', () => {
  const set = { letterHeight: 100 };
  const { strokes } = layOut('П', set);
  const [first] = strokes;
  const last = strokes.at(-1);

  it('waits off the wall at the first stroke before writing', () => {
    assert.ok(first);
    const nail = nailAt('П', { ...set, progress: 0 });
    assert.equal(nail.pressing, false);
    assert.ok(near(nail.nailTip, first.points[0] ?? []));
  });

  it('presses mid-stroke, at the end of what is drawn', () => {
    const nail = nailAt('П', { ...set, progress: 0.1 });
    assert.equal(nail.pressing, true);
    assert.ok(first);
    const [[ax, ay] = [0, 0], [bx, by] = [0, 0]] = first.points;
    const along = (Math.atan2(by - ay, bx - ax) * 180) / Math.PI;
    assert.ok(Math.abs(nail.strokeHeading - along) < 1e-6);
    assert.ok(!near(nail.nailTip, [ax, ay]));
  });

  it('lifts off at the end of the last stroke', () => {
    assert.ok(last);
    const nail = nailAt('П', { ...set, progress: 1 });
    assert.equal(nail.pressing, false);
    assert.ok(near(nail.nailTip, last.points.at(-1) ?? []));
  });

  it('carries the writing’s place: moved, scaled, turned, mirrored', () => {
    const plain = nailAt('П', { ...set, progress: 0.3 });
    const placed = nailAt('П', {
      ...set,
      progress: 0.3,
      x: 50,
      y: -20,
      scale: 2,
      rot: 90,
    });
    const [px, py] = plain.nailTip;
    // Doubled, turned a quarter clockwise, then moved.
    assert.ok(near(placed.nailTip, [50 - py * 2, -20 + px * 2]));
    assert.ok(
      Math.abs(
        ((placed.strokeHeading - plain.strokeHeading + 360) % 360) - 90,
      ) < 1e-6,
    );
    const mirrored = nailAt('П', { ...set, progress: 0.3, flip: true });
    assert.ok(near(mirrored.nailTip, [-px, py]));
  });
});
