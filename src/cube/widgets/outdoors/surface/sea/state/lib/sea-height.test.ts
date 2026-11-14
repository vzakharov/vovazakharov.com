import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { HOUR_SECONDS } from '@/cube/entities/island';

import { seaHeightAt } from './sea-height';

describe('seaHeightAt', () => {
  it('returns to itself on the hour', () => {
    for (const xz of [
      [400, 300],
      [-40, 45],
    ] as const) {
      for (const t of [0, 12.25, 1800.5]) {
        const now = seaHeightAt(xz, t);
        assert.ok(Math.abs(now - seaHeightAt(xz, t + HOUR_SECONDS)) < 1e-6);
      }
    }
  });

  it('stands as tall as the seas it is summed from, out at sea', () => {
    let sum = 0;
    let squares = 0;
    let count = 0;
    for (let x = 500; x < 2500; x += 37) {
      for (let t = 0; t < 600; t += 61) {
        const h = seaHeightAt([x, 0.3 * x], t);
        sum += h;
        squares += h * h;
        count += 1;
      }
    }
    const mean = sum / count;
    // Swell 0.5 m and breeze 0.22 m significant: four deviations of 0.137 m.
    const significant = 4 * Math.sqrt(squares / count - mean * mean);
    assert.ok(Math.abs(mean) < 0.03, String(mean));
    assert.ok(significant > 0.4 && significant < 0.7, String(significant));
  });

  it('moves a little in a tenth of a second and a lot in ten', () => {
    const xz = [600, -200] as const;
    const now = seaHeightAt(xz, 100);
    assert.ok(Math.abs(seaHeightAt(xz, 100.1) - now) < 0.05);
    let swing = 0;
    for (let t = 100; t < 110; t += 0.5) {
      swing = Math.max(swing, Math.abs(seaHeightAt(xz, t) - now));
    }
    assert.ok(swing > 0.05, String(swing));
  });
});
