import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { fillPatter, layerLevel } from './rain-voice';

const LAYERS = [0, 1, 2];

describe('layerLevel', () => {
  it('is silent with no drops and every layer full in a full downpour', () => {
    for (const layer of LAYERS) {
      assert.equal(layerLevel(0, layer), 0);
      assert.equal(layerLevel(1, layer), 1);
    }
  });

  it('brings the layers in one after another, so the ticks come faster as the drops do', () => {
    let last = 0;
    for (let step = 0; step <= 100; step++) {
      const levels = LAYERS.map((layer) => layerLevel(step / 100, layer));
      const total = levels.reduce((sum, level) => sum + level, 0);
      assert.ok(total >= last, `at ${String(step)}`);
      last = total;
      for (const [layer, level] of levels.entries()) {
        const next = levels[layer + 1] ?? 0;
        assert.ok(
          next === 0 || level === 1,
          'a layer starts once the one before is full',
        );
      }
    }
  });
});

/** A source of the same "random" numbers, in turn. */
function cycling(values: readonly number[]): () => number {
  let index = 0;
  return () => values[index++ % values.length] ?? 0;
}

describe('fillPatter', () => {
  const rate = 48_000;

  it('rounds every tick in and out, so none of them clicks', () => {
    const samples = new Float32Array(rate);
    // One tick a second, at the start, at its highest pitch and loudest.
    fillPatter(samples, rate, 1, cycling([0, 1, 1]));
    assert.equal(samples[0], 0);
    const length = samples.findLastIndex((sample) => sample !== 0) + 1;
    assert.ok(length > 0 && length < rate / 50, 'one short tick');
    assert.ok(Math.abs(samples[length - 1] ?? 1) < 0.01, 'dies away');
    const loudest = Math.max(...samples.map((sample) => Math.abs(sample)));
    assert.ok(loudest > 0.5 && loudest <= 1);
  });

  it('wraps a tick past the end round to the start, as the loop plays it', () => {
    const samples = new Float32Array(rate);
    fillPatter(samples, rate, 1, cycling([0.9999, 0.5, 1]));
    assert.notEqual(samples[100], 0);
  });

  it('scatters as many ticks as the rate asks for', () => {
    const seconds = 2;
    const starts: number[] = [];
    const random = Math.random;
    fillPatter(new Float32Array(seconds * rate), rate, 7, () => {
      const value = random();
      starts.push(value);
      return value;
    });
    // Three numbers a tick: where, how high, how loud.
    assert.equal(starts.length, 3 * 7 * seconds);
  });
});
