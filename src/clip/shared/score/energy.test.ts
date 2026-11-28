import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { energy, ENERGY_RATE } from './energy';
import { ENERGY_DIGITS } from './energy-data';
import { SONG_SECONDS } from './song';

const frame = (n: number) => n / ENERGY_RATE;

describe('energy', () => {
  it('reads a frame’s digit as ninths', () => {
    assert.equal(energy(frame(0), '09'), 0);
    assert.equal(energy(frame(1), '09'), 1);
    assert.equal(energy(frame(1), '036'), 1 / 3);
  });

  it('eases between frames', () => {
    assert.ok(Math.abs(energy(frame(0.5), '09') - 0.5) < 1e-12);
  });

  it('is 0 before the song and past its last frame', () => {
    assert.equal(energy(-1, '999'), 0);
    assert.equal(energy(frame(5), '999'), 0);
  });

  it('covers the whole song in digits', () => {
    assert.match(ENERGY_DIGITS, /^\d+$/u);
    assert.ok(Math.abs(ENERGY_DIGITS.length / ENERGY_RATE - SONG_SECONDS) < 1);
  });
});
