import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { BUD, folding, OPEN, petalPose } from './flower-fold';

describe('folding', () => {
  it('leaves an open head as it is', () => {
    assert.deepEqual(OPEN, { closing: 0, disc: 1, width: 1 });
  });

  it('hides the centre under the petals and widens them as the head closes', () => {
    const half = folding(0.5);
    const shut = folding(1);
    assert.ok(half.disc < OPEN.disc && shut.disc === 0);
    assert.ok(OPEN.width < half.width && half.width < shut.width);
    assert.equal(folding(1.4).closing, 1);
  });
});

function close(one: number, other: number): void {
  assert.ok(Math.abs(one - other) < 1e-9, `${one} ≉ ${other}`);
}

describe('petalPose', () => {
  const span = [3, 20] as const;

  it('leaves an open petal where it points, from its start out', () => {
    const [foot, angle, [, length]] = petalPose(0.7, span, 0);
    close(angle, 0.7);
    close(length, 17);
    close(Math.hypot(foot.x, foot.y), 3);
  });

  it('stands every petal of a shut head up into a bud about two-thirds the open head high', () => {
    const tips = Array.from({ length: 5 }, (_, index) => {
      const [foot, angle, [, length]] = petalPose(
        (index * Math.PI * 2) / 5,
        span,
        1,
      );
      assert.ok(Math.sin(angle) < -0.8, 'points up');
      close(foot.y, BUD.foot * 20);
      return foot.y + Math.sin(angle) * length;
    });
    for (const tip of tips) close(tip, -BUD.tip * 20);
    const height = (BUD.foot + BUD.tip) * 20;
    assert.ok(height > 0.6 * 40 && height < 0.75 * 40);
  });

  it('turns a petal the short way round', () => {
    const left = petalPose(Math.PI, span, 0.5)[1];
    assert.ok(left > Math.PI && left < (Math.PI * 3) / 2, `${left}`);
    const right = petalPose(0, span, 0.5)[1];
    assert.ok(right < 0 && right > -Math.PI / 2, `${right}`);
  });
});
