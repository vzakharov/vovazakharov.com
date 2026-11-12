import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import type { Rgb } from '@/cube/shared/lib/colour';

import { between } from './palette';

const shade = (n: number): Rgb => [n / 10, 0, 1 - n / 10];

const close = (actual: Rgb, expected: Rgb) => {
  for (const [i, value] of expected.entries()) {
    assert.ok(Math.abs((actual[i] ?? Number.NaN) - value) < 1e-9);
  }
};

describe('between', () => {
  it('passes from one floor’s colour to the next’s as an eye halves', () => {
    close(between(shade, 3), shade(3));
    close(between(shade, 4 - 1e-12), shade(4));
    close(between(shade, 3.5), [0.35, 0, 0.65]);
  });

  it('asks nothing of the floor below one an eye stands on', () => {
    const deepest = (n: number): Rgb => {
      if (n > 3) throw new RangeError(`no floor ${String(n)}`);
      return shade(n);
    };
    close(between(deepest, 3), shade(3));
  });
});
