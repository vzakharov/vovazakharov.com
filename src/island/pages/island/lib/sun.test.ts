import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { intensityFor } from './sun';

describe('intensityFor', () => {
  it('lays the asked irradiance on level ground', () => {
    const elevation = 25;
    const onLevel = Math.sin((elevation * Math.PI) / 180);
    assert.ok(Math.abs(intensityFor(1.5, elevation) * onLevel - 1.5) < 1e-9);
  });
});
