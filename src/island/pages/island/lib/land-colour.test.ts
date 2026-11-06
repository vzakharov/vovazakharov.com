import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { landColours } from './land-colour';

const at = (height: number) => [...landColours(new Float32Array([height]))];

describe('landColours', () => {
  it('gives the sea floor the shore sand', () => {
    assert.deepEqual(at(-500), at(0));
  });

  it('runs sand, green, brown, pale up the heights', () => {
    const [sand, green, brown, pale] = [at(0), at(300), at(900), at(3000)];
    const [sr = 0, sg = 0] = sand;
    const [gr = 0, gg = 0, gb = 0] = green;
    const [br = 0, bg = 0, bb = 0] = brown;
    const [pr = 0, pg = 0, pb = 0] = pale;
    assert.ok(sr > gr && sg > gg, 'sand is lighter than lowland');
    assert.ok(gg > gr && gg > gb, 'lowland is green');
    assert.ok(br > bg && bg > bb, 'upland is brown');
    assert.ok(pr > 0.8 && pg > 0.8 && pb > 0.8, 'peaks are pale');
  });

  it('is continuous across a stop', () => {
    const [below = 0] = at(449.9);
    const [above = 0] = at(450.1);
    assert.ok(Math.abs(below - above) < 1e-3);
  });
});
