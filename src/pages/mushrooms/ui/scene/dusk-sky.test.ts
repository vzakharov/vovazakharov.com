import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  darkScheme,
  duskReach,
  moonAt,
  moonBelow,
  onTheSun,
  starClear,
  sunOnScreen,
  sunSunk,
} from './dusk-sky';
import { duskStars, STAR_RAY_REACH } from './dusk-stars';
import { meadowLayout } from './layout';
import { SUN_RAY_REACH } from './sun-layout';
import { TAP_RADIUS } from './tap-reach';
import { viewAt } from './view';
import { EITHER_WAY } from './viewports';

const [sunX, sunY, sunR] = [300, 120, 40];
const sun = { x: sunX, y: sunY, r: sunR };

describe('the sun and the moon as the light turns', () => {
  it('the sun stands in its place by day and sinks by dusk', () => {
    assert.equal(sunSunk(40, 0), 0);
    assert.ok(sunSunk(40, 0.5) > 0);
    assert.ok(sunSunk(40, 1) > sunSunk(40, 0.5));
    assert.ok(sunSunk(40, 1) < 40, 'sinks less than its radius');
  });

  it('the moon rises from below into the sun’s place by dusk', () => {
    assert.ok(moonBelow(40, 0) > 0);
    assert.ok(moonBelow(40, 0.5) < moonBelow(40, 0));
    assert.equal(moonBelow(40, 1), 0);
    assert.deepEqual(moonAt(sun, 1), sun);
    assert.ok(moonAt(sun, 0.5).y > sunY);
  });

  it('stand where the view turns the sun to', () => {
    const { camera } = meadowLayout(1180, 820, 3);
    const ahead = viewAt(camera, { x: 0, y: 0, heading: 0 });
    assert.equal(sunOnScreen(ahead, sun).x, sunX);
    const turned = viewAt(camera, { x: 0, y: 0, heading: 0.3 });
    assert.ok(sunOnScreen(turned, sun).x < sunX, 'turning right moves it left');
    assert.equal(sunOnScreen(turned, sun).y, sunY);
  });
});

describe('a tap on the sun', () => {
  it('reaches its rays, and a finger’s reach on a small sun', () => {
    assert.equal(duskReach(40), 40 * SUN_RAY_REACH);
    assert.equal(duskReach(5), TAP_RADIUS);
  });

  it('lands within that reach and nowhere past it', () => {
    const reach = duskReach(sunR);
    assert.ok(onTheSun(sun, sun));
    assert.ok(onTheSun(sun, { x: sunX, y: sunY + reach - 1 }));
    assert.ok(!onTheSun(sun, { x: sunX + reach + 1, y: sunY }));
  });
});

describe('the stars beside the moon', () => {
  const star = { x: 0, y: sunY, r: 2 };
  const at = (apart: number) => starClear({ ...star, x: sunX + apart }, sun);
  const halo = sunR * SUN_RAY_REACH + star.r * STAR_RAY_REACH[1];

  it('none shows where the moon’s halo reaches', () => {
    assert.equal(at(0), 0);
    assert.equal(at(halo), 0);
  });

  it('fade back in past it, and show whole further out', () => {
    assert.ok(at(halo + 5) > 0 && at(halo + 5) < 1);
    assert.equal(at(halo + sunR * 2), 1);
  });

  for (const [name, width, height] of EITHER_WAY) {
    it(`every star shows whole beside the opening view’s risen moon on a ${name}`, () => {
      const layout = meadowLayout(width, height, 7);
      for (const each of duskStars(layout)) {
        assert.equal(starClear(each, moonAt(layout.sun, 1)), 1);
      }
    });
  }
});

describe('the scheme the page opens in', () => {
  it('follows Mantine’s resolved scheme where it writes one', () => {
    assert.equal(darkScheme('dark', false), true);
    assert.equal(darkScheme('light', true), false);
  });

  it('falls back to the system’s preference without it', () => {
    assert.equal(darkScheme(undefined, true), true);
    assert.equal(darkScheme(undefined, false), false);
    assert.equal(darkScheme('auto', true), true);
  });
});
