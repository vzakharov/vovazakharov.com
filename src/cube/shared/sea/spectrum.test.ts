import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { HOUR_SECONDS } from '../outside/swell';
import { amplitudesOf, bin, CASCADES, TILE } from './cascade';
import {
  coxMunk,
  dispersion,
  type Sea,
  slopeVariance,
  spectrumOf,
  spreading,
  turnsPerHour,
  windSea,
} from './spectrum';

const SWELL: Sea = {
  peakOmega: (2 * Math.PI * 420) / HOUR_SECONDS,
  significant: 0.5,
  sharpness: 8,
  towards: -Math.PI / 4,
  narrowness: 40,
  tailBend: 0,
};

describe('the sea spectrum', () => {
  it('spreads each frequency over the compass without losing any', () => {
    const steps = 3600;
    for (const omega of [0.4, SWELL.peakOmega, 1.5, 6]) {
      let sum = 0;
      for (let index = 0; index < steps; index += 1) {
        const theta = (index / steps) * 2 * Math.PI;
        sum += (spreading(omega, theta, SWELL) * 2 * Math.PI) / steps;
      }
      assert.ok(Math.abs(sum - 1) < 1e-3, `omega ${String(omega)}: ${sum}`);
    }
  });

  it('stands as tall as it is told', () => {
    const spectrum = spectrumOf([SWELL]);
    // Polar quadrature of the plane's variance about the swell's peak.
    let variance = 0;
    const rings = 600;
    const spokes = 720;
    for (let ring = 0; ring < rings; ring += 1) {
      const k = 0.005 + (ring / rings) * 0.6;
      for (let spoke = 0; spoke < spokes; spoke += 1) {
        const theta = (spoke / spokes) * 2 * Math.PI;
        variance +=
          spectrum.at(k * Math.cos(theta), k * Math.sin(theta)) *
          k *
          (0.6 / rings) *
          ((2 * Math.PI) / spokes);
      }
    }
    const height = 4 * Math.sqrt(variance);
    assert.ok(Math.abs(height - SWELL.significant) < 0.02, String(height));
  });

  it('is as rough as Cox and Munk measured under the wind that raised it', () => {
    for (const wind of [3, 5, 9]) {
      const sea = windSea(wind, 20_000, 0);
      assert.ok(Math.abs(slopeVariance(sea) / coxMunk(wind) - 1) < 1e-3);
    }
  });

  it('turns a whole number of times an hour at every wavenumber', () => {
    for (const k of [0.01, 0.0548, 1, 37, 400]) {
      const turns = turnsPerHour(k);
      assert.equal(turns, Math.round(turns));
      const exact = (dispersion(k) * HOUR_SECONDS) / (2 * Math.PI);
      assert.ok(Math.abs(turns - exact) <= 0.5);
    }
  });
});

describe('a cascade of rolled amplitudes', () => {
  const seas = [SWELL, windSea(3.5, 15_000, -0.35)];

  it('is the same draw every time', () => {
    assert.deepEqual(amplitudesOf(seas, 2).waves, amplitudesOf(seas, 2).waves);
  });

  it('keeps to its own band and pairs each wave with its opposite', () => {
    for (const [index, cascade] of CASCADES.entries()) {
      const { waves } = amplitudesOf(seas, index);
      const step = (2 * Math.PI) / cascade.tileSide;
      for (let j = 0; j < TILE; j += 7) {
        for (let i = 0; i < TILE; i += 5) {
          const at = (j * TILE + i) * 4;
          const k = Math.hypot(bin(i), bin(j)) * step;
          const inside = k >= cascade.kFrom && k < cascade.kTo;
          if (!inside) assert.equal(waves[at], 0);
          const mirror = (((TILE - j) % TILE) * TILE + ((TILE - i) % TILE)) * 4;
          assert.equal(waves[at + 2], waves[mirror]);
          assert.equal(waves[at + 3], -(waves[mirror + 1] ?? 0));
        }
      }
    }
  });

  it('carries the variance the spectrum gives its band', () => {
    // The swell lives in the first cascade alone.
    const { waves } = amplitudesOf([SWELL], 0);
    let variance = 0;
    for (let at = 0; at < waves.length; at += 4) {
      variance += 2 * ((waves[at] ?? 0) ** 2 + (waves[at + 1] ?? 0) ** 2);
    }
    const height = 4 * Math.sqrt(variance);
    // One draw of a few hundred waves: within a fifth of the mean.
    assert.ok(Math.abs(height / SWELL.significant - 1) < 0.2, String(height));
  });
});
