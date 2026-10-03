import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { doorFront } from './run-front';

const eye = { x: 0, y: 0 };

describe('run fronts', () => {
  it('a door front stands toward the eye from its foot', () => {
    const front = doorFront({ x: 0, y: 2 }, eye, 0.1, 0);
    assert.ok(Math.abs(front.x) < 1e-9);
    assert.ok(Math.abs(front.y - 1.9) < 1e-9);
  });

  it("a door front moves right on screen by its sill's offset", () => {
    const front = doorFront({ x: 0, y: 2 }, eye, 0, 0.05);
    assert.ok(Math.abs(front.x - 0.05) < 1e-9);
    assert.ok(Math.abs(front.y - 2) < 1e-9);
  });
});
