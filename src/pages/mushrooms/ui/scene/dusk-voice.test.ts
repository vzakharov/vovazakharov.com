import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { mulberry32 } from '../../model/random';
import { chirpRhythm, fillChirps, MORNING, morningComes } from './dusk-voice';

/** The onsets of `onsets` that open a chirp: the ones further than a pulse's spacing after the last. */
function chirpStarts(onsets: readonly number[]): number[] {
  return onsets.filter(
    (onset, index) => index === 0 || onset - (onsets[index - 1] ?? 0) > 0.1,
  );
}

describe('chirpRhythm', () => {
  for (const seed of [1, 17, 29, 43, 1000]) {
    it(`seed ${seed}: chirps of 3 or 4 pulses, 0.6 to 1.4 s apart, round the loop too`, () => {
      const { onsets, loopSeconds } = chirpRhythm(mulberry32(seed));
      const starts = chirpStarts(onsets);
      const gaps = starts.map(
        (start, index) => (starts[index + 1] ?? loopSeconds) - start,
      );
      for (const gap of gaps) assert.ok(gap >= 0.6 && gap <= 1.4, `${gap}`);
      for (const start of starts) {
        const pulses = onsets.filter((at) => at >= start && at < start + 0.5);
        assert.ok(pulses.length === 3 || pulses.length === 4);
      }
      assert.ok(onsets.every((at) => at >= 0 && at < loopSeconds));
    });
  }

  it('a seed draws the same rhythm every time, and another seed another', () => {
    assert.deepEqual(chirpRhythm(mulberry32(17)), chirpRhythm(mulberry32(17)));
    assert.notDeepEqual(
      chirpRhythm(mulberry32(17)),
      chirpRhythm(mulberry32(29)),
    );
  });
});

describe('fillChirps', () => {
  const rate = 8000;

  it('sounds only through its pulses, at most at full scale, and silent between', () => {
    const samples = new Float32Array(rate);
    fillChirps(samples, rate, 4500, [0.1, 0.145]);
    const at = (seconds: number) => Math.round(seconds * rate);
    const loudest = (from: number, to: number) =>
      Math.max(
        ...samples.slice(at(from), at(to)).map((sample) => Math.abs(sample)),
      );
    assert.ok(loudest(0.1, 0.13) > 0.5);
    assert.ok(loudest(0, 1) <= 1);
    assert.equal(loudest(0, 0.1), 0);
    assert.equal(loudest(0.13, 0.145), 0);
    assert.equal(loudest(0.18, 1), 0);
  });

  it('a pulse past the end wraps to the start, as the loop plays it', () => {
    const samples = new Float32Array(rate);
    fillChirps(samples, rate, 4500, [0.99]);
    assert.ok(samples.slice(0, 200).some((sample) => sample !== 0));
  });
});

describe('morningComes', () => {
  it('only as the light passes under morning, turning toward day', () => {
    assert.equal(morningComes(MORNING + 0.01, MORNING - 0.01), true);
    assert.equal(morningComes(MORNING, MORNING - 0.01), true);
    assert.equal(morningComes(MORNING - 0.01, MORNING - 0.02), false);
    assert.equal(morningComes(MORNING - 0.01, MORNING + 0.01), false);
    assert.equal(morningComes(1, 1), false);
  });
});
