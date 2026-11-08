import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  coefficientOf,
  encodeCoefficient,
  envelope,
  ENVELOPE_SCALE,
} from './harmonic';
import { HARMONIC_COUNT, harmonicWord, K, wavevectorOf } from './layout';
import { worldWords } from './mask';
import { wavesOf } from './world-field';

/** `Σ 2|c_k|²` over the half-plane's `k ≠ 0`: the waves' variance by Parseval. */
function parsevalVariance(words: Uint32Array): number {
  let sum = 0;
  for (let h = 1; h < HARMONIC_COUNT; h += 1) {
    const { re, im } = coefficientOf(
      wavevectorOf(h),
      words[harmonicWord(h, 'phase')] ?? Number.NaN,
      words[harmonicWord(h, 'factor')] ?? Number.NaN,
    );
    sum += 2 * (re * re + im * im);
  }
  return sum;
}

function variance(values: Float64Array): number {
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  return values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
}

describe('envelope', () => {
  it('is scaled so the waves’ expected spread over the square is 0.45', () => {
    let sum = 0;
    for (let kx = -K; kx <= K; kx += 1) {
      for (let ky = -K; ky <= K; ky += 1) {
        // The variance of `2·e(k)·f·cos(…)` is `2·e(k)²`, half of it per `±k`.
        if (kx !== 0 || ky !== 0)
          sum += (envelope({ kx, ky }) / ENVELOPE_SCALE) ** 2;
      }
    }
    assert.ok(Math.abs(ENVELOPE_SCALE - 0.45 / Math.sqrt(sum)) < 1e-15);
    assert.equal(envelope({ kx: 0, ky: 0 }), ENVELOPE_SCALE);
    assert.equal(envelope({ kx: 1, ky: 0 }), ENVELOPE_SCALE);
    assert.equal(envelope({ kx: 3, ky: -4 }), ENVELOPE_SCALE / 25);
  });

  it('gives a synthesized world the variance Parseval says', () => {
    const words = worldWords('2');
    const synthesized = variance(wavesOf(words));
    const parseval = parsevalVariance(words);
    assert.ok(
      Math.abs(synthesized / parseval - 1) < 1e-9,
      `${synthesized} vs ${parseval}`,
    );
  });

  it('averages to a spread of 0.45 over many worlds', () => {
    const worlds = 200;
    let sum = 0;
    for (let w = 1; w <= worlds; w += 1)
      sum += parsevalVariance(worldWords(String(w)));
    const spread = Math.sqrt(sum / worlds);
    // One world's variance spreads ~70% (four modes carry two-thirds of it).
    assert.ok(Math.abs(spread - 0.45) < 0.45 * 0.1, `spread ${spread}`);
  });
});

describe('coefficientOf / encodeCoefficient', () => {
  it('round-trips a coefficient through its words', () => {
    for (const [kx, ky, re, im] of [
      [1, 0, 0.1, -0.05],
      [-128, 7, -1e-6, 2e-6],
      [3, 4, 0, -0.003],
      [0, 1, -0.2, 0],
    ] as const) {
      const k = { kx, ky };
      const { phaseWord, factorWord } = encodeCoefficient(k, { re, im });
      const back = coefficientOf(k, phaseWord, factorWord);
      const scale = Math.hypot(re, im);
      assert.ok(
        Math.hypot(back.re - re, back.im - im) < scale * 1e-8,
        `${kx}, ${ky}`,
      );
    }
  });

  it('keeps k = 0 real, either sign', () => {
    const k = { kx: 0, ky: 0 };
    for (const re of [0.07, -0.13]) {
      const { phaseWord, factorWord } = encodeCoefficient(k, { re, im: 0 });
      const back = coefficientOf(k, phaseWord, factorWord);
      assert.equal(back.im, 0);
      assert.ok(Math.abs(back.re - re) < 1e-9);
    }
    assert.equal(coefficientOf(k, 12_345, 2 ** 31).im, 0);
  });
});
