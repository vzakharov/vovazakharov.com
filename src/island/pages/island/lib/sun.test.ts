import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { CENTRE, EAST, NORTH, type Vec3 } from '@/island/shared/globe';

import { intensityFor, sunToward } from './sun';

const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const close = (a: number, b: number) => Math.abs(a - b) < 1e-9;

describe('sunToward', () => {
  it('is a unit vector at the asked elevation over the centre', () => {
    const sun = sunToward(25, 315);
    assert.ok(close(Math.hypot(...sun), 1));
    assert.ok(close(Math.asin(dot(sun, CENTRE)), (25 * Math.PI) / 180));
  });

  it('comes from the north-west at azimuth 315', () => {
    const sun = sunToward(25, 315);
    assert.ok(dot(sun, NORTH) > 0, 'north of the centre');
    assert.ok(dot(sun, EAST) < 0, 'west of the centre');
    assert.ok(close(dot(sun, NORTH), -dot(sun, EAST)), 'halfway between');
  });

  it('stands overhead at elevation 90', () => {
    assert.ok(close(dot(sunToward(90, 0), CENTRE), 1));
  });
});

describe('intensityFor', () => {
  it('lays the asked irradiance on level ground', () => {
    const elevation = 25;
    const sun = sunToward(elevation, 315);
    const intensity = intensityFor(1.5, elevation);
    assert.ok(close(intensity * dot(sun, CENTRE), 1.5));
  });
});
