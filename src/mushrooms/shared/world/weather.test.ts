import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { downpour, RAIN_MS, rainbow, raining, wetness } from './weather';

const START = 5000;
const SHOWER = { startedAt: START, stopsAt: START + RAIN_MS };
const { stopsAt: END } = SHOWER;

describe('raining', () => {
  it('rains from the start until the end, and never with no shower', () => {
    assert.equal(raining(undefined, START), false);
    assert.equal(raining(SHOWER, START - 1), false);
    assert.equal(raining(SHOWER, START), true);
    assert.equal(raining(SHOWER, END - 1), true);
    assert.equal(raining(SHOWER, END), false);
  });
});

describe('wetness', () => {
  it('is dry with no shower and before one', () => {
    assert.equal(wetness(undefined, START), 0);
    assert.equal(wetness(SHOWER, START - 100), 0);
    assert.equal(wetness(SHOWER, START), 0);
  });

  it('rises from the start, holds wet, and dries within 1.5 s of the end', () => {
    const early = wetness(SHOWER, START + 300);
    const later = wetness(SHOWER, START + 900);
    assert.ok(early > 0 && early < later && later < 1);
    assert.equal(wetness(SHOWER, START + 1500), 1);
    assert.equal(wetness(SHOWER, END), 1);
    const drying = wetness(SHOWER, END + 700);
    assert.ok(drying > 0 && drying < 1);
    assert.equal(wetness(SHOWER, END + 1500), 0);
  });

  it('never jumps from one 16 ms frame to the next', () => {
    for (let now = START - 500; now < END + 2000; now += 16) {
      const step = Math.abs(wetness(SHOWER, now + 16) - wetness(SHOWER, now));
      assert.ok(step < 0.03, `wetness jumps by ${step} at ${now}`);
    }
  });
});

describe('downpour', () => {
  it('comes on within 0.6 s and stops dead at the end', () => {
    assert.equal(downpour(undefined, START), 0);
    assert.equal(downpour(SHOWER, START - 1), 0);
    const coming = downpour(SHOWER, START + 300);
    assert.ok(coming > 0 && coming < 1);
    assert.equal(downpour(SHOWER, START + 600), 1);
    assert.equal(downpour(SHOWER, END - 1), 1);
    assert.equal(downpour(SHOWER, END), 0);
  });

  it('keeps falling in full when a restart moves the end on', () => {
    const restarted = { startedAt: START, stopsAt: END - 4000 + RAIN_MS };
    assert.equal(downpour(restarted, END + 1000), 1);
  });
});

describe('rainbow', () => {
  it('shows nothing with no shower or while it rains', () => {
    assert.equal(rainbow(undefined, END + 5000), 0);
    assert.equal(rainbow(SHOWER, START), 0);
    assert.equal(rainbow(SHOWER, END - 1), 0);
    assert.equal(rainbow(SHOWER, END), 0);
  });

  it('fades in over 1.5 s, holds 8 s, and fades out over 3 s', () => {
    const rising = rainbow(SHOWER, END + 700);
    assert.ok(rising > 0 && rising < 1);
    assert.equal(rainbow(SHOWER, END + 1500), 1);
    assert.equal(rainbow(SHOWER, END + 9500), 1);
    const fading = rainbow(SHOWER, END + 11_000);
    assert.ok(fading > 0 && fading < 1);
    assert.equal(rainbow(SHOWER, END + 12_500), 0);
    assert.equal(rainbow(SHOWER, END + 60_000), 0);
  });

  it('goes out when a new shower starts under it, until that one ends', () => {
    const tap = END + 4000;
    assert.equal(rainbow(SHOWER, tap), 1);
    const next = { startedAt: tap, stopsAt: tap + RAIN_MS };
    assert.equal(rainbow(next, tap), 0);
    assert.equal(rainbow(next, next.stopsAt - 1), 0);
    assert.equal(rainbow(next, next.stopsAt + 1500), 1);
  });
});
