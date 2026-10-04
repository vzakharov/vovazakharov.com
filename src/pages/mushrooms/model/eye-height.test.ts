import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { meadowCamera } from '../ui/scene/meadow-camera';
import { VIEWPORTS } from '../ui/scene/viewports';
import {
  browDistance,
  D_SEE_MOST,
  FLIGHT_RISE,
  gaitHeight,
  heightAt,
  OPENING_RISE,
  RISE_EASE,
  riseFrom,
  walking,
} from './eye-height';
import { distanceBetween } from './geometry';
import { D_SEE, EYE_HEIGHT, OPENING_EYE } from './ground';
import { pinholeOf, planeSeen } from './pinhole';
import { lensAt, openingWalk, withGait } from './walk';

describe('eye height', () => {
  it('stands at the walking height in steps and FLIGHT_RISE times it in flight', () => {
    assert.equal(heightAt(OPENING_RISE, 'steps', 0), EYE_HEIGHT);
    assert.equal(gaitHeight('flight'), EYE_HEIGHT * FLIGHT_RISE);
    const rising = riseFrom(OPENING_RISE, 'steps', 3);
    assert.equal(heightAt(rising, 'flight', 3), EYE_HEIGHT);
    assert.equal(
      heightAt(rising, 'flight', 3 + RISE_EASE),
      gaitHeight('flight'),
    );
    assert.equal(heightAt(rising, 'flight', 30), gaitHeight('flight'));
  });

  it('rises without a jump, never past either height', () => {
    const rising = riseFrom(OPENING_RISE, 'steps', 0);
    const frame = 1 / 60;
    const most = (EYE_HEIGHT * (FLIGHT_RISE - 1) * 1.5 * frame) / RISE_EASE;
    let before = heightAt(rising, 'flight', 0);
    for (let time = frame; time <= RISE_EASE + frame; time += frame) {
      const now = heightAt(rising, 'flight', time);
      assert.ok(now >= before && now - before <= most, `at ${String(time)}`);
      before = now;
    }
  });

  it('settles from wherever a rise stands when the gait flips back mid-way', () => {
    const rising = riseFrom(OPENING_RISE, 'steps', 0);
    const midway = RISE_EASE / 3;
    const at = heightAt(rising, 'flight', midway);
    const settling = riseFrom(rising, 'flight', midway);
    assert.equal(heightAt(settling, 'steps', midway), at);
    assert.ok(heightAt(settling, 'steps', midway + 0.01) < at);
    assert.equal(heightAt(settling, 'steps', midway + RISE_EASE), EYE_HEIGHT);
  });

  it('stands the brow on the ground the screen shows at its top row', () => {
    for (const [name, width, height] of VIEWPORTS) {
      const camera = meadowCamera(width, height);
      for (const eyeHeight of [EYE_HEIGHT, gaitHeight('flight')]) {
        const lens = { ...camera, eyeHeight };
        const { x } = pinholeOf(camera);
        const top = { x, y: camera.groundTop };
        const under = planeSeen(lens, OPENING_EYE, top);
        assert.ok(under, name);
        const distance = distanceBetween(OPENING_EYE, under);
        assert.ok(
          Math.abs(distance - browDistance(lens)) < 1e-9 * D_SEE,
          `${name} at ${String(eyeHeight)}`,
        );
      }
    }
    assert.equal(browDistance(walking({})), D_SEE);
    const flown = browDistance({ eyeHeight: gaitHeight('flight') });
    assert.ok(Math.abs(flown - D_SEE_MOST) < 1e-9 * D_SEE);
  });

  it('lifts a walk switched to flight and settles it switched back', () => {
    const [, width, height] = VIEWPORTS[0];
    const walk = openingWalk(meadowCamera(width, height));
    assert.equal(lensAt(walk, 5).eyeHeight, EYE_HEIGHT);
    const flying = withGait(walk, 'flight', 5);
    assert.equal(flying.gait, 'flight');
    assert.equal(lensAt(flying, 5).eyeHeight, EYE_HEIGHT);
    assert.equal(lensAt(flying, 5 + RISE_EASE).eyeHeight, gaitHeight('flight'));
    const landing = withGait(flying, 'steps', 5 + RISE_EASE);
    assert.equal(
      lensAt(landing, 5 + RISE_EASE).eyeHeight,
      gaitHeight('flight'),
    );
    assert.equal(lensAt(landing, 5 + 2 * RISE_EASE).eyeHeight, EYE_HEIGHT);
  });
});
