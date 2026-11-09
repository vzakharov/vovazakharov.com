import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  CENTRE,
  dot,
  EAST,
  latLonToUnit,
  length,
  NORTH,
  northAt,
} from '@/island/shared/globe';

import { intensityFor, sunToward } from './sun';

const close = (a: number, b: number) => Math.abs(a - b) < 1e-9;

describe('sunToward', () => {
  it('is a unit vector at the asked elevation over the place', () => {
    const sun = sunToward(25, 315, CENTRE);
    assert.ok(close(length(sun), 1));
    assert.ok(close(Math.asin(dot(sun, CENTRE)), (25 * Math.PI) / 180));
  });

  it('comes from the north-west at azimuth 315', () => {
    const sun = sunToward(25, 315, CENTRE);
    assert.ok(dot(sun, NORTH) > 0, 'north of the centre');
    assert.ok(dot(sun, EAST) < 0, 'west of the centre');
    assert.ok(close(dot(sun, NORTH), -dot(sun, EAST)), 'halfway between');
  });

  it('stands overhead at elevation 90', () => {
    assert.ok(close(dot(sunToward(90, 0, CENTRE), CENTRE), 1));
  });

  it('reads the horizon of the place it is given', () => {
    const at = latLonToUnit({ lat: 0.66, lon: 0.26 });
    const sun = sunToward(30, 0, at);
    assert.ok(close(Math.asin(dot(sun, at)), (30 * Math.PI) / 180));
    assert.ok(dot(sun, northAt(at)) > 0, 'from the north');
  });
});

describe('intensityFor', () => {
  it('lays the asked irradiance on level ground', () => {
    const elevation = 25;
    const sun = sunToward(elevation, 315, CENTRE);
    const intensity = intensityFor(1.5, elevation);
    assert.ok(close(intensity * dot(sun, CENTRE), 1.5));
  });
});
