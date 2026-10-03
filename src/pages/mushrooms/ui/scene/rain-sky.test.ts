import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { RAIN_MS, rainbow, wetness } from '../../model/weather';
import { meadowLayout } from './layout';
import { PALETTE } from './palette';
import { azimuthAt } from './panorama';
import {
  cloudAt,
  cloudDarkness,
  cloudLag,
  DARKEN_LAG_MS,
  nextShowers,
  NO_SHOWERS,
  RAINBOW_OUT_MS,
  rainbowArc,
  rainbowShown,
  wetnessShown,
} from './rain-sky';
import { TAP_RADIUS } from './tap-reach';
import { VIEWPORTS } from './viewports';

const first = { startedAt: 0, stopsAt: RAIN_MS };

describe('nextShowers', () => {
  it('keeps the same showers while the span stands', () => {
    const showers = nextShowers(NO_SHOWERS, first, 0);
    assert.equal(nextShowers(showers, first, 500), showers);
  });

  it('takes a restart as the same shower', () => {
    const showers = nextShowers(NO_SHOWERS, first, 0);
    const pushed = { startedAt: 0, stopsAt: RAIN_MS + 4000 };
    assert.deepEqual(nextShowers(showers, pushed, 4000), {
      span: pushed,
      before: undefined,
    });
  });

  it('puts a replaced shower behind a new one, with when', () => {
    const showers = nextShowers(NO_SHOWERS, first, 0);
    const next = { startedAt: 12_000, stopsAt: 22_000 };
    assert.deepEqual(nextShowers(showers, next, 12_000), {
      span: next,
      before: { rain: first, at: 12_000 },
    });
  });
});

describe('wetnessShown', () => {
  it('follows the shower', () => {
    const showers = { span: first, before: undefined };
    for (const now of [0, 700, 5000, RAIN_MS + 700]) {
      assert.equal(wetnessShown(showers, now), wetness(first, now));
    }
  });

  it('never jumps as a new shower starts under a drying one', () => {
    const now = RAIN_MS + 500;
    const was = wetness(first, now);
    assert.ok(was > 0);
    const next = { startedAt: now, stopsAt: now + RAIN_MS };
    const showers = nextShowers({ span: first, before: undefined }, next, now);
    assert.equal(wetnessShown(showers, now), was);
    for (let at = now; at < now + 2000; at += 50) {
      const step = wetnessShown(showers, at + 50) - wetnessShown(showers, at);
      assert.ok(Math.abs(step) < 0.1);
    }
  });
});

describe('cloud darkening', () => {
  it('starts with the tapped cloud and lags at most DARKEN_LAG_MS', () => {
    assert.equal(cloudLag(1, 1), 0);
    assert.ok(Math.abs(cloudLag(1 + Math.PI, 1) - DARKEN_LAG_MS) < 1e-6);
    assert.ok(cloudLag(1.5, 1) < cloudLag(2.5, 1));
    assert.equal(cloudLag(3, undefined), DARKEN_LAG_MS / 2);
  });

  it('darkens a lagging cloud later than the tapped one', () => {
    const showers = { span: first, before: undefined };
    assert.ok(
      cloudDarkness(showers, 700, 0) > cloudDarkness(showers, 700, 500),
    );
    assert.equal(cloudDarkness(showers, 5000, DARKEN_LAG_MS), 1);
  });
});

describe('rainbowShown', () => {
  it('follows the model after a shower', () => {
    const showers = { span: first, before: undefined };
    const now = RAIN_MS + 3000;
    assert.equal(rainbowShown(showers, now), rainbow(first, now));
  });

  it('fades out from where it stood when a new shower starts under it', () => {
    const at = RAIN_MS + 3000;
    const stood = rainbow(first, at);
    assert.ok(stood > 0.9);
    const next = { startedAt: at, stopsAt: at + RAIN_MS };
    const showers = nextShowers({ span: first, before: undefined }, next, at);
    assert.equal(rainbowShown(showers, at), stood);
    const half = rainbowShown(showers, at + RAINBOW_OUT_MS / 2);
    assert.ok(half > 0 && half < stood);
    assert.equal(rainbowShown(showers, at + RAINBOW_OUT_MS), 0);
  });
});

describe('cloudAt', () => {
  const clouds = [
    { x: 100, y: 60, r: 20 },
    undefined,
    { x: 150, y: 60, r: 20 },
  ];

  it('takes a tap across the drawn puffs, the nearest middle winning', () => {
    assert.equal(cloudAt({ x: 30, y: 60 }, clouds), 0);
    assert.equal(cloudAt({ x: 120, y: 60 }, clouds), 0);
    assert.equal(cloudAt({ x: 130, y: 60 }, clouds), 2);
    assert.equal(cloudAt({ x: 19, y: 60 }, clouds), undefined);
  });

  it('reaches at least TAP_RADIUS up and down', () => {
    assert.equal(cloudAt({ x: 100, y: 60 - TAP_RADIUS }, clouds), 0);
    assert.equal(cloudAt({ x: 100, y: 60 + TAP_RADIUS }, clouds), 0);
    assert.equal(cloudAt({ x: 100, y: 61 + TAP_RADIUS }, clouds), undefined);
  });

  it('leaves a cloud off the screen alone', () => {
    assert.equal(cloudAt({ x: 100, y: 60 }, [undefined]), undefined);
  });
});

describe('rainbowArc', () => {
  for (const [name, width, height] of VIEWPORTS) {
    const layout = meadowLayout(width, height, 1);
    const arc = rainbowArc(layout);
    const { camera, sun, horizon, nearHills } = layout;

    it(`stands opposite the sun round the sky on the ${name}`, () => {
      const apart = azimuthAt(camera, arc.x) - azimuthAt(camera, sun.x);
      assert.ok(Math.abs(apart - Math.PI) < 1e-9);
    });

    it(`rises well clear of the horizon on the ${name}, its top on the screen`, () => {
      assert.ok(arc.y - arc.r >= 0);
      assert.ok(horizon - (arc.y - arc.r) >= 0.2 * nearHills);
      assert.ok(arc.r - PALETTE.rainbow.length * arc.band > 0);
    });
  }
});
