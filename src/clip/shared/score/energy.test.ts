import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { energy, ENERGY_RATE, voice } from './energy';
import { ENERGY_DIGITS } from './energy-data';
import { SONG_SECONDS } from './song';
import { VOICE_DIGITS } from './voice-data';

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

describe('voice', () => {
  it('reads the stem as energy reads the mix', () => {
    assert.equal(voice(frame(1), '09'), undefined);
    assert.ok(Math.abs((voice(frame(0.5), '09') ?? -1) - 0.5) < 1e-12);
  });

  it('has nothing before the song or past the stem’s last frame', () => {
    assert.equal(voice(-0.1, '999'), undefined);
    assert.equal(voice(frame(2), '999'), undefined);
    assert.equal(voice(frame(1.5), '999'), 1);
  });

  it('runs on the master’s clock until the stem ends, short of the last «Хорошо!»', () => {
    assert.match(VOICE_DIGITS, /^\d+$/u);
    const end = VOICE_DIGITS.length / ENERGY_RATE;
    assert.ok(end > 85 && end < 95, String(end));
    assert.equal(voice(SONG_SECONDS - 4), undefined);
  });
});
