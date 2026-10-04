import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { meadowLayout } from '../ui/scene/layout';
import { VISITS } from '../ui/scene/viewports';
import { OPENING_EYE } from './ground';
import { headedLight, PICTOGRAM_LIGHT, sunLight } from './light';

describe('sunLight', () => {
  for (const [name, width, height, side] of [
    ['tablet', 1180, 820, 1],
    ['phone', 390, 844, -1],
  ] as const) {
    it(`points up and to the ${side > 0 ? 'right' : 'left'}, at unit length, on a ${name} screen`, () => {
      for (const seed of VISITS.slice(0, 50)) {
        const { toward } = sunLight(meadowLayout(width, height, seed));
        assert.ok(Math.sign(toward.x) === side, `x ${toward.x}`);
        assert.ok(toward.y < 0, `y ${toward.y}`);
        assert.ok(Math.abs(Math.hypot(toward.x, toward.y) - 1) < 1e-9);
      }
    });
  }
});

describe('PICTOGRAM_LIGHT', () => {
  it('comes from the upper left, at unit length', () => {
    const { toward } = PICTOGRAM_LIGHT;
    assert.ok(toward.x < 0 && toward.y < 0);
    assert.ok(Math.abs(Math.hypot(toward.x, toward.y) - 1) < 1e-9);
  });
});

describe('headedLight', () => {
  const light = sunLight(meadowLayout(1180, 820, VISITS[0] ?? 0));
  const { x, y } = light.toward;
  /** The sun's azimuth off the opening heading, as the opening eye sees it. */
  const sun = Math.asin(x);

  it('is the light itself at the opening heading', () => {
    assert.deepEqual(headedLight(light, OPENING_EYE.heading), light);
  });

  it('is the sine of the sun’s azimuth off the heading, its height kept, all round a turn', () => {
    for (let step = 0; step <= 16; step++) {
      const heading = (step / 16) * 2 * Math.PI;
      const { toward } = headedLight(light, heading);
      assert.ok(Math.abs(toward.x - Math.sin(sun - heading)) < 1e-12);
      assert.equal(toward.y, y);
    }
  });

  it('comes from straight ahead facing the sun, from the other side turned past it, and from behind facing away', () => {
    assert.ok(Math.abs(headedLight(light, sun).toward.x) < 1e-12);
    assert.ok(headedLight(light, sun + 0.5).toward.x < 0);
    assert.ok(headedLight(light, sun - 0.5).toward.x > 0);
    const behind = headedLight(light, Math.PI).toward.x;
    assert.ok(Math.abs(behind + x) < 1e-12);
  });
});
