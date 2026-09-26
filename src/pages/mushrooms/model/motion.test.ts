import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  bloom,
  BLOOM_DURATION,
  breath,
  drift,
  sway,
  widthFor,
  wobble,
  WOBBLE_DURATION,
} from './motion';

const samples = (duration: number) =>
  Array.from({ length: 400 }, (_, index) => (index / 400) * duration);

describe('wobble', () => {
  it('squashes first, then bounces back through rest', () => {
    assert.ok(wobble(0) < 0);
    assert.ok(samples(WOBBLE_DURATION).some((t) => wobble(t) > 0));
  });

  it('dies away, and is nothing outside its span', () => {
    const early = Math.max(...samples(0.3).map((t) => Math.abs(wobble(t))));
    const late = Math.max(
      ...samples(0.3).map((t) => Math.abs(wobble(t + WOBBLE_DURATION - 0.3))),
    );
    assert.ok(late < early / 20);
    assert.equal(wobble(-0.1), 0);
    assert.equal(wobble(WOBBLE_DURATION), 0);
  });
});

describe('bloom', () => {
  it('opens and settles back to rest', () => {
    assert.equal(bloom(0), 0);
    assert.ok(bloom(BLOOM_DURATION * 0.2) > 0.15);
    assert.ok(bloom(BLOOM_DURATION * 0.99) < 0.05);
    assert.equal(bloom(BLOOM_DURATION), 0);
  });
});

describe('the idle loops', () => {
  it('stay small and centred on rest', () => {
    for (const t of samples(20)) {
      assert.ok(Math.abs(breath(t, 1)) < 0.03);
      assert.ok(Math.abs(sway(t, 2)) <= 1);
    }
  });

  it('keep the volume through a squash', () => {
    for (const stretch of [-0.2, 0, 0.2]) {
      assert.ok(Math.abs((1 + stretch) * widthFor(stretch) ** 2 - 1) < 1e-9);
    }
  });
});

describe('drift', () => {
  it('wraps round its span, going either way', () => {
    assert.equal(drift(90, 20, 1, 100), 10);
    assert.equal(drift(10, -20, 1, 100), 90);
  });
});
