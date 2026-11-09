import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { harmonicSlot, kneeEnvelope } from '@/island/entities/terrain';

import {
  degreeAmplitudes,
  equalWeights,
  fitEnvelope,
  logWeights,
} from './envelope-fit';

describe('degreeAmplitudes', () => {
  it('is the rms over a degree’s orders', () => {
    const series = new Float64Array(16);
    for (let m = -2; m <= 2; m += 1) series[harmonicSlot(2, m)] = 1;
    series[harmonicSlot(3, -1)] = 3;
    const amplitudes = degreeAmplitudes(series, 3);
    assert.equal(amplitudes[1], 0);
    assert.equal(amplitudes[2], 1);
    assert.ok(Math.abs((amplitudes[3] ?? 0) - 3 / Math.sqrt(7)) < 1e-15);
  });
});

describe('logWeights', () => {
  it('gives each degree its span of log l, summing to ln(L + ½) − ln ½', () => {
    const weights = logWeights(100);
    const total = weights.reduce((sum, w) => sum + w, 0);
    assert.ok(Math.abs(total - Math.log(100.5 / 0.5)) < 1e-12);
    assert.ok((weights[1] ?? 0) > 100 * (weights[100] ?? 0));
  });
});

describe('fitEnvelope', () => {
  const degree = 300;
  const truth = kneeEnvelope(7.3, 2.4);
  const amplitudes = new Float64Array(degree + 1);
  for (let l = 1; l <= degree; l += 1) amplitudes[l] = 42 * truth(l);

  for (const [name, weights] of [
    ['every degree equal', equalWeights(degree)],
    ['bins equal in log l', logWeights(degree)],
  ] as const) {
    it(`recovers a knee envelope exactly, ${name}`, () => {
      const fit = fitEnvelope(amplitudes, weights);
      assert.ok(Math.abs(fit.knee - 7.3) < 1e-9, `knee ${String(fit.knee)}`);
      assert.ok(Math.abs(fit.slope - 2.4) < 1e-9, `slope ${String(fit.slope)}`);
      assert.ok(
        Math.abs(fit.amplitude - 42) < 1e-6,
        `amplitude ${String(fit.amplitude)}`,
      );
      assert.ok(fit.residual < 1e-6);
    });
  }

  it('weighs the knee more in log bins than with every degree equal', () => {
    // Steeper than the envelope below l = 20, as a flat-then-falling spectrum
    // with a sharper shoulder: equal weights let the tail decide the slope.
    const bent = amplitudes.map((a, l) => (l > 0 && l < 20 ? a * (l / 20) : a));
    const equal = fitEnvelope(bent, equalWeights(degree));
    const log = fitEnvelope(bent, logWeights(degree));
    assert.ok(Math.abs(equal.slope - 2.4) < Math.abs(log.slope - 2.4));
  });
});
