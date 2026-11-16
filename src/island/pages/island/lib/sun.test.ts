import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { eyeKeeps, intensityFor } from './sun';

describe('intensityFor', () => {
  it('lays the asked irradiance on level ground', () => {
    const elevation = 25;
    const onLevel = Math.sin((elevation * Math.PI) / 180);
    assert.ok(Math.abs(intensityFor(1.5, elevation) * onLevel - 1.5) < 1e-9);
  });
});

describe('eyeKeeps', () => {
  const reference = Math.sin((20 * Math.PI) / 180);

  it('keeps all of a sun no higher than the one it is set by', () => {
    assert.equal(eyeKeeps(reference, 20), 1);
    assert.equal(eyeKeeps(0.05, 20), 1);
    assert.equal(eyeKeeps(-0.3, 20), 1);
  });

  it('lets level ground under a noon sun brighten by less than a half', () => {
    const noon = eyeKeeps(1, 20) / reference;
    assert.ok(noon > 1 && noon < 1.5, `noon lays ${noon} of the opening's`);
  });
});
